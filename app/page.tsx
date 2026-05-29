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
            <Pill tone="accent">OpenCrab 팩 검수</Pill>
            <Pill>신뢰도 리포트</Pill>
            <Pill>AI 자동판단 안전성</Pill>
          </div>
          <h1 className="max-w-2xl font-semibold text-[#f7f8f8]">
            OpenCrab 팩을 신뢰하기 전에, 관계의 근거와 표현 강도를 먼저 검수하세요.
          </h1>
          <p className="mt-5 max-w-2xl text-muted">
            Megalopa는 진리 판정기가 아니라 사용 위험도 평가기입니다. JSON 팩에서 근거 없는 관계, 너무 단정적인 관계, 편향 표현, 약한 출처를 찾고 사람이 검토 가능한 Markdown 리포트를 생성합니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/docs/quick-start" className="rounded-md border border-[#80e0bb]/40 bg-[#80e0bb]/10 px-4 py-2 font-medium text-[#c7f4df]">처음 쓰는 법 보기</Link>
            <Link href="/upload" className="rounded-md border border-[#7170ff]/40 bg-[#5e6ad2] px-4 py-2 font-medium text-white">팩 분석 시작</Link>
            <Link href="/reports/sample" className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 font-medium text-[#f7f8f8]">샘플 리포트 보기</Link>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-subtle">분석 전</div>
              <div className="mt-2 font-medium text-[#fecaca]">anxiety causes barking</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-subtle">Megalopa 경고</div>
              <div className="mt-2 font-medium text-[#f8c46c]">너무 단정적인 관계</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-subtle">수정 후</div>
              <div className="mt-2 font-medium text-[#80e0bb]">anxiety can_contribute_to barking</div>
            </div>
          </div>
        </div>
        <div className="card panel-grid p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted">샘플 분석 미리보기</span>
            <ShieldIcon className="h-4 w-4 text-[#a6a5ff]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="신뢰도 점수" value="68" detail="탐색용" />
            <MetricCard label="사용 위험도" value="보통" detail="수동 검토 필요" />
            <MetricCard label="확인 필요" value="1" detail="관계 문제" />
            <MetricCard label="단정적 관계" value="1" detail="표현 완화 필요" />
          </div>
          <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
            <NodeIcon className="mb-3 h-5 w-5 text-[#80e0bb]" />
            <div className="font-medium">노드보다 관계를 더 엄격하게 검수합니다.</div>
            <p className="mt-2 text-muted">출처 없는 관계와 강한 인과 관계는 에이전트 자동 판단에 위험한 입력이 될 수 있으므로 우선 수정 대상으로 표시합니다.</p>
          </div>
          <div className="mt-4 space-y-3">
            {[
              ["01", "읽기", "노드, 관계, 근거 추출"],
              ["02", "검사", "중복 노드와 누락 참조 확인"],
              ["03", "검토", "관계 강도와 편향 표현 탐지"],
              ["04", "내보내기", "Markdown 리포트와 수정 체크리스트 생성"],
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
