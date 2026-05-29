# Validation Rules

## Schema

- missing pack fields
- duplicate node IDs
- edge source/target missing from node list
- evidence reference missing from evidence list

## Evidence

- node without evidence
- edge without evidence
- weak provenance source type

## Relation vocabulary

Allowed relation types:

- `is_a`
- `part_of`
- `associated_with`
- `may_indicate`
- `often_precedes`
- `supports`
- `has_risk_factor`
- `can_contribute_to`

Strong relation warnings:

- `causes`
- `proves`
- `always_leads_to`
- `is_truth_of`
- `guarantees`
- `determines`

## Bias naming

MVP uses deterministic term scanning and returns risk warnings, not final moral judgments. Suggested fixes should move labels toward neutral behavior-centered naming.
