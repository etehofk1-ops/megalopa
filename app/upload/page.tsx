"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { Button, Pill } from "@/components/ui";
import { AnalyzeResult } from "@/lib/types";
import { saveReport } from "@/lib/reportStorage";

const samplePath = "examples/sample_pack.json";
type InputMode = "sample" | "paste" | "file";

export default function UploadPage() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("대기 중");
  const [mode, setMode] = useState<InputMode>("sample");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function rememberResult(result: AnalyzeResult) {
    return saveReport(result);
  }

  async function loadSampleText() {
    setError("");
    setStatus("샘플 불러오는 중");
    const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sample: true }) });
    if (!res.ok) {
      setStatus("샘플 로드 실패");
      setError("샘플 분석 API를 불러오지 못했습니다. 잠시 후 다시 시도하세요.");
      return;
    }
    const result = await res.json();
    const reportId = rememberResult(result);
    setStatus("샘플 분석 준비 완료");
    router.push(`/reports/${reportId}`);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setFileName(file.name);
    if (file.size > 1024 * 1024) {
      setError("현재 버전은 1MB 이하의 JSON 파일만 받습니다.");
      return;
    }
    if (!file.name.match(/\.json$/i)) {
      setError("현재 버전은 JSON 파일만 분석합니다. YAML은 다음 단계에서 추가할 예정입니다.");
      return;
    }
    const content = await file.text();
    setText(content);
    setMode("file");
    setStatus(`${file.name} 로드 완료`);
  }

  async function analyzePack() {
    setError("");
    setStatus("분석 중");
    const body = mode === "sample" && !text.trim() ? { sample: true } : { content: text };
    if (mode !== "sample" && !text.trim()) {
      setStatus("대기 중");
      setError("JSON 내용을 붙여넣거나 파일을 선택한 뒤 분석을 시작하세요.");
      return;
    }
    const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("분석 실패");
      setError(payload.error ? `분석 실패: ${payload.error}` : "분석 API가 실패했습니다.");
      return;
    }
    const reportId = rememberResult(payload);
    setStatus("분석 완료");
    router.push(`/reports/${reportId}`);
  }

  const modes: Array<[InputMode, string, string]> = [
    ["sample", "샘플 팩", `${samplePath}로 바로 분석`],
    ["paste", "JSON 붙여넣기", "OpenCrab 팩 JSON 붙여넣기"],
    ["file", "파일 업로드", "내 컴퓨터의 JSON 파일 읽기"],
  ];

  return (
    <AppFrame>
      <section className="shell py-10">
        <div className="mb-6">
          <div className="text-subtle">분석하기</div>
          <h1 className="mt-2 font-semibold">OpenCrab 팩을 넣고 신뢰도 리포트를 생성하세요</h1>
          <p className="mt-2 max-w-2xl text-muted">파일은 영구 저장하지 않고 현재 요청에서만 분석합니다. 처음이라면 가이드에서 결과를 읽는 순서를 먼저 확인할 수 있습니다.</p>
          <Link href="/docs/quick-start" className="mt-3 inline-flex rounded-md border border-[#80e0bb]/30 bg-[#80e0bb]/10 px-3 py-2 font-medium text-[#c7f4df]">5분 시작 가이드</Link>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          {modes.map(([key, title, desc]) => (
            <button
              key={key}
              className={`rounded-xl border p-4 text-left transition ${mode === key ? "border-[#7170ff]/50 bg-[#7170ff]/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"}`}
              onClick={() => setMode(key)}
              type="button"
            >
              <div className="font-medium">{title}</div>
              <div className="mt-1 text-muted">{desc}</div>
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium">팩 입력</div>
                <div className="text-muted">JSON을 붙여넣거나 파일을 불러오면 그대로 분석 API에 전달합니다.</div>
              </div>
              <div className="flex gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-medium text-[#f7f8f8] transition hover:bg-white/[0.07]">
                  파일 선택
                  <input className="hidden" type="file" accept=".json,application/json" onChange={handleFile} />
                </label>
                <Button onClick={loadSampleText}>샘플 바로 분석</Button>
              </div>
            </div>
            <textarea
              className="min-h-[420px] w-full rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-[#d0d6e0] outline-none focus:border-[#7170ff]/60"
              placeholder={`예시:\n{\n  "id": "dog_ontology_pack",\n  "title": "Dog Behavior Ontology QA Sample",\n  "nodes": [],\n  "edges": [],\n  "evidence": []\n}`}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setMode("paste");
              }}
            />
            {fileName ? <div className="mt-2 text-muted">불러온 파일: {fileName}</div> : null}
            {error ? <div className="mt-3 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5 p-3 text-[#fecaca]">{error}</div> : null}
          </div>

          <aside className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">분석 설정</div>
              <Pill tone="accent">현재 버전</Pill>
            </div>
            <div className="mt-4 space-y-3 text-muted">
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>저장 방식</span><span>현재 탭에 임시 저장</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>분석 방식</span><span>규칙 기반 분석</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>LLM 분석</span><span>꺼짐</span></div>
              <div className="flex justify-between"><span>상태</span><span>{status}</span></div>
            </div>
            <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-muted">
              분석 결과로 신뢰도 점수, 사용 위험도, 확인 필요한 관계, 단정적인 관계, 편향 표현, Markdown 리포트를 보여줍니다.
            </div>
            <div className="mt-3 rounded-lg border border-[#80e0bb]/20 bg-[#80e0bb]/5 p-3 text-muted">
              어떤 JSON을 넣어야 할지 모르겠다면 <Link href="/docs/basic-terms" className="text-[#80e0bb]">기본 용어</Link>와 <Link href="/docs/how-it-works" className="text-[#80e0bb]">작동 방식</Link>을 먼저 보세요.
            </div>
            <Button className="mt-6 w-full border-[#7170ff]/40 bg-[#5e6ad2]" onClick={analyzePack} disabled={status === "분석 중"}>분석 시작</Button>
          </aside>
        </div>
      </section>
    </AppFrame>
  );
}
