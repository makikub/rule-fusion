# RuleFusion

Static analysis tool for AI coding assistant rule files.

## Features

- **File Detection**: Automatically detects rule files for GitHub Copilot, Cursor, and Claude Code
- **Schema Validation**: Validates YAML, JSON, and Markdown rule files
- **Static Analysis**: Detects duplicate keys, undefined references, priority cycles, and range conflicts
- **Colored Output**: Beautiful console output with error and warning highlighting
- **Configurable**: Flexible configuration through `.rulefusion.yml`

## Installation

```bash
npm install -g rulefusion
```

## Usage

### Basic Usage

```bash
# Analyze current directory with default configuration
npx rulefusion

# Specify custom configuration file
npx rulefusion --config .rulefusion.yml
```

### Configuration

Create a `.rulefusion.yml` file in your project root:

```yaml
tools:
  copilot:
    include: [".copilot/**/*.yml", ".github/copilot-instructions.md"]
  cursor:
    include: [".cursor/**/*.md", ".cursorrules"]
  claude:
    include: [".claude/**/*.yml", "CLAUDE.md"]

exclude:
  - "node_modules/**"
  - "dist/**"

rules:
  duplicate-key: error
  undefined-ref: error
  priority-cycle: error
  range-conflict: warning
```

## Rules

### duplicate-key
Detects duplicate configuration keys across different AI tools.

### undefined-ref
Detects references to undefined variables or keys.

### priority-cycle
Detects circular dependencies in rule priorities.

### range-conflict
Detects conflicting numeric ranges in configurations.

## Development

```bash
# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Run development version
npm run dev
```

## License

MIT