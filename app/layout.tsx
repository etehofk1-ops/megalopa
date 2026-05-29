import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Megalopa",
  description: "OpenCrab 팩 신뢰도 분석 도구",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
