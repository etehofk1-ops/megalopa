import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { gradeLabel, issueMessage, issueSuggestion, riskLabel, targetTypeLabel } from "@/lib/reportView";

const REQUIRED_PACK_FIELDS = ["id", "title", "version", "description"];
const ALLOWED_RELATIONS = new Set([
  "is_a",
  "part_of",
  "associated_with",
  "may_indicate",
  "often_precedes",
  "supports",
  "has_risk_factor",
  "can_contribute_to",
]);
const STRONG_RELATION_ALTERNATIVES: Record<string, string> = {
  causes: "can_contribute_to",
  proves: "supports",
  always_leads_to: "often_precedes",
  is_truth_of: "supports",
  guarantees: "may_indicate",
  determines: "can_contribute_to",
};
const HIGH_QUALITY_SOURCES = new Set(["paper", "official", "book", "article"]);
const WEAK_SOURCES = new Set(["unknown", "llm_generated", "personal"]);
const STIGMA_TERMS = ["정병", "관종", "미친", "혐오", "한남", "김치녀", "충", "병신"];

type Issue = {
  id: string;
  code: string;
  severity: "info" | "warning" | "error" | "critical";
  category: string;
  target_type: string;
  target_id: string;
  message: string;
  suggestion: string;
  [key: string]: unknown;
};

type Pack = {
  id?: string;
  title?: string;
  version?: string;
  domain?: string;
  description?: string;
  nodes?: Array<Record<string, any>>;
  edges?: Array<Record<string, any>>;
  evidence?: Array<Record<string, any>>;
};

function makeIssue(
  code: string,
  severity: Issue["severity"],
  category: string,
  targetType: string,
  targetId: string,
  message: string,
  suggestion: string,
  extras: Record<string, unknown> = {},
): Issue {
  return {
    id: `${code.toLowerCase()}_${targetType}_${targetId}`,
    code,
    severity,
    category,
    target_type: targetType,
    target_id: targetId,
    message,
    suggestion,
    ...extras,
  };
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 1 : Math.max(0, Math.min(1, numerator / denominator));
}

