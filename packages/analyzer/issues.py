from __future__ import annotations

from typing import Any


def make_issue(code: str, severity: str, category: str, target_type: str, target_id: str, message: str, suggestion: str = "", **extra: Any) -> dict[str, Any]:
    issue = {
        "id": f"{code.lower()}:{target_type}:{target_id}",
        "code": code,
        "severity": severity,
        "category": category,
        "target_type": target_type,
        "target_id": target_id,
        "message": message,
        "suggestion": suggestion,
    }
    issue.update(extra)
    return issue
