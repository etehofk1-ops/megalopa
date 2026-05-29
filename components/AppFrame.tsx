import Link from "next/link";
import { CrabMark } from "./icons";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell min-h-screen pb-12">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#08090a]/80 backdrop-blur-xl">
        <div className="shell flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[#a6a5ff]">
              <CrabMark className="h-4 w-4" />
            </span>
            <span>Megalopa</span>
          </Link>
          <nav className="hidden items-center gap-5 text-muted md:flex">
            <Link href="/docs/quick-start">가이드</Link>
            <Link href="/upload">분석하기</Link>
            <Link href="/dashboard">요약</Link>
            <Link href="/reports/sample">리포트</Link>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
