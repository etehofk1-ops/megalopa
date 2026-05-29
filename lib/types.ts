export type ScoreResult = {
  reliability_score: number;
  grade: string;
  risk_level: string;
  components: Record<string, number>;
  counts: { nodes: number; edges: number; evidence: number; issues: number };
};

export type Issue = {
  id: string;
  code: string;
  severity: string;
  category: string;
  target_type: string;
  target_id: string;
  message: string;
  suggestion: string;
};

export type AnalyzeResult = {
  score: ScoreResult;
  issues: Issue[];
  markdown: string;
};
