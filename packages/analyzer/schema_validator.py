from __future__ import annotations

from collections import Counter
from .issues import make_issue
from .relation_checker import ALLOWED_RELATIONS, STRONG_RELATION_ALTERNATIVES

REQUIRED_PACK_FIELDS = ["id", "title", "version", "description"]


def validate_schema(pack: dict) -> list[dict]:
    issues = []
    for field in REQUIRED_PACK_FIELDS:
        if not pack.get(field):
            issues.append(make_issue("SCHEMA_MISSING_PACK_FIELD", "error", "schema", "pack", pack.get("id", "unknown"), f"Pack is missing required field '{field}'.", f"Add '{field}' to the pack metadata."))

    nodes = pack.get("nodes", [])
    edges = pack.get("edges", [])
    evidence_items = pack.get("evidence", [])
    node_ids = [node.get("id") for node in nodes if node.get("id")]
    evidence_ids = {item.get("id") for item in evidence_items if item.get("id")}
    node_id_set = set(node_ids)

    for node_id, count in Counter(node_ids).items():
        if count > 1:
            issues.append(make_issue("SCHEMA_DUPLICATE_NODE_ID", "error", "schema", "node", node_id, f"Node id '{node_id}' appears {count} times.", "Use globally unique node IDs within each pack."))

    for node in nodes:
        nid = node.get("id", "unknown")
        if not node.get("evidence_ids"):
            issues.append(make_issue("EVIDENCE_MISSING_NODE", "warning", "evidence", "node", nid, "Node has no evidence references.", "Attach at least one evidence item or lower the node confidence."))
        for ev in node.get("evidence_ids", []) or []:
            if ev not in evidence_ids:
                issues.append(make_issue("EVIDENCE_NODE_REFERENCE_MISSING", "error", "evidence", "node", nid, f"Node references missing evidence '{ev}'.", "Create the evidence object or remove the reference."))

    for edge in edges:
        eid = edge.get("id", "unknown")
        source = edge.get("source_node_id")
        target = edge.get("target_node_id")
        if source not in node_id_set:
            issues.append(make_issue("SCHEMA_EDGE_SOURCE_MISSING", "error", "schema", "edge", eid, f"Edge source '{source}' does not reference an existing node.", "Point source_node_id to an existing node."))
        if target not in node_id_set:
            issues.append(make_issue("SCHEMA_EDGE_TARGET_MISSING", "error", "schema", "edge", eid, f"Edge target '{target}' does not reference an existing node.", "Point target_node_id to an existing node."))
        if not edge.get("evidence_ids"):
            issues.append(make_issue("EVIDENCE_MISSING_EDGE", "error", "evidence", "edge", eid, "Edge has no evidence references.", "Edges should include evidence before they are used for agent reasoning."))
        for ev in edge.get("evidence_ids", []) or []:
            if ev not in evidence_ids:
                issues.append(make_issue("EVIDENCE_EDGE_REFERENCE_MISSING", "error", "evidence", "edge", eid, f"Edge references missing evidence '{ev}'.", "Create the evidence object or remove the reference."))
        relation = edge.get("relation_type")
        if relation and relation not in ALLOWED_RELATIONS and relation not in STRONG_RELATION_ALTERNATIVES:
            issues.append(make_issue("RELATION_UNSUPPORTED_TYPE", "warning", "relation", "edge", eid, f"Relation type '{relation}' is not in the supported vocabulary.", "Map this relation to a documented vocabulary term."))

    for item in evidence_items:
        if item.get("source_type") in {None, "", "unknown", "llm_generated"}:
            issues.append(make_issue("PROVENANCE_WEAK_SOURCE", "warning", "provenance", "evidence", item.get("id", "unknown"), "Evidence source type is weak or unknown.", "Prefer official docs, papers, books, or traceable articles."))
    return issues