function validateSchema(pack: Pack): Issue[] {
  const issues: Issue[] = [];
  for (const field of REQUIRED_PACK_FIELDS) {
    if (!pack[field as keyof Pack]) {
      issues.push(makeIssue("SCHEMA_MISSING_PACK_FIELD", "error", "schema", "pack", pack.id ?? "unknown", `팩에 필수 정보 '${field}'가 없습니다.`, `팩 기본 정보에 '${field}'를 추가하세요.`));
    }
  }

  const nodes = pack.nodes ?? [];
  const edges = pack.edges ?? [];
  const evidenceItems = pack.evidence ?? [];
  const nodeIds = nodes.map((node) => node.id).filter(Boolean);
  const evidenceIds = new Set(evidenceItems.map((item) => item.id).filter(Boolean));
  const nodeIdSet = new Set(nodeIds);
  const counts = new Map<string, number>();
  for (const nodeId of nodeIds) counts.set(nodeId, (counts.get(nodeId) ?? 0) + 1);

  for (const [nodeId, count] of counts.entries()) {
    if (count > 1) {
      issues.push(makeIssue("SCHEMA_DUPLICATE_NODE_ID", "error", "schema", "node", nodeId, `노드 ID '${nodeId}'가 ${count}번 나옵니다.`, "각 노드가 고유한 ID를 갖도록 정리하세요."));
    }
  }

  for (const node of nodes) {
    const nid = node.id ?? "unknown";
    if (!node.evidence_ids?.length) {
      issues.push(makeIssue("EVIDENCE_MISSING_NODE", "warning", "evidence", "node", nid, "이 노드에 연결된 근거가 없습니다.", "노드에 근거를 연결하거나 신뢰도를 낮춰 표시하세요."));
    }
    for (const ev of node.evidence_ids ?? []) {
      if (!evidenceIds.has(ev)) {
        issues.push(makeIssue("EVIDENCE_NODE_REFERENCE_MISSING", "error", "evidence", "node", nid, `노드가 존재하지 않는 근거 '${ev}'를 참조합니다.`, "근거 항목을 추가하거나 잘못된 참조를 제거하세요."));
      }
    }
  }

  for (const edge of edges) {
    const eid = edge.id ?? "unknown";
    const source = edge.source_node_id;
    const target = edge.target_node_id;
    if (!nodeIdSet.has(source)) {
      issues.push(makeIssue("SCHEMA_EDGE_SOURCE_MISSING", "error", "schema", "edge", eid, `관계의 출발 노드 '${source}'가 팩 안에 없습니다.`, "source_node_id가 실제 노드를 가리키도록 수정하세요."));
    }
    if (!nodeIdSet.has(target)) {
      issues.push(makeIssue("SCHEMA_EDGE_TARGET_MISSING", "error", "schema", "edge", eid, `관계의 도착 노드 '${target}'가 팩 안에 없습니다.`, "target_node_id가 실제 노드를 가리키도록 수정하세요."));
    }
    if (!edge.evidence_ids?.length) {
      issues.push(makeIssue("EVIDENCE_MISSING_EDGE", "error", "evidence", "edge", eid, "이 관계에 연결된 근거가 없습니다.", "관계는 추론에 직접 쓰이므로 근거를 연결한 뒤 사용하세요."));
    }
    for (const ev of edge.evidence_ids ?? []) {
      if (!evidenceIds.has(ev)) {
        issues.push(makeIssue("EVIDENCE_EDGE_REFERENCE_MISSING", "error", "evidence", "edge", eid, `관계가 존재하지 않는 근거 '${ev}'를 참조합니다.`, "근거 항목을 추가하거나 잘못된 참조를 제거하세요."));
      }
    }
    const relation = edge.relation_type;
    if (relation && !ALLOWED_RELATIONS.has(relation) && !STRONG_RELATION_ALTERNATIVES[relation]) {
      issues.push(makeIssue("RELATION_UNSUPPORTED_TYPE", "warning", "relation", "edge", eid, `관계 표현 '${relation}'은 아직 지원 목록에 없습니다.`, "표준 관계 목록에 있는 표현으로 바꾸거나 검토 메모를 남기세요.", { current_relation: relation }));
    }
  }

  for (const item of evidenceItems) {
    if (!item.source_type || ["unknown", "llm_generated"].includes(item.source_type)) {
      issues.push(makeIssue("PROVENANCE_WEAK_SOURCE", "warning", "provenance", "evidence", item.id ?? "unknown", "출처 종류가 약하거나 알 수 없습니다.", "공식 문서, 논문, 책, 추적 가능한 기사 같은 출처로 보강하세요."));
    }
  }
  return issues;
}

function findStrongRelations(pack: Pack): Issue[] {
  return (pack.edges ?? [])
    .filter((edge) => STRONG_RELATION_ALTERNATIVES[edge.relation_type])
    .map((edge) => makeIssue(
      "RELATION_STRONG_CAUSAL",
      "warning",
      "relation",
      "edge",
      edge.id ?? "unknown",
      `관계 표현 '${edge.relation_type}'이 너무 단정적일 수 있습니다.`,
      "충분한 근거가 없다면 더 약한 관계 표현으로 바꾸세요.",
      { current_relation: edge.relation_type, suggested_relation: STRONG_RELATION_ALTERNATIVES[edge.relation_type] },
    ));
}

function detectBiasNaming(pack: Pack): Issue[] {
  const targets = [["pack", pack.id ?? "unknown", pack.title ?? ""]];
  for (const node of pack.nodes ?? []) targets.push(["node", node.id ?? "unknown", node.label ?? ""]);
  return targets.flatMap(([targetType, targetId, label]) => {
    const flaggedTerm = STIGMA_TERMS.find((term) => String(label).toLowerCase().includes(term.toLowerCase()));
    if (!flaggedTerm) return [];
    return [makeIssue(
      "BIAS_STIGMATIZING_LABEL",
      "warning",
      "bias",
      targetType,
      targetId,
      `이름 '${label}'이 낙인이나 과잉 일반화로 읽힐 수 있습니다.`,
      "사람이나 집단을 단정하지 말고 행동이나 구조 중심의 중립적 이름으로 바꾸세요.",
      { current_name: label, flagged_term: flaggedTerm, suggested_name: "행동 구조 중심의 중립적 명명으로 수정", confidence: 0.82 },
    )];
  });
}

