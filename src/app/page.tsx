import Link from "next/link";
import { AnalyzeForm } from "./analyze/analyze-form";
import {
  DataValue,
  SectionDivider,
  Shell,
  StatusPill,
  Surface,
  SystemLabel,
  TechnicalTable,
  TextLink
} from "@/components/ui";

const errorGroups = [
  { group: "Transaction lifecycle", items: ["Blockhash expired", "Transaction too large", "Signature verification failed"] },
  { group: "Accounts", items: ["Missing signer", "Invalid owner", "Account not initialized", "Account already exists"] },
  { group: "Tokens", items: ["Insufficient token balance", "Missing associated token account", "Insufficient SOL"] },
  { group: "Programs", items: ["Anchor constraint violation", "Custom program error", "Compute budget exceeded"] }
];

const exampleRows = [
  { title: "Compute budget exceeded", meta: "Instruction 5 · Jupiter Aggregator", href: "/demo/compute-budget" },
  { title: "Missing required signer", meta: "Instruction 2 · System Program", href: "/demo/missing-signer" },
  { title: "Anchor constraint violation", meta: "Instruction 4 · Unknown program", href: "/demo/anchor-constraint" }
];

export default function HomePage() {
  return (
    <Shell>
      <section className="mx-auto max-w-[1360px] px-4 pb-8 pt-9 sm:px-6 lg:pt-12">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <SystemLabel>SOLANA TRANSACTION DIAGNOSTICS</SystemLabel>
            <h1 className="mt-4 max-w-2xl text-[42px] font-semibold leading-[0.98] tracking-[-0.03em] text-zinc-100 sm:text-6xl">
              Find the instruction that broke.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
              Paste a transaction signature. SolFix isolates the failing instruction and shows the evidence behind the error.
            </p>
          </div>
          <div className="lg:pb-1">
            <AnalyzeForm compact />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <LiveWorkflowPanel />
      </section>

      <section className="mx-auto grid max-w-[1360px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[360px_1fr]">
        <div>
          <SystemLabel>Evidence gathering</SystemLabel>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100">Facts before explanation.</h2>
        </div>
        <div className="divide-y divide-white/[0.07]">
          {[
            ["01", "Evidence first", "Every conclusion links to an RPC error, instruction, program, log line, or simulation result."],
            ["02", "Two levels of detail", "Simple explanations for users. Raw evidence and code guidance for developers."],
            ["03", "Shareable investigations", "Create a stable debugging report for teammates or support without hiding the underlying data."]
          ].map(([number, title, text]) => (
            <div key={number} className="grid gap-4 py-5 sm:grid-cols-[72px_220px_1fr]">
              <DataValue mono className="text-sm text-zinc-500">{number}</DataValue>
              <h3 className="font-medium text-zinc-100">{title}</h3>
              <p className="text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1360px] gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_420px]">
        <div>
          <SystemLabel>Error category index</SystemLabel>
          <div className="mt-4 divide-y divide-white/[0.07] bg-surface px-5">
            {errorGroups.map((group) => (
              <div key={group.group} className="grid gap-3 py-4 sm:grid-cols-[190px_1fr]">
                <h3 className="text-sm font-medium text-zinc-200">{group.group}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="bg-white/[0.045] px-2.5 py-1 text-xs text-zinc-400">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SystemLabel>Example investigations</SystemLabel>
          <div className="mt-4 divide-y divide-white/[0.07] bg-surface px-5">
            {exampleRows.map((row) => (
              <Link key={row.title} href={row.href} className="grid grid-cols-[1fr_auto] gap-3 py-4 transition hover:bg-white/[0.025]">
                <span>
                  <span className="block text-sm font-medium text-zinc-100">{row.title}</span>
                  <span className="mt-1 block font-mono text-xs text-zinc-500">{row.meta}</span>
                </span>
                <StatusPill tone="info">Evidence available</StatusPill>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1360px] gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SystemLabel>Technical methodology</SystemLabel>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100">The output is a report, not a guess.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-400">
            SolFix normalizes Solana transaction metadata into a report with instruction indexes, program labels, evidence references, confidence reasons, and explicit verification status.
          </p>
        </div>
        <Surface>
          <TechnicalTable
            rows={[
              { label: "Source", value: "getParsedTransaction + transaction metadata" },
              { label: "Isolation", value: "InstructionError index, failed log line, inner instruction context" },
              { label: "Classifier", value: "Deterministic rules before explanatory text" },
              { label: "Report", value: "Canonical hash prepared for optional devnet Memo attestation" }
            ]}
          />
        </Surface>
      </section>

      <section className="mx-auto max-w-[1360px] px-4 pb-14 sm:px-6">
        <div className="grid gap-6 bg-surface p-5 lg:grid-cols-[360px_1fr] lg:items-center">
          <div>
            <SystemLabel>Inspect another transaction</SystemLabel>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Use mainnet-beta or devnet. Wallet connection is only needed for optional Memo attestation.</p>
          </div>
          <AnalyzeForm compact />
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-4 py-7 text-sm text-zinc-500 sm:px-6">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4">
          <span>SolFix · transaction diagnostics for Solana</span>
          <div className="flex gap-4">
            <TextLink href="/how-it-works">Methodology</TextLink>
            <TextLink href="/privacy">Privacy</TextLink>
            <TextLink href="/disclaimer">Disclaimer</TextLink>
          </div>
        </div>
      </footer>
    </Shell>
  );
}

function LiveWorkflowPanel() {
  return (
    <div className="grid gap-0 bg-surface lg:grid-cols-[300px_1fr]">
      <aside className="border-b border-white/[0.06] p-5 lg:border-b-0 lg:border-r">
        <SystemLabel>Live analysis path</SystemLabel>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Real requests are fetched from Solana RPC and saved as fixed report snapshots. Demo fixtures load only when explicitly selected.
        </p>
      </aside>
      <div className="grid gap-8 p-5 lg:grid-cols-[1fr_1fr]">
        <div>
          <SystemLabel>Stored for every real report</SystemLabel>
          <TechnicalTable
            rows={[
              { label: "RPC", value: "network, slot, block time, status" },
              { label: "Instructions", value: "top-level and inner instruction mapping" },
              { label: "Evidence", value: "RPC error objects, logs, program IDs" },
              { label: "Snapshot", value: "permanent report URL and JSON export" }
            ]}
          />
        </div>
        <div>
          <SystemLabel>Truthful output states</SystemLabel>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill tone="verified">successful transaction</StatusPill>
            <StatusPill tone="failed">on-chain failure</StatusPill>
            <StatusPill tone="warning">manual review required</StatusPill>
            <StatusPill tone="info">AI explanation optional</StatusPill>
          </div>
          <SectionDivider className="my-5" />
          <TextLink href="/simulate">Open serialized transaction simulator</TextLink>
        </div>
      </div>
    </div>
  );
}
