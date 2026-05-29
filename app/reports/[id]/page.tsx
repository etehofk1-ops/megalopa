"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { Button, MetricCard, Pill } from "@/components/ui";
import { AnalyzeResult } from "@/lib/types";
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

export default function ReportPage() {
  const [result, setResult] = useState<AnalyzeResult>(fallbackResult);
  const [view, setView] = useState<"structured" | "markdown">("structured");
  const [copyStatus, setCopyStatus] = useState("리포트 복사");
  const params = useParams<{ id: string }>();

  useEffect(() => {
    const stored = loadReport(params.id);
    if (stored) setResult(stored);
  }, [params.id]);

  const components = Object.entries(result.score.components || {});
  const groups = groupIssues(result.issues);
  const uses = recommendedUse(result);

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopyStatus("복사 완료");
    } catch {
      setCopyStatus("복사 실패");
    } finally {
      setTimeout(() => setCopyStatus("리포트 복사"), 1600);
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const safeId = String(result.pack?.id ?? "megalopa").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
    anchor.download = `${safeId}_audit_report.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppFrame>
      <section className="shell py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-subtle">상세 리포트</div>
            <h1 className="mt-2 font-semibold">Megalopa 분석 리포트</h1>
            <div className="mt-1 text-subtle">리포트 ID: {result.report_id ?? params.id}</div>
            <p className="mt-2 text-muted">점수는 절대 진리가 아니라 현재 팩의 근거, 출처, 구조, 표현 위험도를 기반으로 한 사용 위험도 안내입니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={result.score.risk_level === "low" ? "ok" : result.score.risk_level === "medium" ? "warn" : "accent"}>사용 위험도: {riskLabel(result.score.risk_level)}</Pill>
            <Link href="/docs/read-report" className="inline-flex items-center justify-center rounded-md border border-[#80e0bb]/30 bg-[#80e0bb]/10 px-3 py-2 font-medium text-[#c7f4df]">결과 읽는 법</Link>
            <Button onClick={copyMarkdown}>{copyStatus}</Button>
            <Button onClick={downloadMarkdown}>Markdown 저장</Button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard label="신뢰도 점수" value={result.score.reliability_score} detail={gradeLabel(result.score.grade)} />
          <MetricCard label="먼저 고칠 문제" value={groups.critical.length} detail="필수 확인" />
          <MetricCard label="확인 필요" value={groups.unsupported.length} detail="관계 문제" />
          <MetricCard label="편향 표현" value={groups.bias.length} detail="명명 문제" />
        </div>

        <div className="mb-4 flex gap-2">
          <button className={`rounded-md border px-3 py-2 ${view === "structured" ? "border-[#7170ff]/50 bg-[#7170ff]/10" : "border-white/10 bg-white/[0.03]"}`} onClick={() => setView("structured")} type="button">보기 쉽게 보기</button>
          <button className={`rounded-md border px-3 py-2 ${view === "markdown" ? "border-[#7170ff]/50 bg-[#7170ff]/10" : "border-white/10 bg-white/[0.03]"}`} onClick={() => setView("markdown")} type="button">원문 리포트</button>
        </div>

        {view === "markdown" ? (
          <article className="card max-h-[760px] overflow-auto p-5">
            <pre className="markdown-report">{result.markdown}</pre>
          </article>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <aside className="space-y-4">
              <div className="card p-4">
                <div className="font-medium">점수 구성</div>
                <div className="mt-4 space-y-3">
                  {components.map(([key, value]) => (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-muted"><span>{componentLabel(key)}</span><span>{value}</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[#7170ff]" style={{ width: `${componentPercent(key, Number(value))}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-4">
                <div className="font-medium">추천 사용 범위</div>
                <div className="mt-3 space-y-2">
                  {uses.map((item) => (
                    <div key={item.label} className="flex justify-between gap-3 border-b border-white/[0.06] pb-2 last:border-0 last:pb-0">
                      <span className="text-muted">{item.label}</span><span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-4">
              <div className="card p-4">
                <div className="mb-3 font-medium">수정 우선순위</div>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3"><input className="mr-2" type="checkbox" readOnly />근거 없는 관계 보완</label>
                  <label className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3"><input className="mr-2" type="checkbox" readOnly />강한 인과 관계 완화</label>
                  <label className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3"><input className="mr-2" type="checkbox" readOnly />편향적 명명 수정</label>
                  <label className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3"><input className="mr-2" type="checkbox" readOnly />출처 메타데이터 추가</label>
                </div>
              </div>

              <IssueSection title="먼저 고칠 문제" issues={groups.critical} />
              <IssueSection title="확인 필요한 관계" issues={groups.unsupported} />
              <IssueSection title="너무 단정적인 관계" issues={groups.strong} />
              <IssueSection title="편향 표현" issues={groups.bias} />
            </div>
          </div>
        )}
      </section>
    </AppFrame>
  );
}

function IssueSection({ title, issues }: { title: string; issues: AnalyzeResult["issues"] }) {
  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between"><span className="font-medium">{title}</span><span className="text-muted">{issues.length}</span></div>
      {issues.length ? (
        <div className="space-y-2">
          {issues.map((issue) => (
            <div key={issue.id} className={`rounded-lg border p-3 ${severityTone(issue.severity)}`}>
              <div className="mb-1 flex flex-wrap justify-between gap-2"><span>{issueCodeLabel(issue.code)}</span><span>{targetTypeLabel(issue.target_type)}:{issue.target_id}</span></div>
              <div>{issueMessage(issue)}</div>
              <div className="mt-2 text-muted">제안: {issueSuggestion(issue)}</div>
              {issue.suggested_relation ? <div className="mt-1 text-[#80e0bb]">추천 관계 표현: {issue.suggested_relation}</div> : null}
              {issue.suggested_name ? <div className="mt-1 text-[#80e0bb]">추천 이름: {issue.suggested_name}</div> : null}
            </div>
          ))}
        </div>
      ) : <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-muted">이 항목에는 발견된 문제가 없습니다.</div>}
    </section>
  );
}
