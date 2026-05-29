import { ReactNode } from "react";
import { clsx } from "clsx";

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md border px-3 py-2 font-medium transition",
        "border-white/10 bg-white/[0.04] text-[#f7f8f8] hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "warn" | "ok" }) {
  const tones = {
    neutral: "border-white/10 text-[#d0d6e0]",
    accent: "border-[#7170ff]/40 text-[#a6a5ff]",
    warn: "border-[#f59e0b]/40 text-[#f8c46c]",
    ok: "border-[#10b981]/40 text-[#80e0bb]",
  };
  return <span className={clsx("rounded-full border px-2 py-1 font-medium", tones[tone])}>{children}</span>;
}

export function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="card p-4">
      <div className="text-subtle">{label}</div>
      <div className="mt-3 font-semibold text-[#f7f8f8]">{value}</div>
      <div className="mt-1 text-muted">{detail}</div>
    </div>
  );
}
