from __future__ import annotations

import json
from pathlib import Path
from typing import Any

try:
    import yaml
except Exception:  # pragma: no cover
    yaml = None


def parse_pack(path_or_text: str | Path | dict[str, Any]) -> dict[str, Any]:
    if isinstance(path_or_text, dict):
        return path_or_text
    candidate = Path(path_or_text) if not isinstance(path_or_text, Path) else path_or_text
    if candidate.exists():
        text = candidate.read_text(encoding="utf-8")
        suffix = candidate.suffix.lower()
    else:
        text = str(path_or_text)
        suffix = ""
    if suffix in {".yaml", ".yml"}:
        if yaml is None:
            raise RuntimeError("PyYAML is required to parse YAML packs")
        data = yaml.safe_load(text)
    else:
        data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("Ontology pack must be a JSON/YAML object")
    data.setdefault("nodes", [])
    data.setdefault("edges", [])
    data.setdefault("evidence", [])
    return data
