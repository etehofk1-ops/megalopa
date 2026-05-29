# UI Review Console Notes

## Purpose

Megalopa MVP should feel like an ontology trust review console, not only a raw Markdown generator. The UI should guide a user from pack input to risk understanding to repair action.

## Current UX decisions

### Home

- Position Megalopa as an OpenCrab Pack audit layer.
- Show a sample audit preview immediately: Reliability, Risk Level, Unsupported Edges, Strong Relation.
- Show a relation weakening example: `causes` -> `can_contribute_to`.

### Upload

- Support three visible input modes: Sample Pack, Paste JSON, Upload File.
- MVP upload is JSON-only until server-side YAML parsing is added.
- Keep MVP storage temporary: API request + browser `sessionStorage` only.
- Show user-facing error messages for empty input, unsupported file type, and API failures.
- Label analyzer correctly as `TypeScript API` for the Vercel-compatible MVP flow.

### Dashboard

- Prioritize the decision question: how risky is this pack to use?
- Show Reliability Score, Risk Level, Recommended Use, issue counts, score components, and top repair queue.

### Report

- Provide two output modes:
  - Structured View for issue triage and repair checklist.
  - Markdown View for raw report review.
- Add Copy Markdown and Download `.md` actions.
- Group findings into Critical Issues, Unsupported Edges, Strong Relation Warnings, and Bias / Naming Warnings.
- Each analysis now receives a temporary browser-session report ID and routes to `/reports/{id}` instead of always using `/reports/sample`.

## Next UX tasks

1. Add durable server-side report storage for shareable report URLs.
2. Add YAML parsing support in the API.
3. Add graph review visualization.
4. Add downloadable repaired pack export.
5. Add lightweight end-to-end browser test once a browser runner is available.
