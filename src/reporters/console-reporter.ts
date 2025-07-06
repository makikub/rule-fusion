import chalk from 'chalk';
import { RuleViolation, AnalysisResult } from '../types/config';

export class ConsoleReporter {
  public report(result: AnalysisResult): void {
    console.log(chalk.bold('\n🔍 RuleFusion Analysis Report\n'));
    
    if (result.violations.length === 0) {
      console.log(chalk.green('✓ No violations found!'));
      console.log(chalk.gray(`Files analyzed: ${result.filesAnalyzed}`));
      return;
    }

    const errorCount = result.violations.filter(v => v.level === 'error').length;
    const warningCount = result.violations.filter(v => v.level === 'warning').length;

    console.log(chalk.red(`❌ ${errorCount} error(s)`));
    console.log(chalk.yellow(`⚠️  ${warningCount} warning(s)`));
    console.log(chalk.gray(`📁 ${result.filesAnalyzed} file(s) analyzed\n`));

    const groupedViolations = this.groupViolationsByFile(result.violations);
    
    for (const [file, violations] of Object.entries(groupedViolations)) {
      console.log(chalk.underline(file));
      
      for (const violation of violations) {
        const icon = violation.level === 'error' ? '❌' : '⚠️';
        const color = violation.level === 'error' ? chalk.red : chalk.yellow;
        
        const location = violation.line ? `:${violation.line}` : '';
        const position = violation.column ? `:${violation.column}` : '';
        
        console.log(
          `  ${icon} ${color(violation.rule)} ${violation.message}${location}${position}`
        );
      }
      
      console.log();
    }

    this.printSummary(result);
  }

  private groupViolationsByFile(violations: RuleViolation[]): { [file: string]: RuleViolation[] } {
    const grouped: { [file: string]: RuleViolation[] } = {};
    
    for (const violation of violations) {
      if (!grouped[violation.file]) {
        grouped[violation.file] = [];
      }
      grouped[violation.file].push(violation);
    }

    return grouped;
  }

  private printSummary(result: AnalysisResult): void {
    console.log(chalk.bold('📊 Summary'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const ruleStats = this.getRuleStatistics(result.violations);
    
    for (const [rule, count] of Object.entries(ruleStats)) {
      console.log(`${rule}: ${count} violation(s)`);
    }

    if (result.hasErrors) {
      console.log(chalk.red('\n💥 Analysis failed due to errors.'));
    } else if (result.hasWarnings) {
      console.log(chalk.yellow('\n⚠️  Analysis completed with warnings.'));
    } else {
      console.log(chalk.green('\n✅ Analysis completed successfully.'));
    }
  }

  private getRuleStatistics(violations: RuleViolation[]): { [rule: string]: number } {
    const stats: { [rule: string]: number } = {};
    
    for (const violation of violations) {
      stats[violation.rule] = (stats[violation.rule] || 0) + 1;
    }

    return stats;
  }
}