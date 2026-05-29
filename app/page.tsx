import Link from "next/link";
import { AppFrame } from "@/components/AppFrame";
import { NodeIcon, ShieldIcon } from "@/components/icons";
import { MetricCard, Pill } from "@/components/ui";

export default function HomePage() {
  return (
    <AppFrame>
      <section className="shell grid gap-8 py-12 lg:grid-cols-[1fr_460px]">
        <div className="flex flex-col justify-center">
          <div className="mb-5 flex flex-wrap gap-2">
            <Pill tone="accent">OpenCrab Pack Audit</Pill>
            <Pill>Reliability Report</Pill>
            <Pill>Agent Safety</Pill>
          </div>
          <h1 className="max-w-2xl font-semibold text-[#f7f8f8]">
            OpenCrab 팩을 신뢰하기 전에, 엣지의 근거와 관계 강도를 먼저 검수하세요.
          </h1>
          <p className="mt-5 max-w-2xl text-muted">
            Megalopa는 진리 판정기가 아니라 사용 위험도 평가기입니다. MVP에서는 JSON 팩에서 unsupported edge, strong relation, bias naming, provenance gap을 찾고 사람이 검토 가능한 Markdown 리포트를 생성합니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/upload" className="rounded-md border border-[#7170ff]/40 bg-[#5e6ad2] px-4 py-2 font-medium text-white">Pack 분석 시작</Link>
            <Link href="/reports/sample" className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 font-medium text-[#f7f8f8]">샘플 리포트 보기</Link>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-subtle">Before</div>
              <div className="mt-2 font-medium text-[#fecaca]">anxiety causes barking</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-subtle">Megalopa Warning</div>
              <div className="mt-2 font-medium text-[#f8c46c]">Strong causal relation</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-subtle">After</div>
              <div className="mt-2 font-medium text-[#80e0bb]">anxiety can_contribute_to barking</div>
            </div>
          </div>
        </div>
        <div className="card panel-grid p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted">Sample audit preview</span>
            <ShieldIcon className="h-4 w-4 text-[#a6a5ff]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Reliability" value="68" detail="exploratory" />
            <MetricCard label="Risk Level" value="medium" detail="manual review required" />
            <MetricCard label="Unsupported" value="1" detail="edge finding" />
            <MetricCard label="Strong Relation" value="1" detail="causal warning" />
          </div>
          <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
            <NodeIcon className="mb-3 h-5 w-5 text-[#80e0bb]" />
            <div className="font-medium">노드보다 엣지를 더 엄격하게 검수합니다.</div>
            <p className="mt-2 text-muted">출처 없는 엣지와 강한 인과 관계는 에이전트 자동 판단에 위험한 입력이 될 수 있으므로 우선 수정 대상으로 표시합니다.</p>
          </div>
          <div className="mt-4 space-y-3">
            {[
              ["01", "Parse", "nodes, edges, evidence 추출"],
              ["02", "Validate", "중복 노드와 누락 참조 확인"],
              ["03", "Review", "관계 강도와 편향 명명 탐지"],
              ["04", "Export", "Markdown 리포트와 repair checklist 생성"],
            ].map(([step, title, body]) => (
              <div key={step} className="flex gap-3 rounded-lg border border-white/[0.06] bg-black/20 p-3">
                <span className="text-accent">{step}</span>
                <div><div className="font-medium">{title}</div><div className="text-muted">{body}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
