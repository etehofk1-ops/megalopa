from __future__ import annotations

HIGH_QUALITY_SOURCES = {"paper", "official", "book", "article"}
WEAK_SOURCES = {"unknown", "llm_generated", "personal"}


def _ratio(numerator: int, denominator: int) -> float:
    return 1.0 if denominator == 0 else max(0.0, min(1.0, numerator / denominator))


def grade_for(score: int) -> str:
    if score >= 90:
        return "trusted"
    if score >= 75:
        return "usable_with_citation"
    if score >= 60:
        return "exploratory"
    if score >= 40:
        return "private_only"
    return "quarantine"


def risk_for(score: int, issues: list[dict]) -> str:
    if any(issue.get("severity") == "critical" for issue in issues) or score < 40:
        return "critical"
    if any(issue.get("code") in {"SCHEMA_EDGE_SOURCE_MISSING", "SCHEMA_EDGE_TARGET_MISSING"} for issue in issues) or score < 60:
        return "high"
    if any(issue.get("severity") == "error" for issue in issues) or score < 75:
        return "medium"
    return "low"


def calculate_score(pack: dict, issues: list[dict]) -> dict:
    nodes = pack.get("nodes", [])
    edges = pack.get("edges", [])
    evidence = pack.get("evidence", [])
    evidence_ids = {item.get("id") for item in evidence if item.get("id")}

    evidenced_nodes = sum(1 for node in nodes if node.get("evidence_ids"))
    evidenced_edges = sum(1 for edge in edges if edge.get("evidence_ids"))
    coverage_ratio = (0.35 * _ratio(evidenced_nodes, len(nodes))) + (0.65 * _ratio(evidenced_edges, len(edges)))
    evidence_coverage = round(25 * coverage_ratio, 2)

    relation_issue_count = sum(1 for issue in issues if issue.get("category") == "relation")
    relation_quality = round(max(0, 20 - relation_issue_count * 6), 2)

    schema_issue_count = sum(1 for issue in issues if issue.get("category") == "schema")
    missing_ref_issue_count = sum(1 for issue in issues if issue.get("code", "").endswith("REFERENCE_MISSING"))
    schema_consistency = round(max(0, 15 - schema_issue_count * 5 - missing_ref_issue_count * 3), 2)

    high_quality = sum(1 for item in evidence if item.get("source_type") in HIGH_QUALITY_SOURCES and item.get("source_url"))
    weak = sum(1 for item in evidence if item.get("source_type") in WEAK_SOURCES or not item.get("source_url"))
    provenance_quality = round(max(0, 15 * _ratio(high_quality, len(evidence)) - weak * 3), 2)

    consensus_strength = 6.0
    recency = 3.0
    inference_utility = 7.0
    raw = evidence_coverage + relation_quality + schema_consistency + provenance_quality + consensus_strength + recency + inference_utility
    score = int(round(max(0, min(100, raw))))
    return {
        "reliability_score": score,
        "grade": grade_for(score),
        "risk_level": risk_for(score, issues),
        "components": {
            "evidence_coverage": evidence_coverage,
            "relation_quality": relation_quality,
            "schema_consistency": schema_consistency,
            "provenance_quality": provenance_quality,
            "consensus_strength": consensus_strength,
            "recency": recency,
            "inference_utility": inference_utility,
        },
        "counts": {
            "nodes": len(nodes),
            "edges": len(edges),
            "evidence": len(evidence_ids),
            "issues": len(issues),
        },
    }
