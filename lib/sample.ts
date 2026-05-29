import { AnalyzeResult } from "./types";

export const fallbackResult: AnalyzeResult = {
  pack: {
    id: "dog_ontology_pack",
    title: "반려견 행동 온톨로지 QA 샘플",
    version: "0.1.0",
    domain: "animal_behavior",
    description: "검수 경고를 확인할 수 있도록 만든 OpenCrab 팩 샘플입니다.",
  },
  score: {
    reliability_score: 68,
    grade: "exploratory",
    risk_level: "medium",
    components: {
      evidence_coverage: 13.96,
      relation_quality: 14,
      schema_consistency: 15,
      provenance_quality: 12,
      consensus_strength: 6,
      recency: 3,
      inference_utility: 7,
    },
    counts: { nodes: 3, edges: 2, evidence: 1, issues: 3 },
  },
  issues: [
    {
      id: "evidence_missing_edge_edge_edge2",
      code: "EVIDENCE_MISSING_EDGE",
      severity: "error",
      category: "evidence",
      target_type: "edge",
      target_id: "edge2",
      message: "이 관계에 연결된 근거가 없습니다.",
      suggestion: "관계는 추론에 직접 쓰이므로 근거를 연결한 뒤 사용하세요.",
    },
    {
      id: "relation_strong_causal_edge_edge2",
      code: "RELATION_STRONG_CAUSAL",
      severity: "warning",
      category: "relation",
      target_type: "edge",
      target_id: "edge2",
      message: "관계 표현이 너무 단정적일 수 있습니다.",
      suggestion: "충분한 근거가 없다면 더 약한 관계 표현으로 바꾸세요.",
      current_relation: "causes",
      suggested_relation: "can_contribute_to",
    },
    {
      id: "provenance_weak_source_evidence_ev1",
      code: "PROVENANCE_WEAK_SOURCE",
      severity: "warning",
      category: "provenance",
      target_type: "evidence",
      target_id: "ev1",
      message: "출처 종류가 약하거나 알 수 없습니다.",
      suggestion: "공식 문서, 논문, 책, 추적 가능한 기사 같은 출처로 보강하세요.",
    },
  ],
  markdown: `# Megalopa 분석 리포트

## 팩 요약

- 팩: 반려견 행동 온톨로지 QA 샘플
- 버전: 0.1.0
- 분야: animal_behavior
- 노드: 3
- 관계: 2
- 근거 항목: 1

## 신뢰도 점수

- 점수: 68
- 사용 등급: 탐색용
- 사용 위험도: 보통

## 핵심 결과

1. 총 3개 노드와 2개 관계를 분석했습니다.
2. 신뢰도 점수는 68점이며 사용 등급은 탐색용입니다.
3. 감지된 이슈는 3건입니다. 점수는 진리 판정이 아니라 사용 위험도 안내입니다.

## 수정 체크리스트

- [ ] 근거 없는 관계 보완
- [ ] 강한 인과 관계 완화
- [ ] 출처 메타데이터 추가`,
};
