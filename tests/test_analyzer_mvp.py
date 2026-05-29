import json
from pathlib import Path

from packages.analyzer.parser import parse_pack
from packages.analyzer.schema_validator import validate_schema
from packages.analyzer.relation_checker import find_unsupported_edges, find_strong_relations
from packages.analyzer.bias_detector import detect_bias_naming
from packages.analyzer.scoring import calculate_score
from packages.analyzer.report_generator import generate_markdown_report


FIXTURES = Path(__file__).parent / "fixtures"


def load_fixture(name: str):
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def test_normal_pack_parsing_counts_nodes_edges_and_evidence():
    pack = parse_pack(FIXTURES / "valid_pack.json")

    assert pack["id"] == "valid_pack"
    assert len(pack["nodes"]) == 2
    assert len(pack["edges"]) == 1
    assert len(pack["evidence"]) == 1


def test_duplicate_node_detection():
    issues = validate_schema(load_fixture("duplicate_nodes.json"))

    assert any(issue["code"] == "SCHEMA_DUPLICATE_NODE_ID" for issue in issues)


def test_edge_missing_source_or_target_detection():
    issues = validate_schema(load_fixture("missing_edge_node.json"))

    codes = {issue["code"] for issue in issues}
    assert "SCHEMA_EDGE_SOURCE_MISSING" in codes
    assert "SCHEMA_EDGE_TARGET_MISSING" in codes


def test_evidence_missing_edge_detection():
    issues = validate_schema(load_fixture("missing_evidence_edge.json"))

    assert any(issue["code"] == "EVIDENCE_MISSING_EDGE" for issue in issues)


def test_causes_relation_warning():
    warnings = find_strong_relations(load_fixture("strong_relation.json"))

    assert warnings[0]["code"] == "RELATION_STRONG_CAUSAL"
    assert warnings[0]["suggested_relation"] == "can_contribute_to"


def test_bias_naming_warning():
    warnings = detect_bias_naming(load_fixture("biased_naming.json"))

    assert any(issue["code"] == "BIAS_STIGMATIZING_LABEL" for issue in warnings)


def test_score_calculation_returns_grade_and_risk_level():
    pack = load_fixture("score_pack.json")
    schema_issues = validate_schema(pack)
    relation_issues = find_unsupported_edges(pack) + find_strong_relations(pack)
    bias_issues = detect_bias_naming(pack)
    result = calculate_score(pack, schema_issues + relation_issues + bias_issues)

    assert 0 <= result["reliability_score"] <= 100
    assert result["grade"] == "exploratory"
    assert result["risk_level"] == "medium"


def test_markdown_report_contains_required_sections():
    pack = load_fixture("score_pack.json")
    issues = validate_schema(pack) + find_strong_relations(pack) + detect_bias_naming(pack)
    score = calculate_score(pack, issues)
    report = generate_markdown_report(pack, score, issues)

    for heading in [
        "# Megalopa Audit Report",
        "## Pack Summary",
        "## Reliability Score",
        "## Key Findings",
        "## Critical Issues",
        "## Unsupported Edges",
        "## Strong Relation Warnings",
        "## Bias / Naming Warnings",
        "## Recommended Use",
        "## Repair Checklist",
    ]:
        assert heading in report
