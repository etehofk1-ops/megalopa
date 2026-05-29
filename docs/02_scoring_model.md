# Scoring Model

The score is a use-risk guide, not a truth score.

| Component | Points | MVP status |
|---|---:|---|
| Evidence Coverage | 25 | implemented |
| Relation Quality | 20 | implemented |
| Schema Consistency | 15 | implemented |
| Provenance Quality | 15 | implemented |
| Consensus Strength | 10 | default value |
| Recency | 5 | default value |
| Inference Utility | 10 | default value |

## Grade

- 90-100: trusted
- 75-89: usable_with_citation
- 60-74: exploratory
- 40-59: private_only
- 0-39: quarantine

## Risk Level

- low: 일반 탐색용 사용 가능
- medium: 출처 확인 후 사용
- high: 자동 판단에 사용 금지
- critical: 격리 및 재검토 권장
