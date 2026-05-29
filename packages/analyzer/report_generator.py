from __future__ import annotations


def _issue_rows(issues: list[dict], predicate=lambda issue: True) -> str:
    rows = []
    for issue in filter(predicate, issues):
        target = f"{issue.get('target_type')}:{issue.get('target_id')}"
        rows.append(f"| {issue.get('severity')} | {target} | {issue.get('message')} | {issue.get('suggestion', '')} |")
    return "\n".join(rows) if rows else "| - | - | - | - |"


def _edge_label(pack: dict, edge_id: str) -> str:
    edge = next((item for item in pack.get("edges", []) if item.get("id") == edge_id), None)
    if not edge:
        return edge_id
    return f"{edge.get('source_node_id')} -> {edge.get('target_node_id')}"


def generate_markdown_report(pack: dict, score: dict, issues: list[dict]) -> str:
    strong = [i for i in issues if i.get("code") == "RELATION_STRONG_CAUSAL"]
    unsupported = [i for i in issues if i.get("code") in {"EVIDENCE_MISSING_EDGE", "RELATION_UNSUPPORTED_TYPE"}]
    bias = [i for i in issues if i.get("category") == "bias"]
    critical = [i for i in issues if i.get("severity") in {"error", "critical"}]
    findings = [
        f"총 {len(pack.get('nodes', []))}개 노드와 {len(pack.get('edges', []))}개 엣지를 분석했습니다.",
        f"Reliability Score는 {score['reliability_score']}점이며 등급은 {score['grade']}입니다.",
        f"감지된 이슈는 {len(issues)}건입니다. 점수는 진리 판정이 아니라 사용 위험도 안내입니다.",
    ]
    strong_rows = "\n".join(f"| {_edge_label(pack, i.get('target_id'))} | {i.get('current_relation')} | {i.get('suggested_relation')} |" for i in strong) or "| - | - | - |"
    bias_rows = "\n".join(f"| {i.get('target_type')}:{i.get('target_id')} | {i.get('current_name')} | {i.get('message')} | {i.get('suggested_name')} |" for i in bias) or "| - | - | - |"
    unsupported_rows = "\n".join(f"| {_edge_label(pack, i.get('target_id'))} | {i.get('current_relation', '-')} | {i.get('message')} | {i.get('suggestion')} |" for i in unsupported) or "| - | - | - |"
    return f"""# Megalopa Audit Report

## Pack Summary

- Pack: {pack.get('title', pack.get('id'))}
- Version: {pack.get('version', '-')}
- Domain: {pack.get('domain', '-')}
- Nodes: {len(pack.get('nodes', []))}
- Edges: {len(pack.get('edges', []))}
- Evidence Items: {len(pack.get('evidence', []))}

## Reliability Score

- Score: {score['reliability_score']}
- Grade: {score['grade']}
- Risk Level: {score['risk_level']}

## Key Findings

1. {findings[0]}
2. {findings[1]}
3. {findings[2]}

## Critical Issues

| Severity | Target | Issue | Suggestion |
|---|---|---|---|
{_issue_rows(critical)}

## Unsupported Edges

| Edge | Relation | Problem | Suggestion |
|---|---|---|---|
{unsupported_rows}

## Strong Relation Warnings

| Edge | Current Relation | Suggested Relation |
|---|---|---|
{strong_rows}

## Bias / Naming Warnings

| Target | Current Name | Issue | Suggested Name |
|---|---|---|---|
{bias_rows}

## Recommended Use

- 탐색용: {"가능" if score['risk_level'] in {'low', 'medium'} else '주의 필요'}
- 콘텐츠 생성용: 출처 표시와 수동 검토 후 사용
- 에이전트 자동판단용: {"비권장" if score['risk_level'] in {'medium', 'high', 'critical'} else '제한적 가능'}
- 공개 배포용: {"수정 후 재검토 권장" if score['grade'] not in {'trusted', 'usable_with_citation'} else '가능'}

## Repair Checklist

- [ ] 근거 없는 엣지 보완
- [ ] 강한 인과 관계 완화
- [ ] 편향적 명명 수정
- [ ] 출처 메타데이터 추가
- [ ] 버전 및 작성자 정보 추가
"""
