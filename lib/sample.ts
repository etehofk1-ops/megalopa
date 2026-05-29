import { AnalyzeResult } from "./types";

export const fallbackResult: AnalyzeResult = {
  pack: {
    id: "dog_ontology_pack",
    title: "Dog Behavior Ontology QA Sample",
    version: "0.1.0",
    domain: "animal_behavior",
    description: "Sample OpenCrab-style ontology pack with intentional audit warnings.",
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
      message: "Edge has no evidence references.",
      suggestion: "Edges should include evidence before they are used for agent reasoning.",
    },
    {
      id: "relation_strong_causal_edge_edge2",
      code: "RELATION_STRONG_CAUSAL",
      severity: "warning",
      category: "relation",
      target_type: "edge",
      target_id: "edge2",
      message: "Relation 'causes' is strong and may overstate causality or certainty.",
      suggestion: "Use a weaker relation unless high-quality evidence supports the strong claim.",
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
      message: "Evidence source type is weak or unknown.",
      suggestion: "Prefer official docs, papers, books, or traceable articles.",
    },
  ],
  markdown: `# Megalopa Audit Report

## Pack Summary

- Pack: Dog Behavior Ontology QA Sample
- Version: 0.1.0
- Domain: animal_behavior
- Nodes: 3
- Edges: 2
- Evidence Items: 1

## Reliability Score

- Score: 68
- Grade: exploratory
- Risk Level: medium

## Key Findings

1. 총 3개 노드와 2개 엣지를 분석했습니다.
2. Reliability Score는 68점이며 등급은 exploratory입니다.
3. 감지된 이슈는 3건입니다. 점수는 진리 판정이 아니라 사용 위험도 안내입니다.

## Repair Checklist

- [ ] 근거 없는 엣지 보완
- [ ] 강한 인과 관계 완화
- [ ] 출처 메타데이터 추가`,
};
