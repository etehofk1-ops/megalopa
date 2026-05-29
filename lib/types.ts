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
  current_relation?: string;
  suggested_relation?: string;
  current_name?: string;
  suggested_name?: string;
  flagged_term?: string;
  confidence?: number;
};

export type AnalyzeResult = {
  report_id?: string;
  pack?: {
    id?: string;
    title?: string;
    version?: string;
    domain?: string;
    description?: string;
  };
  score: ScoreResult;
  issues: Issue[];
  markdown: string;
};
