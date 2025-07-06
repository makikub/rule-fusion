export interface RuleFusionConfig {
  tools: {
    [toolName: string]: {
      include: string[];
      exclude?: string[];
    };
  };
  exclude?: string[];
  rules: {
    'duplicate-key': 'error' | 'warning' | 'off';
    'undefined-ref': 'error' | 'warning' | 'off';
    'priority-cycle': 'error' | 'warning' | 'off';
    'range-conflict': 'error' | 'warning' | 'off';
  };
  ai?: {
    enabled: boolean;
    provider?: string;
    model?: string;
  };
  bestPractices?: {
    enabled: boolean;
    catalogs?: string[];
  };
}

export interface RuleViolation {
  rule: string;
  level: 'error' | 'warning';
  message: string;
  file: string;
  line?: number;
  column?: number;
}

export interface AnalysisResult {
  violations: RuleViolation[];
  filesAnalyzed: number;
  hasErrors: boolean;
  hasWarnings: boolean;
}