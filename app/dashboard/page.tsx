"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { AppFrame } from "@/components/AppFrame";
import { MetricCard, Pill } from "@/components/ui";
import { AnalyzeResult, Issue } from "@/lib/types";
import { fallbackResult } from "@/lib/sample";
import {
  componentLabel,
  componentPercent,
  gradeLabel,
  groupIssues,
  issueCodeLabel,
  issueMessage,
  issueSuggestion,
  recommendedUse,
  riskLabel,
  severityTone,
  targetTypeLabel,
} from "@/lib/reportView";
import { loadReport } from "@/lib/reportStorage";

type IssueFocus = "all" | "critical" | "unsupported" | "strong" | "bias" | `component:${string}`;

export default function DashboardPage() {
  const [result, setResult] = useState<AnalyzeResult>(fallbackResult);
  const [issueFocus, setIssueFocus] = useState<IssueFocus>("all");
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadReport();
    if (stored) setResult(stored);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const groups = groupIssues(result.issues);
  const components = Object.entries(result.score.components || {}).filter(([key]) => ["evidence_coverage", "relation_quality", "schema_consistency", "provenance_quality"].includes(key));
  const visibleIssues = issuesForFocus(issueFocus, result.issues, groups);
  const focusLabel = focusTitle(issueFocus);
  const scoreReasons = [
    groups.critical.length ? `먼저 고칠 문제 ${groups.critical.length}건` : "",
    groups.unsupported.length ? `확인 필요한 관계 ${groups.unsupported.length}건` : "",
    groups.strong.length ? `단정적 관계 ${groups.strong.length}건` : "",
    groups.bias.length ? `편향 표현 ${groups.bias.length}건` : "",
  ].filter(Boolean);

  function chooseFocus(nextFocus: IssueFocus) {
    const resolvedFocus = issueFocus === nextFocus ? "all" : nextFocus;
    setIssueFocus(resolvedFocus);
    setExpandedIssueId(null);
    setToast(resolvedFocus === "all" ? "전체 문제를 다시 보여줍니다." : `${focusTitle(resolvedFocus)}만 모아서 보여줍니다.`);
  }

  return (
    <AppFrame>
      <section className="shell py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-subtle">분석 요약</div>
            <h1 className="mt-2 font-semibold">팩 신뢰도 한눈에 보기</h1>
            <p className="mt-2 text-muted">분석 결과를 위험도, 수정 우선순위, 점수 구성요소 순서로 요약합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone={result.score.risk_level === "low" ? "ok" : result.score.risk_level === "medium" ? "warn" : "accent"}>사용 위험도: {riskLabel(result.score.risk_level)}</Pill>
            <HelpTip text="점수보다 먼저 보는 신호입니다. 높음 이상이면 자동 판단보다 수동 검토가 먼저입니다." />
          </div>
        </div>

        <RepairSteps issues={result.score.counts.issues} risk={result.score.risk_level} />

        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-subtle">신뢰도 점수 <HelpTip text="0-100점 참고 지표입니다. 근거 연결, 관계 표현, 구조 일관성, 출처 신뢰도를 합쳐 계산합니다." /></div>
            <div className="mt-4 text-[46px] font-semibold leading-none text-[#f7f8f8]">{result.score.reliability_score}</div>
            <div className="mt-2 text-muted">사용 등급: {gradeLabel(result.score.grade)}</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[#7170ff]" style={{ width: `${result.score.reliability_score}%` }} /></div>
            <button
              type="button"
              className={clsx("mt-4 w-full rounded-md border px-3 py-2 text-left font-medium transition", scoreOpen ? "border-[#7170ff]/50 bg-[#7170ff]/10 text-[#f7f8f8]" : "border-white/10 bg-white/[0.03] text-[#d0d6e0] hover:bg-white/[0.06]")}
              onClick={() => setScoreOpen((open) => !open)}
              aria-expanded={scoreOpen}
            >
              왜 이 점수인가요
            </button>
            {scoreOpen ? (
              <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/20 p-3">
                <div className="font-medium text-[#f7f8f8]">{scoreReasons.length ? scoreReasons.join(", ") : "큰 위험 신호가 없습니다."}</div>
                <p className="mt-1 text-muted">현재 등급은 {gradeLabel(result.score.grade)}이며, 자동판단보다는 사람이 먼저 검토하는 흐름이 적합합니다.</p>
              </div>
            ) : null}
            <div className="mt-5 space-y-2">
              {recommendedUse(result).map((item) => (
                <div key={item.label} className="flex justify-between gap-3 border-b border-white/[0.06] pb-2 last:border-0"><span className="text-muted">{item.label}</span><span>{item.value}</span></div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="노드" value={result.score.counts.nodes} detail="분석됨" />
            <MetricCard label="관계" value={result.score.counts.edges} detail="분석됨" />
            <FocusMetric label="확인 필요" value={groups.unsupported.length} detail="관계 문제" help="근거가 없거나 표준 관계 표현이 아닌 항목입니다." active={issueFocus === "unsupported"} onClick={() => chooseFocus("unsupported")} />
            <FocusMetric label="편향 표현" value={groups.bias.length} detail="명명 문제" help="낙인, 혐오, 과잉 일반화로 읽힐 수 있는 이름입니다." active={issueFocus === "bias"} onClick={() => chooseFocus("bias")} />
            <FocusMetric label="먼저 고칠 문제" value={groups.critical.length} detail="필수 확인" help="공개 배포나 자동 판단 전에 먼저 처리해야 할 항목입니다." active={issueFocus === "critical"} onClick={() => chooseFocus("critical")} />
            <FocusMetric label="단정적 관계" value={groups.strong.length} detail="표현 완화 필요" help="causes처럼 확실하게 단정하는 관계 표현입니다." active={issueFocus === "strong"} onClick={() => chooseFocus("strong")} />
            <MetricCard label="근거" value={result.score.counts.evidence} detail="개" />
            <FocusMetric label="전체 문제" value={result.score.counts.issues} detail="발견됨" help="분석에서 발견한 모든 검토 항목입니다." active={issueFocus === "all"} onClick={() => chooseFocus("all")} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="card p-5">
            <div className="mb-4 font-medium">점수 구성</div>
            <div className="space-y-4">
              {components.map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  className={clsx("component-row w-full rounded-md p-2 text-left transition", issueFocus === `component:${key}` ? "is-active" : "")}
                  onClick={() => chooseFocus(`component:${key}`)}
                  title={componentHint(key)}
                >
                  <div className="mb-1 flex justify-between gap-3 text-muted"><span className="inline-flex items-center gap-2">{componentLabel(key)} <HelpTip text={componentExplanation(key)} /></span><span>{value}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[#7170ff]" style={{ width: `${componentPercent(key, Number(value))}%` }} /></div>
                  <div className="mt-1 flex justify-between gap-3 text-subtle"><span>{componentHint(key)}</span><span>{componentIssueCount(key, result.issues)}건</span></div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">수정 우선순위</span>
              <div className="flex items-center gap-2">
                <span className="text-muted">{focusLabel}</span>
                {issueFocus !== "all" ? (
                  <button type="button" className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-muted transition hover:bg-white/[0.06]" onClick={() => chooseFocus("all")}>전체 보기</button>
                ) : null}
              </div>
            </div>
            <div className="grid gap-2">
              {visibleIssues.slice(0, 6).map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  expanded={expandedIssueId === issue.id}
                  onToggle={() => setExpandedIssueId((current) => current === issue.id ? null : issue.id)}
                />
              ))}
              {!result.issues.length ? <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-muted">분석 결과가 없습니다. 분석하기 화면에서 샘플 팩을 분석하세요.</div> : null}
              {result.issues.length && !visibleIssues.length ? <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-muted">이 범위에는 발견된 문제가 없습니다.</div> : null}
            </div>
          </div>
        </div>
        <StatusToast message={toast} />
      </section>
    </AppFrame>
  );
}

function FocusMetric({ label, value, detail, help, active, onClick }: { label: string; value: string | number; detail: string; help: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={clsx("card interactive-card p-4 text-left", active && "is-active")}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="flex items-center gap-2 text-subtle">{label}<HelpTip text={help} /></div>
      <div className="mt-3 font-semibold text-[#f7f8f8]">{value}</div>
      <div className="mt-1 text-muted">{detail}</div>
    </button>
  );
}

function RepairSteps({ issues, risk }: { issues: number; risk: string }) {
  const steps = [
    { label: "분석 완료", detail: "팩 구조 확인", done: true },
    { label: "위험 확인", detail: `위험도 ${riskLabel(risk)}`, done: true },
    { label: "문제 수정", detail: issues ? `${issues}건 남음` : "필요 없음", done: issues === 0 },
    { label: "재분석", detail: issues ? "수정 후 권장" : "완료 가능", done: false },
  ];

  return (
    <div className="repair-steps mb-4 grid gap-2 md:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step.label} className={clsx("repair-step rounded-lg border p-3", step.done && "is-done", !step.done && index === 2 && issues > 0 && "is-current")}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-subtle">0{index + 1}</span>
            <span className="step-dot" />
          </div>
          <div className="mt-2 font-medium text-[#f7f8f8]">{step.label}</div>
          <div className="mt-1 text-muted">{step.detail}</div>
        </div>
      ))}
    </div>
  );
}

function HelpTip({ text }: { text: string }) {
  return (
    <span className="help-tip" aria-hidden="true" title={text}>
      <span>?</span>
      <span className="help-bubble" aria-hidden="true">{text}</span>
    </span>
  );
}

function StatusToast({ message }: { message: string | null }) {
  return (
    <div className={clsx("status-toast", message && "is-visible")} role="status" aria-live="polite">
      {message}
    </div>
  );
}

function IssueCard({ issue, expanded, onToggle }: { issue: Issue; expanded: boolean; onToggle: () => void }) {
  const example = repairExample(issue);

  return (
    <article className={clsx("issue-card rounded-lg border", severityTone(issue.severity), expanded && "is-expanded")}>
      <button type="button" className="w-full p-3 text-left" onClick={onToggle} aria-expanded={expanded}>
        <div className="mb-1 flex flex-wrap justify-between gap-2">
          <span>{issueCodeLabel(issue.code)}</span>
          <span>{targetTypeLabel(issue.target_type)}:{issue.target_id}</span>
        </div>
        <div>{issueMessage(issue)}</div>
        <div className="mt-1 text-muted">{issueSuggestion(issue)}</div>
        <div className="mt-2 text-subtle">{expanded ? "접기" : "자세히 보기"}</div>
      </button>
      {expanded ? (
        <div className="border-t border-white/[0.08] px-3 pb-3 pt-3">
          <div className="grid gap-2 md:grid-cols-3">
            <DetailChip label="대상" value={`${targetTypeLabel(issue.target_type)} ${issue.target_id}`} />
            <DetailChip label="영향" value={issueImpact(issue)} />
            <DetailChip label="다음 행동" value={nextAction(issue)} />
          </div>
          {example ? (
            <div className="mt-3 rounded-md border border-white/[0.06] bg-black/20 p-3">
              <div className="text-subtle">수정 예시</div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <code className="rounded-md border border-white/[0.06] bg-black/30 p-2 text-muted">{example.before}</code>
                <code className="rounded-md border border-[#80e0bb]/20 bg-[#80e0bb]/5 p-2 text-[#c7f4df]">{example.after}</code>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.025] p-2">
      <div className="text-subtle">{label}</div>
      <div className="mt-1 text-[#f7f8f8]">{value}</div>
    </div>
  );
}

function issuesForFocus(focus: IssueFocus, issues: Issue[], groups: ReturnType<typeof groupIssues>) {
  if (focus === "all") return issues;
  if (focus === "critical") return groups.critical;
  if (focus === "unsupported") return groups.unsupported;
  if (focus === "strong") return groups.strong;
  if (focus === "bias") return groups.bias;
  if (focus.startsWith("component:")) return componentIssues(focus.replace("component:", ""), issues);
  return issues;
}

function componentIssues(key: string, issues: Issue[]) {
  const categoryByComponent: Record<string, string[]> = {
    evidence_coverage: ["evidence"],
    relation_quality: ["relation"],
    schema_consistency: ["schema"],
    provenance_quality: ["provenance"],
  };
  const categories = categoryByComponent[key] || [];
  return issues.filter((issue) => categories.includes(issue.category));
}

function componentIssueCount(key: string, issues: Issue[]) {
  return componentIssues(key, issues).length;
}

function focusTitle(focus: IssueFocus) {
  if (focus === "all") return "주요 문제";
  if (focus === "critical") return "먼저 고칠 문제";
  if (focus === "unsupported") return "확인 필요한 관계";
  if (focus === "strong") return "단정적 관계";
  if (focus === "bias") return "편향 표현";
  if (focus.startsWith("component:")) return componentLabel(focus.replace("component:", ""));
  return "주요 문제";
}

function componentHint(key: string) {
  const hints: Record<string, string> = {
    evidence_coverage: "근거 누락",
    relation_quality: "관계 표현",
    schema_consistency: "구조 오류",
    provenance_quality: "출처 품질",
  };
  return hints[key] ?? "관련 문제";
}

function componentExplanation(key: string) {
  const explanations: Record<string, string> = {
    evidence_coverage: "노드와 관계에 근거가 얼마나 잘 연결되어 있는지 봅니다.",
    relation_quality: "관계 표현이 너무 강하거나 표준 어휘에서 벗어났는지 봅니다.",
    schema_consistency: "필수 정보, 중복 노드, 잘못된 참조처럼 구조 문제를 봅니다.",
    provenance_quality: "출처 종류와 추적 가능한 링크가 충분한지 봅니다.",
  };
  return explanations[key] ?? "이 점수와 연결된 문제를 모아서 볼 수 있습니다.";
}

function issueImpact(issue: Issue) {
  if (issue.category === "evidence") return "근거 없이 추론될 수 있음";
  if (issue.category === "relation") return "관계가 과하게 단정될 수 있음";
  if (issue.category === "provenance") return "출처 신뢰도가 낮아짐";
  if (issue.category === "schema") return "팩 구조가 깨질 수 있음";
  if (issue.category === "bias") return "표현이 편향적으로 읽힐 수 있음";
  return "사용 전 검토 필요";
}

function nextAction(issue: Issue) {
  if (issue.code.includes("MISSING_EDGE")) return "관계에 근거 연결";
  if (issue.code.includes("MISSING_NODE")) return "노드에 근거 연결";
  if (issue.code === "RELATION_STRONG_CAUSAL") return "관계 표현 완화";
  if (issue.code === "PROVENANCE_WEAK_SOURCE") return "출처 보강";
  if (issue.category === "bias") return "중립 표현으로 수정";
  if (issue.category === "schema") return "누락 필드 수정";
  return "수동 검토";
}

function repairExample(issue: Issue) {
  if (issue.code === "RELATION_STRONG_CAUSAL") {
    return {
      before: `"relation_type": "${issue.current_relation ?? "causes"}"`,
      after: `"relation_type": "${issue.suggested_relation ?? "can_contribute_to"}"`,
    };
  }
  if (issue.code === "EVIDENCE_MISSING_EDGE" || issue.code === "EVIDENCE_MISSING_NODE") {
    return {
      before: `"evidence_ids": []`,
      after: `"evidence_ids": ["ev1"]`,
    };
  }
  if (issue.code === "PROVENANCE_WEAK_SOURCE") {
    return {
      before: `"source_type": "unknown"`,
      after: `"source_type": "paper", "source_url": "https://..."`,
    };
  }
  if (issue.category === "bias") {
    return {
      before: `"label": "${issue.current_name ?? "문제 표현"}"`,
      after: `"label": "${issue.suggested_name ?? "중립적 이름"}"`,
    };
  }
  return null;
}
