from __future__ import annotations

from .issues import make_issue

STIGMA_TERMS = ["정병", "관종", "미친", "혐오", "한남", "김치녀", "충", "병신"]
GENERALIZATION_TERMS = ["여성", "남성", "장애", "질병", "인종", "민족"]


def _scan_text(text: str) -> tuple[bool, str]:
    normalized = text.lower()
    stigma = next((term for term in STIGMA_TERMS if term.lower() in normalized), "")
    if stigma:
        return True, stigma
    return False, ""


def detect_bias_naming(pack: dict) -> list[dict]:
    issues = []
    targets = [("pack", pack.get("id", "unknown"), pack.get("title", ""))]
    targets.extend(("node", node.get("id", "unknown"), node.get("label", "")) for node in pack.get("nodes", []))
    for target_type, target_id, label in targets:
        risky, term = _scan_text(str(label))
        if risky:
            issues.append(make_issue(
                "BIAS_STIGMATIZING_LABEL", "warning", "bias", target_type, target_id,
                f"Name '{label}' may stigmatize or overgeneralize a group or behavior.",
                "Use neutral, behavior-centered naming instead of identity- or insult-centered wording.",
                current_name=label,
                flagged_term=term,
                suggested_name="행동 구조 중심의 중립적 명명으로 수정",
                confidence=0.82,
            ))
    return issues
