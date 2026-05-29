# Megalopa Audit Report

## Pack Summary

- Pack: Dog Behavior Ontology QA Sample
- Version: 0.1.0
- Domain: animal_behavior
- Nodes: 3
- Edges: 2
- Evidence Items: 1

## Reliability Score

- Score: 59
- Grade: private_only
- Risk Level: high

## Key Findings

1. 총 3개 노드와 2개 엣지를 분석했습니다.
2. Reliability Score는 59점이며 등급은 private_only입니다.
3. 감지된 이슈는 4건입니다. 점수는 진리 판정이 아니라 사용 위험도 안내입니다.

## Critical Issues

| Severity | Target | Issue | Suggestion |
|---|---|---|---|
| error | edge:edge2 | Edge has no evidence references. | Edges should include evidence before they are used for agent reasoning. |

## Unsupported Edges

| Edge | Relation | Problem | Suggestion |
|---|---|---|---|
| anxiety -> barking | - | Edge has no evidence references. | Edges should include evidence before they are used for agent reasoning. |

## Strong Relation Warnings

| Edge | Current Relation | Suggested Relation |
|---|---|---|
| anxiety -> barking | causes | can_contribute_to |

## Bias / Naming Warnings

| Target | Current Name | Issue | Suggested Name |
|---|---|---|---|
| - | - | - |

## Recommended Use

- 탐색용: 주의 필요
- 콘텐츠 생성용: 출처 표시와 수동 검토 후 사용
- 에이전트 자동판단용: 비권장
- 공개 배포용: 수정 후 재검토 권장

## Repair Checklist

- [ ] 근거 없는 엣지 보완
- [ ] 강한 인과 관계 완화
- [ ] 편향적 명명 수정
- [ ] 출처 메타데이터 추가
- [ ] 버전 및 작성자 정보 추가
