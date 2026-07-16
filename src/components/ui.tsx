import Link from "next/link";
import { Github } from "lucide-react";
import type { ReactNode } from "react";
import { RpcStatus } from "./rpc-status";

type StatusTone = "neutral" | "failed" | "verified" | "warning" | "info";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-ink text-zinc-100">
      <Header />
      {children}
    </main>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="SolFix home">
          <SolFixMark />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-zinc-100">SolFix</div>
            <div className="hidden text-[11px] text-zinc-500 sm:block">Transaction diagnostics</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] text-zinc-400 md:flex">
          <Link className="transition hover:text-zinc-100" href="/analyze">Inspect</Link>
          <Link className="transition hover:text-zinc-100" href="/simulate">Simulate</Link>
          <Link className="transition hover:text-zinc-100" href="/demo">Examples</Link>
          <Link className="transition hover:text-zinc-100" href="/how-it-works">Methodology</Link>
          <a className="flex items-center gap-1.5 transition hover:text-zinc-100" href={process.env.NEXT_PUBLIC_GITHUB_URL || "#"}>
            <Github size={14} />
            Docs
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <RpcStatus />
          <span className="hidden text-xs text-zinc-600 md:inline">Wallet optional</span>
        </div>
      </div>
    </header>
  );
}

export function SolFixMark() {
  return (
    <span className="relative grid h-8 w-8 place-items-center text-zinc-200">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path d="M5 10h7l3 3h5l2-3h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" />
        <path d="M5 22h7l3-3h5l2 3h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" opacity="0.72" />
        <path d="M15 13l5 6" stroke="#b25f68" strokeWidth="1.7" strokeLinecap="square" />
        <circle cx="20" cy="19" r="2.3" fill="#b25f68" />
      </svg>
    </span>
  );
}

export function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`bg-surface p-5 ${className}`}>{children}</section>;
}

export function SectionDivider({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-white/[0.07] ${className}`} />;
}

export function SystemLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 ${className}`}>{children}</p>;
}

export function DataValue({ children, mono = false, className = "" }: { children: ReactNode; mono?: boolean; className?: string }) {
  return <span className={`${mono ? "font-mono" : ""} text-zinc-100 ${className}`}>{children}</span>;
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: StatusTone }) {
  const tones: Record<StatusTone, string> = {
    neutral: "bg-white/[0.06] text-zinc-300",
    failed: "bg-red-500/12 text-red-300",
    verified: "bg-emerald-500/12 text-emerald-300",
    warning: "bg-amber-500/12 text-amber-300",
    info: "bg-sky-500/12 text-sky-300"
  };
  return <span className={`inline-flex items-center rounded-sm px-2 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function TransactionAddress({ value, className = "" }: { value: string; className?: string }) {
  return <span className={`break-all font-mono text-[13px] text-zinc-300 ${className}`}>{value}</span>;
}

export function EvidenceRow({ id, source, text, active = false }: { id: string; source: string; text: string; active?: boolean }) {
  return (
    <div className={`grid gap-2 py-3 sm:grid-cols-[92px_110px_1fr] ${active ? "bg-white/[0.035] px-3" : ""}`}>
      <DataValue mono className="text-[12px] text-zinc-400">{id}</DataValue>
      <span className="text-[12px] text-zinc-500">{source}</span>
      <span className="font-mono text-[12px] leading-5 text-zinc-300">{text}</span>
    </div>
  );
}

export function LogLine({ line, children, highlight = false }: { line: number; children: ReactNode; highlight?: boolean }) {
  return (
    <div className={`grid grid-cols-[42px_1fr] gap-3 py-1.5 font-mono text-[12px] leading-5 ${highlight ? "bg-amber-500/[0.06]" : ""}`}>
      <span className="select-none text-right text-zinc-600">{line}</span>
      <span className={highlight ? "text-amber-200" : "text-zinc-400"}>{children}</span>
    </div>
  );
}

export function InstructionRow({ index, program, status }: { index: number | string; program: string; status: "success" | "failed" | "unknown" }) {
  return (
    <div className="grid grid-cols-[56px_1fr_auto] items-center gap-3 py-3">
      <DataValue mono className="text-sm text-zinc-400">#{index}</DataValue>
      <span className="truncate text-sm text-zinc-200">{program}</span>
      <StatusPill tone={status === "failed" ? "failed" : status === "success" ? "verified" : "neutral"}>{status}</StatusPill>
    </div>
  );
}

export function TechnicalTable({ rows }: { rows: Array<{ label: string; value: ReactNode; mono?: boolean }> }) {
  return (
    <dl className="divide-y divide-white/[0.06]">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[120px_1fr] gap-4 py-3">
          <dt className="text-xs text-zinc-500">{row.label}</dt>
          <dd className={`${row.mono ? "font-mono text-[12px]" : "text-sm"} min-w-0 break-words text-zinc-200`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PrimaryAction({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-sm bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function TextAction({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`text-sm text-zinc-400 transition hover:text-zinc-100 disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return <Link href={href} className={`text-sm text-zinc-400 transition hover:text-zinc-100 ${className}`}>{children}</Link>;
}
