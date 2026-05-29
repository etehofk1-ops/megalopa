"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/ui";

const samplePath = "examples/sample_pack.json";

export default function UploadPage() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("대기 중");
  const router = useRouter();

  async function analyzeSample() {
    setStatus("분석 중");
    const body = text.trim() ? { content: text } : { sample: true };
    const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      setStatus("분석 실패");
      return;
    }
    const result = await res.json();
    sessionStorage.setItem("megalopa:lastReport", JSON.stringify(result));
    setStatus("분석 완료");
    router.push("/reports/sample");
  }

  return (
    <AppFrame>
      <section className="shell py-10">
        <div className="mb-6">
          <div className="text-subtle">Upload</div>
          <h1 className="mt-2 font-semibold">OpenCrab Pack 업로드 또는 JSON 붙여넣기</h1>
          <p className="mt-2 max-w-2xl text-muted">초기 MVP는 파일을 영구 저장하지 않고 API 요청 단위로 분석합니다. 빈 상태로 실행하면 {samplePath}를 분석합니다.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <textarea
            className="min-h-[420px] rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-[#d0d6e0] outline-none focus:border-[#7170ff]/60"
            placeholder="JSON pack을 붙여넣거나 비워둔 채 sample_pack.json을 분석하세요."
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <aside className="card p-4">
            <div className="font-medium">분석 설정</div>
            <div className="mt-4 space-y-3 text-muted">
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>Storage</span><span>temporary</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>Analyzer</span><span>python</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>LLM</span><span>disabled</span></div>
              <div className="flex justify-between"><span>Status</span><span>{status}</span></div>
            </div>
            <Button className="mt-6 w-full border-[#7170ff]/40 bg-[#5e6ad2]" onClick={analyzeSample}>분석 시작</Button>
          </aside>
        </div>
      </section>
    </AppFrame>
  );
}
