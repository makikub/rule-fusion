#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigParser } from './core/config-parser';
import { FileDetector } from './core/file-detector';
import { FileParser } from './utils/file-parser';
import { StaticEngine } from './engines/static-engine';
import { ConsoleReporter } from './reporters/console-reporter';
import { AnalysisResult } from './types/config';

const program = new Command();

program
  .name('rulefusion')
  .description('Static analysis tool for AI coding assistant rule files')
  .version('0.1.0');

program
  .option('-c, --config <path>', 'configuration file path', '.rulefusion.yml')
  .option('--mode <mode>', 'analysis mode', 'static')
  .option('--ai-provider <provider>', 'AI provider (for AI mode)')
  .option('--ai-model <model>', 'AI model (for AI mode)')
  .action(async (options) => {
    try {
      const configParser = new ConfigParser();
      const config = configParser.loadConfig(options.config);
      
      if (options.mode === 'ai') {
        console.log('AI mode is not yet implemented. Falling back to static mode.');
      }

      const fileDetector = new FileDetector(config);
      const detectedFiles = await fileDetector.detectFiles();
      
      if (detectedFiles.length === 0) {
        console.log('No files detected for analysis.');
        process.exit(0);
      }

      const fileParser = new FileParser();
      const staticEngine = new StaticEngine(config, fileParser);
      const violations = await staticEngine.analyze(detectedFiles);
      
      const result: AnalysisResult = {
        violations,
        filesAnalyzed: detectedFiles.length,
        hasErrors: violations.some(v => v.level === 'error'),
        hasWarnings: violations.some(v => v.level === 'warning')
      };

      const reporter = new ConsoleReporter();
      reporter.report(result);

      const exitCode = result.hasErrors ? 1 : 0;
      process.exit(exitCode);
      
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse();