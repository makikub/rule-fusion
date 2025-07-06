import { StaticEngine } from '../engines/static-engine';
import { FileParser } from '../utils/file-parser';
import { RuleFusionConfig } from '../types/config';
import { DetectedFile } from '../core/file-detector';

describe('StaticEngine', () => {
  let staticEngine: StaticEngine;
  let mockFileParser: jest.Mocked<FileParser>;
  let config: RuleFusionConfig;

  beforeEach(() => {
    config = {
      tools: {
        copilot: { include: ['.copilot/**/*.yml'] },
        cursor: { include: ['.cursor/**/*.md'] }
      },
      exclude: [],
      rules: {
        'duplicate-key': 'error',
        'undefined-ref': 'error',
        'priority-cycle': 'error',
        'range-conflict': 'warning'
      }
    };

    mockFileParser = {
      parseFile: jest.fn()
    } as any;

    staticEngine = new StaticEngine(config, mockFileParser);
  });

  describe('analyze', () => {
    it('should detect duplicate keys across tools', async () => {
      const files: DetectedFile[] = [
        { path: 'copilot.yml', tool: 'copilot', type: 'yaml' },
        { path: 'cursor.md', tool: 'cursor', type: 'markdown' }
      ];

      mockFileParser.parseFile
        .mockResolvedValueOnce({
          data: { 'coding-style': { indent: 2 } }
        })
        .mockResolvedValueOnce({
          data: { 'coding-style': { indent: 4 } }
        });

      const violations = await staticEngine.analyze(files);

      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.rule === 'duplicate-key')).toBeTruthy();
      expect(violations.some(v => v.message.includes('Duplicate key'))).toBeTruthy();
    });

    it('should detect undefined references', async () => {
      const files: DetectedFile[] = [
        { path: 'test.yml', tool: 'copilot', type: 'yaml' }
      ];

      mockFileParser.parseFile.mockResolvedValueOnce({
        data: { 
          reference: '${undefined-key}',
          existing: 'value'
        }
      });

      const violations = await staticEngine.analyze(files);

      expect(violations).toHaveLength(1);
      expect(violations[0].rule).toBe('undefined-ref');
      expect(violations[0].message).toContain('Undefined reference "undefined-key"');
    });

    it('should detect range conflicts', async () => {
      const files: DetectedFile[] = [
        { path: 'file1.yml', tool: 'copilot', type: 'yaml' },
        { path: 'file2.yml', tool: 'cursor', type: 'yaml' }
      ];

      mockFileParser.parseFile
        .mockResolvedValueOnce({
          data: { 'line-length': { min: 80, max: 120 } }
        })
        .mockResolvedValueOnce({
          data: { 'line-length': { min: 100, max: 140 } }
        });

      const violations = await staticEngine.analyze(files);

      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.rule === 'range-conflict')).toBeTruthy();
      expect(violations.some(v => v.message.includes('Range conflict'))).toBeTruthy();
    });
  });
});