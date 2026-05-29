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

export function riskLabel(risk: string) {
  const labels: Record<string, string> = {
    low: "낮음",
    medium: "보통",
    high: "높음",
    critical: "매우 높음",
  };
  return labels[risk] ?? risk;
}

export function gradeLabel(grade: string) {
  const labels: Record<string, string> = {
    trusted: "신뢰 가능",
    usable_with_citation: "출처 표시 후 사용",
    exploratory: "탐색용",
    private_only: "내부 검토용",
    quarantine: "사용 보류",
  };
  return labels[grade] ?? grade;
}

export function componentLabel(key: string) {
  const labels: Record<string, string> = {
    evidence_coverage: "근거 연결률",
    relation_quality: "관계 표현 안정성",
    schema_consistency: "구조 일관성",
    provenance_quality: "출처 신뢰도",
    consensus_strength: "근거 합의도",
    recency: "최신성",
    inference_utility: "추론 활용성",
  };
  return labels[key] ?? key;
}

export function issueCodeLabel(code: string) {
  const labels: Record<string, string> = {
    EVIDENCE_MISSING_NODE: "근거 없는 노드",
    EVIDENCE_MISSING_EDGE: "근거 없는 관계",
    EVIDENCE_NODE_REFERENCE_MISSING: "없는 근거를 참조한 노드",
    EVIDENCE_EDGE_REFERENCE_MISSING: "없는 근거를 참조한 관계",
    RELATION_STRONG_CAUSAL: "너무 단정적인 관계",
    RELATION_UNSUPPORTED_TYPE: "확인 필요한 관계",
    PROVENANCE_WEAK_SOURCE: "약한 출처",
    SCHEMA_MISSING_PACK_FIELD: "팩 정보 누락",
    SCHEMA_DUPLICATE_NODE_ID: "중복 노드",
    SCHEMA_EDGE_SOURCE_MISSING: "출발 노드 없음",
    SCHEMA_EDGE_TARGET_MISSING: "도착 노드 없음",
    BIAS_STIGMATIZING_LABEL: "편향 표현",
  };
  return labels[code] ?? code;
}

export function targetTypeLabel(type: string) {
  const labels: Record<string, string> = {
    pack: "팩",
    node: "노드",
    edge: "관계",
    evidence: "근거",
    claim: "주장",
  };
  return labels[type] ?? type;
}

export function issueMessage(issue: Issue) {
  const messages: Record<string, string> = {
    EVIDENCE_MISSING_NODE: "이 노드에 연결된 근거가 없습니다.",
    EVIDENCE_MISSING_EDGE: "이 관계에 연결된 근거가 없습니다.",
    EVIDENCE_NODE_REFERENCE_MISSING: "이 노드가 존재하지 않는 근거를 참조합니다.",
    EVIDENCE_EDGE_REFERENCE_MISSING: "이 관계가 존재하지 않는 근거를 참조합니다.",
    RELATION_STRONG_CAUSAL: "관계 표현이 너무 단정적일 수 있습니다.",
    RELATION_UNSUPPORTED_TYPE: "아직 지원 목록에 없는 관계 표현입니다.",
    PROVENANCE_WEAK_SOURCE: "출처 종류가 약하거나 알 수 없습니다.",
    SCHEMA_MISSING_PACK_FIELD: "팩 기본 정보가 빠져 있습니다.",
    SCHEMA_DUPLICATE_NODE_ID: "같은 노드 ID가 두 번 이상 나옵니다.",
    SCHEMA_EDGE_SOURCE_MISSING: "관계의 출발 노드가 팩 안에 없습니다.",
    SCHEMA_EDGE_TARGET_MISSING: "관계의 도착 노드가 팩 안에 없습니다.",
    BIAS_STIGMATIZING_LABEL: "이름이 낙인이나 과잉 일반화로 읽힐 수 있습니다.",
  };
  return messages[issue.code] ?? issue.message;
}

export function issueSuggestion(issue: Issue) {
  const suggestions: Record<string, string> = {
    EVIDENCE_MISSING_NODE: "노드에 근거를 연결하거나 신뢰도를 낮춰 표시하세요.",
    EVIDENCE_MISSING_EDGE: "관계는 추론에 직접 쓰이므로 근거를 연결한 뒤 사용하세요.",
    EVIDENCE_NODE_REFERENCE_MISSING: "근거 항목을 추가하거나 잘못된 참조를 제거하세요.",
    EVIDENCE_EDGE_REFERENCE_MISSING: "근거 항목을 추가하거나 잘못된 참조를 제거하세요.",
    RELATION_STRONG_CAUSAL: "충분한 근거가 없다면 더 약한 관계 표현으로 바꾸세요.",
    RELATION_UNSUPPORTED_TYPE: "표준 관계 목록에 있는 표현으로 바꾸거나 검토 메모를 남기세요.",
    PROVENANCE_WEAK_SOURCE: "공식 문서, 논문, 책, 추적 가능한 기사 같은 출처로 보강하세요.",
    SCHEMA_MISSING_PACK_FIELD: "팩 제목, 버전, 설명 같은 기본 정보를 채우세요.",
    SCHEMA_DUPLICATE_NODE_ID: "각 노드가 고유한 ID를 갖도록 정리하세요.",
    SCHEMA_EDGE_SOURCE_MISSING: "source_node_id가 실제 노드를 가리키도록 수정하세요.",
    SCHEMA_EDGE_TARGET_MISSING: "target_node_id가 실제 노드를 가리키도록 수정하세요.",
    BIAS_STIGMATIZING_LABEL: "사람이나 집단을 단정하지 말고 행동이나 구조 중심의 중립적 이름으로 바꾸세요.",
  };
  return suggestions[issue.code] ?? issue.suggestion;
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
