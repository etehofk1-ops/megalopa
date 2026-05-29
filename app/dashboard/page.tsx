"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { MetricCard, Pill } from "@/components/ui";
import { AnalyzeResult } from "@/lib/types";
import { fallbackResult } from "@/lib/sample";
import { componentPercent, groupIssues, recommendedUse, severityTone } from "@/lib/reportView";
import { loadReport } from "@/lib/reportStorage";

export default function DashboardPage() {
  const [result, setResult] = useState<AnalyzeResult>(fallbackResult);
  useEffect(() => {
    const stored = loadReport();
    if (stored) setResult(stored);
  }, []);

  const groups = groupIssues(result.issues);
  const components = Object.entries(result.score.components || {}).filter(([key]) => ["evidence_coverage", "relation_quality", "schema_consistency", "provenance_quality"].includes(key));

  return (
    <AppFrame>
      <section className="shell py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-subtle">Analysis Dashboard</div>
            <h1 className="mt-2 font-semibold">Pack reliability overview</h1>
            <p className="mt-2 text-muted">분석 결과를 위험도, 수정 우선순위, 점수 구성요소 순서로 요약합니다.</p>
          </div>
          <Pill tone={result.score.risk_level === "low" ? "ok" : result.score.risk_level === "medium" ? "warn" : "accent"}>Risk {result.score.risk_level}</Pill>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="card p-5">
            <div className="text-subtle">Reliability Score</div>
            <div className="mt-4 text-[42px] font-semibold leading-none text-[#f7f8f8]">{result.score.reliability_score}</div>
            <div className="mt-2 text-muted">Grade: {result.score.grade}</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[#7170ff]" style={{ width: `${result.score.reliability_score}%` }} /></div>
            <div className="mt-5 space-y-2">
              {recommendedUse(result).map((item) => (
                <div key={item.label} className="flex justify-between gap-3 border-b border-white/[0.06] pb-2 last:border-0"><span className="text-muted">{item.label}</span><span>{item.value}</span></div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Nodes" value={result.score.counts.nodes} detail="parsed" />
            <MetricCard label="Edges" value={result.score.counts.edges} detail="parsed" />
            <MetricCard label="Unsupported" value={groups.unsupported.length} detail="edge findings" />
            <MetricCard label="Bias" value={groups.bias.length} detail="naming warnings" />
            <MetricCard label="Critical" value={groups.critical.length} detail="blocking issues" />
            <MetricCard label="Strong Relation" value={groups.strong.length} detail="causal warnings" />
            <MetricCard label="Evidence" value={result.score.counts.evidence} detail="items" />
            <MetricCard label="Issues" value={result.score.counts.issues} detail="total findings" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="card p-5">
            <div className="mb-4 font-medium">Core score components</div>
            <div className="space-y-4">
              {components.map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-muted"><span>{key}</span><span>{value}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[#7170ff]" style={{ width: `${componentPercent(key, Number(value))}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex justify-between"><span className="font-medium">Repair queue</span><span className="text-muted">top findings</span></div>
            <div className="grid gap-2">
              {result.issues.slice(0, 6).map((issue) => (
                <div key={issue.id} className={`rounded-lg border p-3 ${severityTone(issue.severity)}`}>
                  <div className="mb-1 flex flex-wrap justify-between gap-2"><span>{issue.code}</span><span>{issue.target_type}:{issue.target_id}</span></div>
                  <div>{issue.message}</div>
                  <div className="mt-1 text-muted">{issue.suggestion}</div>
                </div>
              ))}
              {!result.issues.length ? <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-muted">분석 결과가 없습니다. Upload 화면에서 샘플 팩을 분석하세요.</div> : null}
            </div>
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
