from __future__ import annotations

import argparse
import json
from pathlib import Path

from .bias_detector import detect_bias_naming
from .parser import parse_pack
from .relation_checker import find_strong_relations, find_unsupported_edges
from .report_generator import generate_markdown_report
from .schema_validator import validate_schema
from .scoring import calculate_score


def analyze_pack(pack: dict) -> dict:
    issues = []
    issues.extend(validate_schema(pack))
    issues.extend(find_unsupported_edges(pack))
    issues.extend(find_strong_relations(pack))
    issues.extend(detect_bias_naming(pack))
    deduped = list({issue["id"]: issue for issue in issues}.values())
    score = calculate_score(pack, deduped)
    markdown = generate_markdown_report(pack, score, deduped)
    return {"pack": pack, "score": score, "issues": deduped, "markdown": markdown}


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze an OpenCrab ontology pack.")
    parser.add_argument("input")
    parser.add_argument("--out")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    result = analyze_pack(parse_pack(args.input))
    if args.out:
        Path(args.out).write_text(result["markdown"], encoding="utf-8")
    print(json.dumps(result if args.json else {"score": result["score"], "issues": result["issues"], "markdown": result["markdown"]}, ensure_ascii=False))

if __name__ == "__main__":
    main()
