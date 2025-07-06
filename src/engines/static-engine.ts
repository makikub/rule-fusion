import { RuleFusionConfig, RuleViolation } from '../types/config';
import { DetectedFile } from '../core/file-detector';
import { FileParser, ParsedContent } from '../utils/file-parser';

export class StaticEngine {
  constructor(
    private config: RuleFusionConfig,
    private fileParser: FileParser
  ) {}

  public async analyze(files: DetectedFile[]): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];
    const allParsedFiles: { file: DetectedFile; content: ParsedContent }[] = [];

    for (const file of files) {
      try {
        const content = await this.fileParser.parseFile(file);
        allParsedFiles.push({ file, content });
      } catch (error) {
        violations.push({
          rule: 'parse-error',
          level: 'error',
          message: `Failed to parse file: ${error}`,
          file: file.path
        });
      }
    }

    violations.push(...this.checkDuplicateKeys(allParsedFiles));
    violations.push(...this.checkUndefinedReferences(allParsedFiles));
    violations.push(...this.checkPriorityCycles(allParsedFiles));
    violations.push(...this.checkRangeConflicts(allParsedFiles));

    return violations;
  }

  private checkDuplicateKeys(parsedFiles: { file: DetectedFile; content: ParsedContent }[]): RuleViolation[] {
    if (this.config.rules['duplicate-key'] === 'off') return [];

    const violations: RuleViolation[] = [];
    const keyMap = new Map<string, { file: string; tools: string[] }>();

    for (const { file, content } of parsedFiles) {
      const keys = this.extractKeys(content);
      
      for (const key of keys) {
        const existing = keyMap.get(key);
        if (existing) {
          if (!existing.tools.includes(file.tool)) {
            existing.tools.push(file.tool);
            violations.push({
              rule: 'duplicate-key',
              level: this.config.rules['duplicate-key'],
              message: `Duplicate key "${key}" found across tools: ${existing.tools.join(', ')}`,
              file: file.path
            });
          }
        } else {
          keyMap.set(key, { file: file.path, tools: [file.tool] });
        }
      }
    }

    return violations;
  }

  private checkUndefinedReferences(parsedFiles: { file: DetectedFile; content: ParsedContent }[]): RuleViolation[] {
    if (this.config.rules['undefined-ref'] === 'off') return [];

    const violations: RuleViolation[] = [];
    const allKeys = new Set<string>();
    const references = new Map<string, { file: string; refs: string[] }>();

    for (const { file, content } of parsedFiles) {
      const keys = this.extractKeys(content);
      keys.forEach(key => allKeys.add(key));

      const refs = this.extractReferences(content);
      if (refs.length > 0) {
        references.set(file.path, { file: file.path, refs });
      }
    }

    for (const [filePath, { refs }] of references) {
      for (const ref of refs) {
        if (!allKeys.has(ref)) {
          violations.push({
            rule: 'undefined-ref',
            level: this.config.rules['undefined-ref'],
            message: `Undefined reference "${ref}" found`,
            file: filePath
          });
        }
      }
    }

    return violations;
  }

  private checkPriorityCycles(parsedFiles: { file: DetectedFile; content: ParsedContent }[]): RuleViolation[] {
    if (this.config.rules['priority-cycle'] === 'off') return [];

    const violations: RuleViolation[] = [];
    const dependencies = new Map<string, string[]>();

    for (const { file, content } of parsedFiles) {
      const deps = this.extractDependencies(content);
      if (deps.size > 0) {
        const key = this.getFileKey(file);
        dependencies.set(key, Array.from(deps));
      }
    }

    const cycles = this.detectCycles(dependencies);
    for (const cycle of cycles) {
      const cycleFiles = cycle.map(key => this.getFileFromKey(key, parsedFiles));
      violations.push({
        rule: 'priority-cycle',
        level: this.config.rules['priority-cycle'],
        message: `Priority cycle detected: ${cycle.join(' -> ')}`,
        file: cycleFiles[0]?.file.path || 'unknown'
      });
    }

    return violations;
  }

  private checkRangeConflicts(parsedFiles: { file: DetectedFile; content: ParsedContent }[]): RuleViolation[] {
    if (this.config.rules['range-conflict'] === 'off') return [];

    const violations: RuleViolation[] = [];
    const ranges = new Map<string, { min: number; max: number; file: string }>();

    for (const { file, content } of parsedFiles) {
      const fileRanges = this.extractRanges(content);
      
      for (const [key, range] of fileRanges) {
        const existing = ranges.get(key);
        if (existing) {
          if (this.rangesOverlap(existing, range)) {
            violations.push({
              rule: 'range-conflict',
              level: this.config.rules['range-conflict'],
              message: `Range conflict for "${key}": [${existing.min}-${existing.max}] vs [${range.min}-${range.max}]`,
              file: file.path
            });
          }
        } else {
          ranges.set(key, { ...range, file: file.path });
        }
      }
    }

    return violations;
  }

  private extractKeys(content: ParsedContent): string[] {
    const keys: string[] = [];
    
    if (content.data && typeof content.data === 'object') {
      this.collectKeys(content.data, keys);
    }

    return keys;
  }

  private collectKeys(obj: any, keys: string[], prefix = ''): void {
    if (typeof obj === 'object' && obj !== null) {
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(fullKey);
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.collectKeys(obj[key], keys, fullKey);
        }
      }
    }
  }

  private extractReferences(content: ParsedContent): string[] {
    const refs: string[] = [];
    const refPattern = /\$\{([^}]+)\}/g;
    
    const text = JSON.stringify(content.data);
    let match;
    
    while ((match = refPattern.exec(text)) !== null) {
      refs.push(match[1]);
    }

    return refs;
  }

  private extractDependencies(content: ParsedContent): Set<string> {
    const deps = new Set<string>();
    
    if (content.data?.dependencies) {
      if (Array.isArray(content.data.dependencies)) {
        content.data.dependencies.forEach((dep: string) => deps.add(dep));
      }
    }

    return deps;
  }

  private extractRanges(content: ParsedContent): Map<string, { min: number; max: number }> {
    const ranges = new Map<string, { min: number; max: number }>();
    
    if (content.data && typeof content.data === 'object') {
      this.collectRanges(content.data, ranges);
    }

    return ranges;
  }

  private collectRanges(obj: any, ranges: Map<string, { min: number; max: number }>, prefix = ''): void {
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
          if ('min' in value && 'max' in value && typeof value.min === 'number' && typeof value.max === 'number') {
            ranges.set(fullKey, { min: value.min, max: value.max });
          } else {
            this.collectRanges(value, ranges, fullKey);
          }
        }
      }
    }
  }

  private detectCycles(dependencies: Map<string, string[]>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const node of dependencies.keys()) {
      if (!visited.has(node)) {
        this.dfsForCycles(node, dependencies, visited, recursionStack, [], cycles);
      }
    }

    return cycles;
  }

  private dfsForCycles(
    node: string,
    dependencies: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[],
    cycles: string[][]
  ): void {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const deps = dependencies.get(node) || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        this.dfsForCycles(dep, dependencies, visited, recursionStack, path, cycles);
      } else if (recursionStack.has(dep)) {
        const cycleStart = path.indexOf(dep);
        if (cycleStart >= 0) {
          cycles.push([...path.slice(cycleStart), dep]);
        }
      }
    }

    recursionStack.delete(node);
    path.pop();
  }

  private rangesOverlap(range1: { min: number; max: number }, range2: { min: number; max: number }): boolean {
    return range1.min <= range2.max && range2.min <= range1.max;
  }

  private getFileKey(file: DetectedFile): string {
    return `${file.tool}:${file.path}`;
  }

  private getFileFromKey(key: string, parsedFiles: { file: DetectedFile; content: ParsedContent }[]): { file: DetectedFile; content: ParsedContent } | undefined {
    const [tool, path] = key.split(':', 2);
    return parsedFiles.find(pf => pf.file.tool === tool && pf.file.path === path);
  }
}