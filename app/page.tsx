import Link from "next/link";
import { AppFrame } from "@/components/AppFrame";
import { NodeIcon, ShieldIcon } from "@/components/icons";
import { Pill } from "@/components/ui";

export default function HomePage() {
  return (
    <AppFrame>
      <section className="shell grid gap-8 py-12 lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-center">
          <div className="mb-5 flex flex-wrap gap-2">
            <Pill tone="accent">OpenCrab Pack Audit</Pill>
            <Pill>Reliability Report</Pill>
            <Pill>Agent Safety</Pill>
          </div>
          <h1 className="max-w-2xl font-semibold text-[#f7f8f8]">
            Megalopa는 OpenCrab 팩을 신뢰하기 전에 근거, 관계, 출처, 편향, 추론 안전성을 검수하는 온톨로지 QA 레이어입니다.
          </h1>
          <p className="mt-5 max-w-2xl text-muted">
            진리 판정기가 아니라 사용 위험도 평가기입니다. 업로드된 JSON/YAML 팩에서 unsupported edge, strong relation, bias naming, provenance gap을 찾고 Markdown 리포트를 생성합니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/upload" className="rounded-md border border-[#7170ff]/40 bg-[#5e6ad2] px-4 py-2 font-medium text-white">Sample pack 분석</Link>
            <Link href="/reports/sample" className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 font-medium text-[#f7f8f8]">리포트 보기</Link>
          </div>
        </div>
        <div className="card panel-grid p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted">Audit flow</span>
            <ShieldIcon className="h-4 w-4 text-[#a6a5ff]" />
          </div>
          {[
            ["01", "Parse Pack", "nodes, edges, evidence 추출"],
            ["02", "Validate Schema", "중복 노드와 누락 참조 확인"],
            ["03", "Check Relations", "강한 관계와 unsupported edge 탐지"],
            ["04", "Score Reliability", "점수, 등급, 위험도 산출"],
          ].map(([step, title, body]) => (
            <div key={step} className="mb-3 flex gap-3 rounded-lg border border-white/[0.06] bg-black/20 p-3">
              <span className="text-accent">{step}</span>
              <div>
                <div className="font-medium">{title}</div>
                <div className="text-muted">{body}</div>
              </div>
            </div>
          ))}
          <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
            <NodeIcon className="mb-3 h-5 w-5 text-[#80e0bb]" />
            <div className="font-medium">노드보다 엣지를 더 엄격하게 검수합니다.</div>
            <p className="mt-2 text-muted">강한 인과 관계는 근거가 충분하지 않으면 에이전트 자동 판단에 위험한 입력이 될 수 있습니다.</p>
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
