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

export function reportVerdict(result: AnalyzeResult) {
  const risk = result.score.risk_level;
  const groups = groupIssues(result.issues);

  if (risk === "critical") {
    return {
      label: "사용 보류",
      title: "이 팩은 지금 바로 배포하면 위험합니다.",
      body: "구조 오류나 근거 문제가 커서 에이전트가 잘못된 관계를 사실처럼 사용할 수 있습니다. 먼저 필수 문제를 고친 뒤 다시 분석하세요.",
      action: "먼저 고칠 문제부터 확인",
      tone: "danger" as const,
    };
  }

  if (risk === "high") {
    return {
      label: "수정 필요",
      title: "이 팩은 배포 전 수정이 필요합니다.",
      body: "근거가 없는 관계나 구조 문제가 남아 있습니다. 공개 배포보다 수정 큐를 먼저 처리하는 흐름이 안전합니다.",
      action: "수정 우선순위 보기",
      tone: "danger" as const,
    };
  }

  if (risk === "medium" || groups.strong.length || groups.unsupported.length) {
    return {
      label: "주의 필요",
      title: "이 팩은 검토 후 사용할 수 있습니다.",
      body: "탐색용으로는 사용할 수 있지만, 관계 표현과 근거 연결을 확인한 뒤 OpenCrab에 올리는 편이 좋습니다.",
      action: "확인 필요한 관계 보기",
      tone: "warn" as const,
    };
  }

  return {
    label: "배포 준비",
    title: "이 팩은 배포 준비에 가깝습니다.",
    body: "큰 위험 신호는 적습니다. 출처 표시와 마지막 수동 검토를 거치면 재사용 가능한 팩으로 정리할 수 있습니다.",
    action: "마지막 확인 보기",
    tone: "ok" as const,
  };
}

export function firstRepairLabel(result: AnalyzeResult) {
  const groups = groupIssues(result.issues);
  if (groups.critical.length) return "먼저 고칠 문제";
  if (groups.unsupported.length) return "확인 필요한 관계";
  if (groups.strong.length) return "단정적 관계";
  if (groups.bias.length) return "편향 표현";
  if (result.issues.length) return "전체 문제";
  return "마지막 확인";
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

export function issueImpact(issue: Issue) {
  if (issue.category === "evidence") return "근거 없이 추론될 수 있음";
  if (issue.category === "relation") return "관계가 과하게 단정될 수 있음";
  if (issue.category === "provenance") return "출처 신뢰도가 낮아짐";
  if (issue.category === "schema") return "팩 구조가 깨질 수 있음";
  if (issue.category === "bias") return "표현이 편향적으로 읽힐 수 있음";
  return "사용 전 검토 필요";
}

export function issueWhy(issue: Issue) {
  if (issue.category === "evidence") return "근거가 연결되지 않으면 에이전트가 관계를 사실처럼 확대 해석할 수 있습니다.";
  if (issue.category === "relation") return "관계 표현이 너무 강하면 가능성이나 상관관계가 확정된 인과처럼 보일 수 있습니다.";
  if (issue.category === "provenance") return "출처를 추적하기 어려우면 나중에 사용자가 왜 이 결론이 나왔는지 확인하기 어렵습니다.";
  if (issue.category === "schema") return "팩 구조가 어긋나면 분석이나 배포 과정에서 노드와 관계가 제대로 연결되지 않습니다.";
  if (issue.category === "bias") return "편향된 이름은 사람이나 집단을 단정해 잘못된 판단으로 이어질 수 있습니다.";
  return "OpenCrab에 올리기 전에 사람이 한 번 더 확인해야 하는 항목입니다.";
}

export function nextAction(issue: Issue) {
  if (issue.code.includes("MISSING_EDGE")) return "관계에 근거 연결";
  if (issue.code.includes("MISSING_NODE")) return "노드에 근거 연결";
  if (issue.code === "RELATION_STRONG_CAUSAL") return "관계 표현 완화";
  if (issue.code === "PROVENANCE_WEAK_SOURCE") return "출처 보강";
  if (issue.category === "bias") return "중립 표현으로 수정";
  if (issue.category === "schema") return "누락 필드 수정";
  return "수동 검토";
}

export function repairExample(issue: Issue) {
  if (issue.code === "RELATION_STRONG_CAUSAL") {
    return {
      before: `"relation_type": "${issue.current_relation ?? "causes"}"`,
      after: `"relation_type": "${issue.suggested_relation ?? "can_contribute_to"}"`,
    };
  }
  if (issue.code === "EVIDENCE_MISSING_EDGE" || issue.code === "EVIDENCE_MISSING_NODE") {
    return {
      before: `"evidence_ids": []`,
      after: `"evidence_ids": ["ev1"]`,
    };
  }
  if (issue.code === "PROVENANCE_WEAK_SOURCE") {
    return {
      before: `"source_type": "unknown"`,
      after: `"source_type": "paper", "source_url": "https://..."`,
    };
  }
  if (issue.category === "bias") {
    return {
      before: `"label": "${issue.current_name ?? "문제 표현"}"`,
      after: `"label": "${issue.suggested_name ?? "중립적 이름"}"`,
    };
  }
  return null;
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
