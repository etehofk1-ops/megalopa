# Pack Schema

MVP input schema separates pack content from analysis output.

## Required pack fields

- `id`
- `title`
- `version`
- `description`
- `nodes`
- `edges`
- `evidence`

## Node

- `id`
- `label`
- `type`
- `description`
- `evidence_ids`
- `confidence`
- `risk_flags`

## Edge

- `id`
- `source_node_id`
- `relation_type`
- `target_node_id`
- `evidence_ids`
- `strength`
- `confidence`
- `risk_flags`

## Evidence

- `id`
- `source_title`
- `source_url`
- `source_type`
- `published_at`
- `retrieved_at`
- `credibility_score`
