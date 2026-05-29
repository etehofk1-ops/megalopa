"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { MetricCard } from "@/components/ui";
import { AnalyzeResult } from "@/lib/types";
import { fallbackResult } from "@/lib/sample";

export default function DashboardPage() {
  const [result, setResult] = useState<AnalyzeResult>(fallbackResult);
  useEffect(() => {
    const stored = sessionStorage.getItem("megalopa:lastReport");
    if (stored) setResult(JSON.parse(stored));
  }, []);

  const strong = result.issues.filter((issue) => issue.code === "RELATION_STRONG_CAUSAL").length;
  const unsupported = result.issues.filter((issue) => issue.code === "EVIDENCE_MISSING_EDGE" || issue.code === "RELATION_UNSUPPORTED_TYPE").length;
  const bias = result.issues.filter((issue) => issue.category === "bias").length;

  return (
    <AppFrame>
      <section className="shell py-10">
        <div className="mb-6">
          <div className="text-subtle">Analysis Dashboard</div>
          <h1 className="mt-2 font-semibold">Pack reliability overview</h1>
        </div>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="Score" value={result.score.reliability_score} detail={result.score.grade} />
          <MetricCard label="Risk" value={result.score.risk_level} detail="recommended caution" />
          <MetricCard label="Nodes" value={result.score.counts.nodes} detail="parsed" />
          <MetricCard label="Edges" value={result.score.counts.edges} detail="parsed" />
          <MetricCard label="Unsupported" value={unsupported} detail="edge findings" />
          <MetricCard label="Bias" value={bias} detail="naming warnings" />
        </div>
        <div className="card mt-4 p-5">
          <div className="mb-4 flex justify-between"><span className="font-medium">Relation review</span><span className="text-muted">Strong relation warnings {strong}</span></div>
          <div className="grid gap-2">
            {result.issues.slice(0, 8).map((issue) => (
              <div key={issue.id} className="grid gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 md:grid-cols-[160px_1fr_1fr]">
                <span className="text-accent">{issue.code}</span>
                <span>{issue.message}</span>
                <span className="text-muted">{issue.suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
