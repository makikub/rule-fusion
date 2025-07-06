import { ConfigParser } from '../core/config-parser';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('ConfigParser', () => {
  let configParser: ConfigParser;

  beforeEach(() => {
    configParser = new ConfigParser();
    jest.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should return default config when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const config = configParser.loadConfig();

      expect(config).toEqual({
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
        ai: { enabled: false },
        bestPractices: { enabled: false }
      });
    });

    it('should load valid YAML configuration', () => {
      const yamlContent = `
tools:
  copilot:
    include: ['.copilot/**/*.yml']
  cursor:
    include: ['.cursor/**/*.md']
  claude:
    include: ['CLAUDE.md']
rules:
  duplicate-key: error
  undefined-ref: error
  priority-cycle: error
  range-conflict: warning
`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(yamlContent);

      const config = configParser.loadConfig();

      expect(config.tools.copilot.include).toEqual(['.copilot/**/*.yml']);
      expect(config.rules['duplicate-key']).toBe('error');
    });

    it('should throw error for invalid configuration', () => {
      const invalidYaml = `
tools:
  copilot:
    include: "not-an-array"
rules:
  duplicate-key: error
`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(invalidYaml);

      expect(() => configParser.loadConfig()).toThrow('Invalid configuration');
    });
  });
});