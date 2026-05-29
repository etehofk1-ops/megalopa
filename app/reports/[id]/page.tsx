"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { MetricCard, Pill } from "@/components/ui";
import { AnalyzeResult } from "@/lib/types";
import { fallbackResult } from "@/lib/sample";

export default function ReportPage() {
  const [result, setResult] = useState<AnalyzeResult>(fallbackResult);

  useEffect(() => {
    const stored = sessionStorage.getItem("megalopa:lastReport");
    if (stored) setResult(JSON.parse(stored));
  }, []);

  const components = Object.entries(result.score.components || {});

  return (
    <AppFrame>
      <section className="shell py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-subtle">Report</div>
            <h1 className="mt-2 font-semibold">Megalopa Audit Report</h1>
            <p className="mt-2 text-muted">점수는 절대 진리가 아니라 현재 팩의 근거, 출처, 구조, 표현 위험도를 기반으로 한 사용 위험도 안내입니다.</p>
          </div>
          <Pill tone={result.score.risk_level === "low" ? "ok" : result.score.risk_level === "medium" ? "warn" : "accent"}>Risk {result.score.risk_level}</Pill>
        </div>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard label="Reliability" value={result.score.reliability_score} detail={result.score.grade} />
          <MetricCard label="Nodes" value={result.score.counts.nodes} detail="parsed nodes" />
          <MetricCard label="Edges" value={result.score.counts.edges} detail="parsed edges" />
          <MetricCard label="Issues" value={result.score.counts.issues} detail="audit findings" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <aside className="card p-4">
            <div className="font-medium">Score components</div>
            <div className="mt-4 space-y-3">
              {components.map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-muted"><span>{key}</span><span>{value}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[#7170ff]" style={{ width: `${Math.min(100, Number(value) * 4)}%` }} /></div>
                </div>
              ))}
            </div>
          </aside>
          <article className="card max-h-[720px] overflow-auto p-5">
            <pre className="markdown-report">{result.markdown}</pre>
          </article>
        </div>
      </section>
    </AppFrame>
  );
}
