# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test Commands

- Build project: `npm run build`
- Run tests: `npm test`
- Run development version: `npm run dev`
- Clean build artifacts: `npm run clean`
- Run linting: `npm run lint`
- Test CLI locally: `./dist/cli.js` or `npm run dev -- [args]`

## Architecture Overview

RuleFusion is a static analysis tool for AI coding assistant rule files with a modular plugin-based architecture:

### Core Components

**Configuration Layer (`src/core/`)**
- `ConfigParser`: Loads and validates `.rulefusion.yml` using AJV schema validation
- `FileDetector`: Uses glob patterns to discover AI tool configuration files across multiple formats (YAML, JSON, Markdown)

**Analysis Engine (`src/engines/`)**
- `StaticEngine`: Orchestrates the analysis pipeline and implements four core static analysis rules:
  - `duplicate-key`: Cross-tool configuration key collision detection
  - `undefined-ref`: Variable reference validation using `${variable}` syntax
  - `priority-cycle`: Dependency cycle detection using DFS graph traversal
  - `range-conflict`: Numeric range overlap detection

**File Processing (`src/utils/`)**
- `FileParser`: Multi-format parser supporting YAML (js-yaml), JSON, and Markdown with frontmatter extraction
- Handles tool-specific formats (Copilot YAML, Cursor Markdown, Claude mixed formats)

**Reporting System (`src/reporters/`)**
- `ConsoleReporter`: Colored terminal output using chalk with violation grouping and statistics

### Key Data Flow

1. `ConfigParser` loads `.rulefusion.yml` and validates against JSON schema
2. `FileDetector` discovers files using tool-specific glob patterns from config
3. `FileParser` parses discovered files into normalized `ParsedContent` objects
4. `StaticEngine` runs analysis rules across all parsed files, detecting cross-tool violations
5. `ConsoleReporter` aggregates and displays violations with colored output and exit codes

### Analysis Rules Implementation

**Key Extraction**: Uses recursive object traversal to build dot-notation keys (`obj.prop.subprop`)
**Reference Detection**: Regex pattern `/\$\{([^}]+)\}/g` to find variable references
**Cycle Detection**: DFS with recursion stack for dependency graph analysis
**Range Conflicts**: Overlap detection using `range1.min <= range2.max && range2.min <= range1.max`

### Configuration Schema

The tool supports extensible AI tool configuration via `.rulefusion.yml`:
- `tools`: Maps tool names to file inclusion patterns
- `rules`: Configures violation levels (error/warning/off)
- `ai`/`bestPractices`: Future extension points for AI-enhanced analysis

### Testing Strategy

Uses Jest with TypeScript for unit testing:
- Mock file system operations for config loading tests
- Mock file parser for engine testing with synthetic data
- Focus on rule logic validation rather than file I/O integration

## CLI Interface

Entry point: `src/cli.ts` using Commander.js
- Supports custom config paths via `--config`
- Placeholder for AI mode via `--mode ai`
- Returns exit code 1 for errors, 0 for success/warnings only