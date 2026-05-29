import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

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
      issues.push(makeIssue("SCHEMA_MISSING_PACK_FIELD", "error", "schema", "pack", pack.id ?? "unknown", `Pack is missing required field '${field}'.`, `Add '${field}' to the pack metadata.`));
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
      issues.push(makeIssue("SCHEMA_DUPLICATE_NODE_ID", "error", "schema", "node", nodeId, `Node id '${nodeId}' appears ${count} times.`, "Use globally unique node IDs within each pack."));
    }
  }

  for (const node of nodes) {
    const nid = node.id ?? "unknown";
    if (!node.evidence_ids?.length) {
      issues.push(makeIssue("EVIDENCE_MISSING_NODE", "warning", "evidence", "node", nid, "Node has no evidence references.", "Attach at least one evidence item or lower the node confidence."));
    }
    for (const ev of node.evidence_ids ?? []) {
      if (!evidenceIds.has(ev)) {
        issues.push(makeIssue("EVIDENCE_NODE_REFERENCE_MISSING", "error", "evidence", "node", nid, `Node references missing evidence '${ev}'.`, "Create the evidence object or remove the reference."));
      }
    }
  }

  for (const edge of edges) {
    const eid = edge.id ?? "unknown";
    const source = edge.source_node_id;
    const target = edge.target_node_id;
    if (!nodeIdSet.has(source)) {
      issues.push(makeIssue("SCHEMA_EDGE_SOURCE_MISSING", "error", "schema", "edge", eid, `Edge source '${source}' does not reference an existing node.`, "Point source_node_id to an existing node."));
    }
    if (!nodeIdSet.has(target)) {
      issues.push(makeIssue("SCHEMA_EDGE_TARGET_MISSING", "error", "schema", "edge", eid, `Edge target '${target}' does not reference an existing node.`, "Point target_node_id to an existing node."));
    }
    if (!edge.evidence_ids?.length) {
      issues.push(makeIssue("EVIDENCE_MISSING_EDGE", "error", "evidence", "edge", eid, "Edge has no evidence references.", "Edges should include evidence before they are used for agent reasoning."));
    }
    for (const ev of edge.evidence_ids ?? []) {
      if (!evidenceIds.has(ev)) {
        issues.push(makeIssue("EVIDENCE_EDGE_REFERENCE_MISSING", "error", "evidence", "edge", eid, `Edge references missing evidence '${ev}'.`, "Create the evidence object or remove the reference."));
      }
    }
    const relation = edge.relation_type;
    if (relation && !ALLOWED_RELATIONS.has(relation) && !STRONG_RELATION_ALTERNATIVES[relation]) {
      issues.push(makeIssue("RELATION_UNSUPPORTED_TYPE", "warning", "relation", "edge", eid, `Relation type '${relation}' is not in the supported vocabulary.`, "Map this relation to a documented vocabulary term.", { current_relation: relation }));
    }
  }

  for (const item of evidenceItems) {
    if (!item.source_type || ["unknown", "llm_generated"].includes(item.source_type)) {
      issues.push(makeIssue("PROVENANCE_WEAK_SOURCE", "warning", "provenance", "evidence", item.id ?? "unknown", "Evidence source type is weak or unknown.", "Prefer official docs, papers, books, or traceable articles."));
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
      `Relation '${edge.relation_type}' is strong and may overstate causality or certainty.`,
      "Use a weaker relation unless high-quality evidence supports the strong claim.",
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
      `Name '${label}' may stigmatize or overgeneralize a group or behavior.`,
      "Use neutral, behavior-centered naming instead of identity- or insult-centered wording.",
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

function issueRows(issues: Issue[]): string {
  return issues.length
    ? issues.map((issue) => `| ${issue.severity} | ${issue.target_type}:${issue.target_id} | ${issue.message} | ${issue.suggestion} |`).join("\n")
    : "| - | - | - | - |";
}

function generateMarkdownReport(pack: Pack, score: ReturnType<typeof calculateScore>, issues: Issue[]): string {
  const strong = issues.filter((issue) => issue.code === "RELATION_STRONG_CAUSAL");
  const unsupported = issues.filter((issue) => ["EVIDENCE_MISSING_EDGE", "RELATION_UNSUPPORTED_TYPE"].includes(issue.code));
  const bias = issues.filter((issue) => issue.category === "bias");
  const critical = issues.filter((issue) => ["error", "critical"].includes(issue.severity));
  const strongRows = strong.map((issue) => `| ${edgeLabel(pack, issue.target_id)} | ${issue.current_relation ?? "-"} | ${issue.suggested_relation ?? "-"} |`).join("\n") || "| - | - | - |";
  const biasRows = bias.map((issue) => `| ${issue.target_type}:${issue.target_id} | ${issue.current_name ?? "-"} | ${issue.message} | ${issue.suggested_name ?? "-"} |`).join("\n") || "| - | - | - |";
  const unsupportedRows = unsupported.map((issue) => `| ${edgeLabel(pack, issue.target_id)} | ${issue.current_relation ?? "-"} | ${issue.message} | ${issue.suggestion} |`).join("\n") || "| - | - | - |";

  return `# Megalopa Audit Report

## Pack Summary

- Pack: ${pack.title ?? pack.id}
- Version: ${pack.version ?? "-"}
- Domain: ${pack.domain ?? "-"}
- Nodes: ${(pack.nodes ?? []).length}
- Edges: ${(pack.edges ?? []).length}
- Evidence Items: ${(pack.evidence ?? []).length}

## Reliability Score

- Score: ${score.reliability_score}
- Grade: ${score.grade}
- Risk Level: ${score.risk_level}

## Key Findings

1. 총 ${(pack.nodes ?? []).length}개 노드와 ${(pack.edges ?? []).length}개 엣지를 분석했습니다.
2. Reliability Score는 ${score.reliability_score}점이며 등급은 ${score.grade}입니다.
3. 감지된 이슈는 ${issues.length}건입니다. 점수는 진리 판정이 아니라 사용 위험도 안내입니다.

## Critical Issues

| Severity | Target | Issue | Suggestion |
|---|---|---|---|
${issueRows(critical)}

## Unsupported Edges

| Edge | Relation | Problem | Suggestion |
|---|---|---|---|
${unsupportedRows}

## Strong Relation Warnings

| Edge | Current Relation | Suggested Relation |
|---|---|---|
${strongRows}

## Bias / Naming Warnings

| Target | Current Name | Issue | Suggested Name |
|---|---|---|---|
${biasRows}

## Recommended Use

- 탐색용: ${["low", "medium"].includes(score.risk_level) ? "가능" : "주의 필요"}
- 콘텐츠 생성용: 출처 표시와 수동 검토 후 사용
- 에이전트 자동판단용: ${["medium", "high", "critical"].includes(score.risk_level) ? "비권장" : "제한적 가능"}
- 공개 배포용: ${["trusted", "usable_with_citation"].includes(score.grade) ? "가능" : "수정 후 재검토 권장"}

## Repair Checklist

- [ ] 근거 없는 엣지 보완
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
