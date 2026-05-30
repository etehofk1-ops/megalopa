"use client";

import { ChangeEvent, DragEvent, useState } from "react";
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

  async function readInputFile(file: File) {
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

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await readInputFile(file);
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await readInputFile(file);
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
  const flowSteps = [
    { title: "팩 준비", body: "LocalCrab에서 만든 JSON 팩이나 샘플 팩을 준비합니다." },
    { title: "Megalopa 검수", body: "근거, 관계 표현, 구조 오류, 출처 품질을 확인합니다." },
    { title: "수정 큐 확인", body: "무엇부터 고치면 되는지 리포트에서 바로 확인합니다." },
  ];
  const analysisSteps = ["팩 구조 읽기", "노드와 관계 확인", "근거 없는 관계 찾기", "수정 우선순위 정리"];
  const isAnalyzing = status === "분석 중";

  return (
    <AppFrame>
      <section className="shell py-10">
        <div className="feature-hero mb-5">
          <div>
            <div className="text-subtle">분석하기</div>
            <h1>OpenCrab에 올리기 전, 팩을 먼저 점검하세요.</h1>
            <p>Megalopa는 팩을 만드는 도구가 아니라, 이미 만들어진 후보 팩이 믿을 만한지 확인하는 검수 도우미입니다.</p>
          </div>
          <div className="feature-hero-panel">
            <span>처음이라면</span>
            <strong>샘플 팩으로 바로 리포트를 확인해보세요.</strong>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={loadSampleText}>샘플 바로 분석</Button>
              <Link href="/docs/quick-start" className="inline-flex items-center justify-center rounded-md border border-[#80e0bb]/30 bg-[#80e0bb]/10 px-3 py-2 font-medium text-[#c7f4df]">5분 시작 가이드</Link>
            </div>
          </div>
        </div>

        <div className="upload-journey mb-4">
          {flowSteps.map((step, index) => (
            <div key={step.title} className="upload-journey-step">
              <span>0{index + 1}</span>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </div>
          ))}
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
                <div className="text-muted">샘플을 쓰거나, JSON을 붙여넣거나, 파일을 끌어다 놓으세요.</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadSampleText}>샘플 바로 분석</Button>
              </div>
            </div>
            <label
              className="upload-dropzone mb-3"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input className="hidden" type="file" accept=".json,application/json" onChange={handleFile} />
              <span>{fileName ? "파일 준비 완료" : "JSON 파일 선택 또는 드롭"}</span>
              <strong>{fileName || "LocalCrab에서 만든 후보 팩을 여기에 올려주세요."}</strong>
              <em>현재 버전은 1MB 이하 JSON 파일을 분석합니다.</em>
            </label>
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
              <div className="font-medium">분석이 끝나면</div>
              <Pill tone="accent">현재 버전</Pill>
            </div>
            <div className="mt-4 grid gap-2">
              {analysisSteps.map((step, index) => (
                <div key={step} className={`analysis-step ${isAnalyzing || status === "분석 완료" ? "is-active" : ""}`}>
                  <span>0{index + 1}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-muted">
              결과 화면에서는 점수보다 먼저 “배포해도 되는지”, “무엇부터 고쳐야 하는지”, “왜 문제가 되는지”를 보여줍니다.
            </div>
            <div className="mt-3 space-y-2 text-muted">
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>저장 방식</span><span>현재 탭에 임시 저장</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2"><span>분석 방식</span><span>규칙 기반 분석</span></div>
              <div className="flex justify-between"><span>상태</span><span>{status}</span></div>
            </div>
            <div className="mt-3 rounded-lg border border-[#80e0bb]/20 bg-[#80e0bb]/5 p-3 text-muted">
              어떤 JSON을 넣어야 할지 모르겠다면 <Link href="/docs/basic-terms" className="text-[#80e0bb]">기본 용어</Link>와 <Link href="/docs/how-it-works" className="text-[#80e0bb]">작동 방식</Link>을 먼저 보세요.
            </div>
            <Button className="mt-6 w-full border-[#7170ff]/40 bg-[#5e6ad2]" onClick={analyzePack} disabled={isAnalyzing}>{isAnalyzing ? "분석 중입니다" : "팩 검수 시작"}</Button>
          </aside>
        </div>
      </section>
    </AppFrame>
  );
}
