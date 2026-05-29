"use client";

import { ChangeEvent, useState } from "react";
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
      setError("현재 MVP는 1MB 이하의 JSON 파일만 받습니다.");
      return;
    }
    if (!file.name.match(/\.json$/i)) {
      setError("현재 MVP API는 JSON 파일만 파싱합니다. YAML은 다음 단계에서 추가할 예정입니다.");
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
    ["sample", "Sample Pack", `${samplePath}로 즉시 분석`],
    ["paste", "Paste JSON", "OpenCrab Pack JSON 붙여넣기"],
    ["file", "Upload File", "로컬 JSON 파일 읽기"],
  ];

  return (
    <AppFrame>
      <section className="shell py-10">
        <div className="mb-6">
          <div className="text-subtle">Upload</div>
          <h1 className="mt-2 font-semibold">OpenCrab Pack을 넣고 신뢰도 리포트를 생성하세요</h1>
          <p className="mt-2 max-w-2xl text-muted">초기 MVP는 파일을 영구 저장하지 않고 요청 단위로 분석합니다. 결과는 현재 탭의 sessionStorage에만 임시 보관됩니다.</p>
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
                <div className="font-medium">Pack Input</div>
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
            {fileName ? <div className="mt-2 text-muted">Loaded file: {fileName}</div> : null}
            {error ? <div className="mt-3 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5 p-3 text-[#fecaca]">{error}</div> : null}
          </div>

          <aside className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">분석 설정</div>
              <Pill tone="accent">MVP 0.1</Pill>
            </div>
            <div className="mt-4 space-y-3 text-muted">
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>Storage</span><span>temporary session</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>Analyzer</span><span>TypeScript API</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>LLM</span><span>disabled</span></div>
              <div className="flex justify-between"><span>Status</span><span>{status}</span></div>
            </div>
            <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-muted">
              생성 결과: Reliability Score, Risk Level, Unsupported Edges, Strong Relation Warnings, Bias Naming Warnings, Markdown Report.
            </div>
            <Button className="mt-6 w-full border-[#7170ff]/40 bg-[#5e6ad2]" onClick={analyzePack} disabled={status === "분석 중"}>분석 시작</Button>
          </aside>
        </div>
      </section>
    </AppFrame>
  );
}