function gradeFor(score: number): string {
  if (score >= 90) return "trusted";
  if (score >= 75) return "usable_with_citation";
  if (score >= 60) return "exploratory";
  if (score >= 40) return "private_only";
  return "quarantine";
}

function riskFor(score: number, issues: Issue[]): string {
  if (issues.some((issue) => issue.severity === "critical") || score < 40) return "critical";
  if (issues.some((issue) => ["SCHEMA_EDGE_SOURCE_MISSING", "SCHEMA_EDGE_TARGET_MISSING"].includes(issue.code)) || score < 60) return "high";
  if (issues.some((issue) => issue.severity === "error") || score < 75) return "medium";
  return "low";
}

function calculateScore(pack: Pack, issues: Issue[]) {
  const nodes = pack.nodes ?? [];
  const edges = pack.edges ?? [];
  const evidence = pack.evidence ?? [];
  const evidenceIds = new Set(evidence.map((item) => item.id).filter(Boolean));
  const evidencedNodes = nodes.filter((node) => node.evidence_ids?.length).length;
  const evidencedEdges = edges.filter((edge) => edge.evidence_ids?.length).length;
  const coverageRatio = 0.35 * ratio(evidencedNodes, nodes.length) + 0.65 * ratio(evidencedEdges, edges.length);
  const evidenceCoverage = Math.round(25 * coverageRatio * 100) / 100;
  const relationIssueCount = issues.filter((issue) => issue.category === "relation").length;
  const relationQuality = Math.round(Math.max(0, 20 - relationIssueCount * 6) * 100) / 100;
  const schemaIssueCount = issues.filter((issue) => issue.category === "schema").length;
  const missingRefIssueCount = issues.filter((issue) => issue.code.endsWith("REFERENCE_MISSING")).length;
  const schemaConsistency = Math.round(Math.max(0, 15 - schemaIssueCount * 5 - missingRefIssueCount * 3) * 100) / 100;
  const highQuality = evidence.filter((item) => HIGH_QUALITY_SOURCES.has(item.source_type) && item.source_url).length;
  const weak = evidence.filter((item) => WEAK_SOURCES.has(item.source_type) || !item.source_url).length;
  const provenanceQuality = Math.round(Math.max(0, 15 * ratio(highQuality, evidence.length) - weak * 3) * 100) / 100;
  const components = {
    evidence_coverage: evidenceCoverage,
    relation_quality: relationQuality,
    schema_consistency: schemaConsistency,
    provenance_quality: provenanceQuality,
    consensus_strength: 6,
    recency: 3,
    inference_utility: 7,
  };
  const raw = Object.values(components).reduce((sum, value) => sum + value, 0);
  const reliabilityScore = Math.round(Math.max(0, Math.min(100, raw)));
  return {
    reliability_score: reliabilityScore,
    grade: gradeFor(reliabilityScore),
    risk_level: riskFor(reliabilityScore, issues),
    components,
    counts: { nodes: nodes.length, edges: edges.length, evidence: evidenceIds.size, issues: issues.length },
  };
}

function edgeLabel(pack: Pack, edgeId: string): string {
  const edge = (pack.edges ?? []).find((item) => item.id === edgeId);
  return edge ? `${edge.source_node_id} -> ${edge.target_node_id}` : edgeId;
}

function severityLabel(severity: string): string {
  const labels: Record<string, string> = {
    critical: "매우 중요",
    error: "중요",
    warning: "주의",
    info: "참고",
  };
  return labels[severity] ?? severity;
}

function issueTarget(issue: Issue): string {
  return `${targetTypeLabel(issue.target_type)}:${issue.target_id}`;
}

function issueRows(issues: Issue[]): string {
  return issues.length
    ? issues.map((issue) => `| ${severityLabel(issue.severity)} | ${issueTarget(issue)} | ${issueMessage(issue)} | ${issueSuggestion(issue)} |`).join("\n")
    : "| - | - | - | - |";
}

