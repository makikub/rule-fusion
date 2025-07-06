import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { DetectedFile } from '../core/file-detector';

export interface ParsedContent {
  data: any;
  frontmatter?: any;
  sections?: { [key: string]: any };
}

export class FileParser {
  public async parseFile(file: DetectedFile): Promise<ParsedContent> {
    const content = fs.readFileSync(file.path, 'utf8');

    switch (file.type) {
      case 'yaml':
        return this.parseYaml(content);
      case 'json':
        return this.parseJson(content);
      case 'markdown':
        return this.parseMarkdown(content);
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  private parseYaml(content: string): ParsedContent {
    try {
      const data = yaml.load(content);
      return { data };
    } catch (error) {
      throw new Error(`Failed to parse YAML: ${error}`);
    }
  }

  private parseJson(content: string): ParsedContent {
    try {
      const data = JSON.parse(content);
      return { data };
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error}`);
    }
  }

  private parseMarkdown(content: string): ParsedContent {
    try {
      const sections: { [key: string]: any } = {};
      let frontmatter: any = null;

      const lines = content.split('\n');
      let currentSection = '';
      let currentContent: string[] = [];
      let inFrontmatter = false;
      let frontmatterLines: string[] = [];

      for (const line of lines) {
        if (line.trim() === '---') {
          if (!inFrontmatter) {
            inFrontmatter = true;
            continue;
          } else {
            try {
              frontmatter = yaml.load(frontmatterLines.join('\n'));
            } catch (e) {
              // Ignore frontmatter parse errors
            }
            inFrontmatter = false;
            frontmatterLines = [];
            continue;
          }
        }

        if (inFrontmatter) {
          frontmatterLines.push(line);
          continue;
        }

        if (line.startsWith('## ')) {
          if (currentSection) {
            sections[currentSection] = this.parseMarkdownSection(currentContent.join('\n'));
          }
          currentSection = line.replace('## ', '').trim();
          currentContent = [];
        } else if (currentSection) {
          currentContent.push(line);
        }
      }

      if (currentSection) {
        sections[currentSection] = this.parseMarkdownSection(currentContent.join('\n'));
      }

      return {
        data: sections,
        frontmatter,
        sections
      };
    } catch (error) {
      throw new Error(`Failed to parse Markdown: ${error}`);
    }
  }


  private parseMarkdownSection(content: string): any {
    const lines = content.split('\n').filter(line => line.trim());
    const rules: { [key: string]: any } = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const ruleText = trimmed.substring(1).trim();
        const colonIndex = ruleText.indexOf(':');
        if (colonIndex > 0) {
          const key = ruleText.substring(0, colonIndex).trim();
          const value = ruleText.substring(colonIndex + 1).trim();
          rules[key] = value;
        }
      }
    }

    return Object.keys(rules).length > 0 ? rules : content;
  }
}