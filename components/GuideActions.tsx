"use client";

import { useState } from "react";
import Link from "next/link";

export function GuideActions({ markdown }: { markdown: string }) {
  const [copyLabel, setCopyLabel] = useState("Markdown 복사");

  async function copyMarkdown() {
    try {
      if (navigator.clipboard?.writeText) {
        await Promise.race([
          navigator.clipboard.writeText(markdown),
          new Promise((_, reject) => setTimeout(() => reject(new Error("clipboard timeout")), 700)),
        ]);
      } else {
        fallbackCopy(markdown);
      }
      setCopyLabel("복사 완료");
    } catch {
      try {
        fallbackCopy(markdown);
        setCopyLabel("복사 완료");
      } catch {
        setCopyLabel("복사 권한 필요");
      }
    } finally {
      setTimeout(() => setCopyLabel("Markdown 복사"), 1500);
    }
  }

  return (
    <div className="guide-actions">
      <button type="button" onClick={copyMarkdown}>
        {copyLabel}
      </button>
      <Link href="/upload">팩 분석 시작</Link>
      <Link href="/reports/sample">샘플 리포트</Link>
    </div>
  );
}

function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("copy failed");
}