function generateMarkdownReport(pack: Pack, score: ReturnType<typeof calculateScore>, issues: Issue[]): string {
  const strong = issues.filter((issue) => issue.code === "RELATION_STRONG_CAUSAL");
  const unsupported = issues.filter((issue) => ["EVIDENCE_MISSING_EDGE", "RELATION_UNSUPPORTED_TYPE"].includes(issue.code));
  const bias = issues.filter((issue) => issue.category === "bias");
  const critical = issues.filter((issue) => ["error", "critical"].includes(issue.severity));
  const strongRows = strong.map((issue) => `| ${edgeLabel(pack, issue.target_id)} | ${issue.current_relation ?? "-"} | ${issue.suggested_relation ?? "-"} |`).join("\n") || "| - | - | - |";
  const biasRows = bias.map((issue) => `| ${issueTarget(issue)} | ${issue.current_name ?? "-"} | ${issueMessage(issue)} | ${issue.suggested_name ?? "-"} |`).join("\n") || "| - | - | - |";
  const unsupportedRows = unsupported.map((issue) => `| ${edgeLabel(pack, issue.target_id)} | ${issue.current_relation ?? "-"} | ${issueMessage(issue)} | ${issueSuggestion(issue)} |`).join("\n") || "| - | - | - |";

  return `# Megalopa 분석 리포트

## 팩 요약

- 팩: ${pack.title ?? pack.id}
- 버전: ${pack.version ?? "-"}
- 분야: ${pack.domain ?? "-"}
- 노드: ${(pack.nodes ?? []).length}
- 관계: ${(pack.edges ?? []).length}
- 근거 항목: ${(pack.evidence ?? []).length}

## 신뢰도 점수

- 점수: ${score.reliability_score}
- 사용 등급: ${gradeLabel(score.grade)}
- 사용 위험도: ${riskLabel(score.risk_level)}

## 핵심 결과

1. 총 ${(pack.nodes ?? []).length}개 노드와 ${(pack.edges ?? []).length}개 관계를 분석했습니다.
2. 신뢰도 점수는 ${score.reliability_score}점이며 사용 등급은 ${gradeLabel(score.grade)}입니다.
3. 감지된 이슈는 ${issues.length}건입니다. 점수는 진리 판정이 아니라 사용 위험도 안내입니다.

## 먼저 고칠 문제

| 중요도 | 대상 | 문제 | 제안 |
|---|---|---|---|
${issueRows(critical)}

## 확인 필요한 관계

| 관계 | 현재 표현 | 문제 | 제안 |
|---|---|---|---|
${unsupportedRows}

## 너무 단정적인 관계

| 관계 | 현재 표현 | 추천 표현 |
|---|---|---|
${strongRows}

## 편향 표현

| 대상 | 현재 이름 | 문제 | 추천 이름 |
|---|---|---|---|
${biasRows}

## 추천 사용 범위

- 탐색용: ${["low", "medium"].includes(score.risk_level) ? "가능" : "주의 필요"}
- 콘텐츠 생성용: 출처 표시와 수동 검토 후 사용
- 에이전트 자동판단용: ${["medium", "high", "critical"].includes(score.risk_level) ? "비권장" : "제한적 가능"}
- 공개 배포용: ${["trusted", "usable_with_citation"].includes(score.grade) ? "가능" : "수정 후 재검토 권장"}

## 수정 체크리스트

- [ ] 근거 없는 관계 보완
- [ ] 강한 인과 관계 완화
- [ ] 편향적 명명 수정
- [ ] 출처 메타데이터 추가
- [ ] 버전 및 작성자 정보 추가
`;
}

function analyzePack(pack: Pack) {
  const issues = [...validateSchema(pack), ...findStrongRelations(pack), ...detectBiasNaming(pack)];
  const score = calculateScore(pack, issues);
  const markdown = generateMarkdownReport(pack, score, issues);
  return { pack, score, issues, markdown };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));
    const raw = payload.content ?? await readFile(join(process.cwd(), "examples", "sample_pack.json"), "utf-8");
    const pack = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json(analyzePack(pack));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "analysis failed" }, { status: 500 });
  }
}
