import { AnalyzeResult, Issue } from "./types";

export const ISSUE_GROUPS = {
  critical: ["error", "critical"],
  unsupported: ["EVIDENCE_MISSING_EDGE", "RELATION_UNSUPPORTED_TYPE"],
  strong: ["RELATION_STRONG_CAUSAL"],
  bias: ["bias"],
} as const;

export type IssueGroup = ReturnType<typeof groupIssues>;

export function groupIssues(issues: Issue[]) {
  return {
    critical: issues.filter((issue) => ISSUE_GROUPS.critical.includes(issue.severity as "error" | "critical")),
    unsupported: issues.filter((issue) => ISSUE_GROUPS.unsupported.includes(issue.code as "EVIDENCE_MISSING_EDGE" | "RELATION_UNSUPPORTED_TYPE")),
    strong: issues.filter((issue) => ISSUE_GROUPS.strong.includes(issue.code as "RELATION_STRONG_CAUSAL")),
    bias: issues.filter((issue) => issue.category === "bias"),
  };
}

export function recommendedUse(result: AnalyzeResult) {
  const risk = result.score.risk_level;
  const grade = result.score.grade;
  return [
    { label: "탐색용", value: ["low", "medium"].includes(risk) ? "가능" : "주의 필요" },
    { label: "콘텐츠 생성용", value: "출처 표시와 수동 검토 후 사용" },
    { label: "에이전트 자동판단용", value: ["medium", "high", "critical"].includes(risk) ? "비권장" : "제한적 가능" },
    { label: "공개 배포용", value: ["trusted", "usable_with_citation"].includes(grade) ? "가능" : "수정 후 재검토 권장" },
  ];
}

export function componentMax(key: string) {
  const maxByKey: Record<string, number> = {
    evidence_coverage: 25,
    relation_quality: 20,
    schema_consistency: 15,
    provenance_quality: 15,
    consensus_strength: 10,
    recency: 5,
    inference_utility: 10,
  };
  return maxByKey[key] ?? 25;
}

export function componentPercent(key: string, value: number) {
  return Math.min(100, Math.max(0, (Number(value) / componentMax(key)) * 100));
}

export function severityTone(severity: string) {
  if (["critical", "error"].includes(severity)) return "border-[#ef4444]/30 bg-[#ef4444]/5 text-[#fecaca]";
  if (severity === "warning") return "border-[#f59e0b]/30 bg-[#f59e0b]/5 text-[#f8c46c]";
  return "border-white/10 bg-white/[0.03] text-[#d0d6e0]";
}
