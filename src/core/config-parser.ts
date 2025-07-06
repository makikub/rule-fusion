import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import Ajv from 'ajv';
import { RuleFusionConfig } from '../types/config';

const configSchema = {
  type: 'object',
  properties: {
    tools: {
      type: 'object',
      patternProperties: {
        '.*': {
          type: 'object',
          properties: {
            include: {
              type: 'array',
              items: { type: 'string' }
            },
            exclude: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['include']
        }
      }
    },
    exclude: {
      type: 'array',
      items: { type: 'string' }
    },
    rules: {
      type: 'object',
      properties: {
        'duplicate-key': { enum: ['error', 'warning', 'off'] },
        'undefined-ref': { enum: ['error', 'warning', 'off'] },
        'priority-cycle': { enum: ['error', 'warning', 'off'] },
        'range-conflict': { enum: ['error', 'warning', 'off'] }
      },
      required: ['duplicate-key', 'undefined-ref', 'priority-cycle', 'range-conflict']
    },
    ai: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        provider: { type: 'string' },
        model: { type: 'string' }
      },
      required: ['enabled']
    },
    bestPractices: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        catalogs: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['enabled']
    }
  },
  required: ['tools', 'rules']
};

export class ConfigParser {
  private ajv = new Ajv();
  private validate = this.ajv.compile(configSchema);

  public loadConfig(configPath?: string): RuleFusionConfig {
    const defaultConfigPath = '.rulefusion.yml';
    const finalConfigPath = configPath || defaultConfigPath;

    if (!fs.existsSync(finalConfigPath)) {
      return this.getDefaultConfig();
    }

    try {
      const configContent = fs.readFileSync(finalConfigPath, 'utf8');
      const config = yaml.load(configContent) as RuleFusionConfig;

      if (!this.validate(config)) {
        throw new Error(`Invalid configuration: ${this.ajv.errorsText(this.validate.errors)}`);
      }

      return config;
    } catch (error) {
      throw new Error(`Failed to load configuration from ${finalConfigPath}: ${error}`);
    }
  }

  private getDefaultConfig(): RuleFusionConfig {
    return {
      tools: {
        copilot: { include: ['.copilot/**/*.yml', '.copilot/**/*.yaml'] },
        cursor: { include: ['.cursor/**/*.md'] },
        claude: { include: ['.claude/**/*.yml', '.claude/**/*.yaml', 'CLAUDE.md'] }
      },
      exclude: ['node_modules/**', 'dist/**', 'build/**'],
      rules: {
        'duplicate-key': 'error',
        'undefined-ref': 'error',
        'priority-cycle': 'error',
        'range-conflict': 'warning'
      },
      ai: {
        enabled: false
      },
      bestPractices: {
        enabled: false
      }
    };
  }
}