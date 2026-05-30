import type { Metadata } from "next";
import ogImage from "./asset/megalopa-wordmark-dark_2.png";
import "./globals.css";

const description =
  "LocalCrab에서 만든 온톨로지 팩을 OpenCrab에 배포하기 전 검수하고 정제하는 사전 감사 단계.";

export const metadata: Metadata = {
  title: "Megalopa",
  description,
  metadataBase: new URL("https://megalopa.vercel.app"),
  openGraph: {
    title: "Megalopa",
    description,
    url: "/",
    siteName: "Megalopa",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: ogImage.src,
        width: ogImage.width,
        height: ogImage.height,
        alt: "Megalopa Ontology QA Layer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Megalopa",
    description,
    images: [ogImage.src],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
