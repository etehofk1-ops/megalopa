from __future__ import annotations

from .issues import make_issue

ALLOWED_RELATIONS = {
    "is_a", "part_of", "associated_with", "may_indicate", "often_precedes",
    "supports", "has_risk_factor", "can_contribute_to",
}
STRONG_RELATION_ALTERNATIVES = {
    "causes": "can_contribute_to",
    "proves": "supports",
    "always_leads_to": "often_precedes",
    "is_truth_of": "supports",
    "guarantees": "may_indicate",
    "determines": "can_contribute_to",
}


def find_unsupported_edges(pack: dict) -> list[dict]:
    issues = []
    for edge in pack.get("edges", []):
        relation = edge.get("relation_type", "")
        if relation and relation not in ALLOWED_RELATIONS and relation not in STRONG_RELATION_ALTERNATIVES:
            issues.append(make_issue(
                "RELATION_UNSUPPORTED_TYPE", "warning", "relation", "edge", edge.get("id", "unknown"),
                f"Relation type '{relation}' is not in the supported vocabulary.",
                "Map this relation to a documented vocabulary term before publication.",
                current_relation=relation,
            ))
    return issues


def find_strong_relations(pack: dict) -> list[dict]:
    issues = []
    for edge in pack.get("edges", []):
        relation = edge.get("relation_type", "")
        if relation in STRONG_RELATION_ALTERNATIVES:
            issues.append(make_issue(
                "RELATION_STRONG_CAUSAL", "warning", "relation", "edge", edge.get("id", "unknown"),
                f"Relation '{relation}' is strong and may overstate causality or certainty.",
                "Use a weaker relation unless high-quality evidence supports the strong claim.",
                current_relation=relation,
                suggested_relation=STRONG_RELATION_ALTERNATIVES[relation],
            ))
    return issues
