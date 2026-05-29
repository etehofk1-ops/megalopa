import { AnalyzeResult } from "./types";

export const fallbackResult: AnalyzeResult = {
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
  issues: [],
  markdown: `# Megalopa Audit Report

Upload sample_pack.json to generate a report.`,
};
