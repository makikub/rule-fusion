import { glob } from 'glob';
import { minimatch } from 'minimatch';
import * as path from 'path';
import { RuleFusionConfig } from '../types/config';

export interface DetectedFile {
  path: string;
  tool: string;
  type: 'yaml' | 'json' | 'markdown';
}

export class FileDetector {
  constructor(private config: RuleFusionConfig) {}

  public async detectFiles(): Promise<DetectedFile[]> {
    const detectedFiles: DetectedFile[] = [];

    for (const [toolName, toolConfig] of Object.entries(this.config.tools)) {
      for (const includePattern of toolConfig.include) {
        const files = await this.globFiles(includePattern);
        
        for (const file of files) {
          if (this.shouldExcludeFile(file, toolConfig.exclude)) {
            continue;
          }

          const fileType = this.detectFileType(file);
          if (fileType) {
            detectedFiles.push({
              path: file,
              tool: toolName,
              type: fileType
            });
          }
        }
      }
    }

    return detectedFiles;
  }

  private async globFiles(pattern: string): Promise<string[]> {
    try {
      return await glob(pattern);
    } catch (error) {
      throw error;
    }
  }

  private shouldExcludeFile(filePath: string, toolExcludes?: string[]): boolean {
    const allExcludes = [
      ...(this.config.exclude || []),
      ...(toolExcludes || [])
    ];

    for (const excludePattern of allExcludes) {
      if (minimatch(filePath, excludePattern)) {
        return true;
      }
    }

    return false;
  }

  private detectFileType(filePath: string): 'yaml' | 'json' | 'markdown' | null {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.yml':
      case '.yaml':
        return 'yaml';
      case '.json':
        return 'json';
      case '.md':
      case '.markdown':
        return 'markdown';
      default:
        return null;
    }
  }
}