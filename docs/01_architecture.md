# Architecture

## Components

- `app/`: Next.js App Router frontend and API route
- `components/`: reusable UI and SVG-only icon components
- `packages/analyzer/`: deterministic Python analyzer
- `packages/schemas/`: JSON schemas for pack and report contracts
- `examples/`: sample pack and generated sample report
- `tests/`: pytest coverage for analyzer behavior

## Analysis Flow

```text
Upload JSON
-> app/api/analyze/route.ts
-> temp file
-> uv run python -m packages.analyzer.cli
-> parser, validators, scoring, report generator
-> JSON response with Markdown report
-> Report page render
```

The MVP keeps LLM analysis disabled by default so validation remains deterministic and testable.
