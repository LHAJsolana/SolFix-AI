import {
  DataValue,
  EvidenceRow,
  InstructionRow,
  LogLine,
  SectionDivider,
  Shell,
  StatusPill,
  Surface,
  SystemLabel,
  TechnicalTable,
  TransactionAddress
} from "@/components/ui";
import type { AnalysisReport } from "@/lib/types";
import { AttestationPanel } from "./attestation-panel";
import { DiagnosticModePanel } from "./diagnostic-mode-panel";

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function verificationTone(status: string) {
  if (status === "simulation_verified") return "verified";
  if (status === "manual_review_required") return "warning";
  return "info";
}

export function AnalysisView({ report }: { report: AnalysisReport }) {
  const failingInstruction = report.diagnosis.failingInstruction.instructionIndex ?? "Unknown";
  return (
    <div className="mx-auto grid max-w-[1360px] gap-0 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_330px]">
      <aside className="border-b border-white/[0.06] pb-4 lg:border-b-0 lg:border-r lg:pr-5">
        <SystemLabel>Investigation</SystemLabel>
        <nav className="mt-4 space-y-1 text-sm">
          {["Diagnosis", "Evidence", "Repair", "Instructions", "Raw logs", "Report"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="block py-2 text-zinc-500 transition hover:text-zinc-100">
              {item}
            </a>
          ))}
        </nav>
        <SectionDivider className="my-5" />
        <div className="space-y-3">
          {report.timeline.slice(0, 6).map((stage, index) => (
            <div key={stage.label} className="grid grid-cols-[32px_1fr] gap-2 text-sm">
              <DataValue mono className="text-zinc-600">{String(index + 1).padStart(2, "0")}</DataValue>
              <span className={stage.status === "warning" ? "text-amber-300" : "text-zinc-300"}>{stage.label}</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="space-y-6 py-5 lg:px-6 lg:py-0">
        <header className="bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <SystemLabel>Analysis report</SystemLabel>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">{report.diagnosis.title}</h1>
              <p className="mt-3">
                <TransactionAddress value={report.transaction.signature} />
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="info">{report.transaction.network}</StatusPill>
              {report.isDemo && <StatusPill tone="warning">demo fixture</StatusPill>}
              <StatusPill tone={report.transaction.status === "failed" ? "failed" : "verified"}>{report.transaction.status}</StatusPill>
              <StatusPill tone={verificationTone(report.diagnosis.verificationStatus)}>{statusLabel(report.diagnosis.verificationStatus)}</StatusPill>
            </div>
          </div>
        </header>

        <Surface>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr]">
            <div>
              <SystemLabel>Diagnosis</SystemLabel>
              <h2 id="diagnosis" className="mt-2 text-xl font-semibold text-zinc-100">What failed</h2>
              <div className="mt-3">
                <DiagnosticModePanel userExplanation={report.diagnosis.userExplanation} developerExplanation={report.diagnosis.developerExplanation} />
              </div>
            </div>
            <TechnicalTable
              rows={[
                { label: "Confidence", value: `${report.diagnosis.confidence}%`, mono: true },
                { label: "Instruction", value: failingInstruction, mono: true },
                { label: "Program", value: report.diagnosis.failingInstruction.programName ?? "Unknown" },
                { label: "Impact", value: report.diagnosis.impact }
              ]}
            />
          </div>
          <SectionDivider className="my-5" />
          <SystemLabel>Confidence reasons</SystemLabel>
          <ul className="mt-3 space-y-2">
            {report.diagnosis.confidenceReasons.map((reason) => (
              <li key={reason} className="text-xs leading-5 text-zinc-500">{reason}</li>
            ))}
          </ul>
        </Surface>

        <Surface>
          <SystemLabel>Recommended repair</SystemLabel>
          <h2 id="repair" className="mt-2 text-lg font-semibold text-zinc-100">{report.repair.immediate}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{report.repair.codeLevel}</p>
          <pre className="mt-5 overflow-x-auto bg-ink/70 p-4 font-mono text-[12px] leading-5 text-emerald-200"><code>{report.repair.codeExample.code}</code></pre>
        </Surface>

        <Surface>
          <SystemLabel>Instruction tree</SystemLabel>
          <div id="instructions" className="mt-3 divide-y divide-white/[0.06]">
            {report.transaction.instructions.map((instruction) => (
              <div key={instruction.index}>
                <InstructionRow index={instruction.index} program={instruction.programName} status={instruction.status} />
                <p className="pb-3 font-mono text-[12px] text-zinc-600">{instruction.programId}</p>
                {instruction.innerInstructions.map((inner) => (
                  <div key={`${instruction.index}-${inner.index}`} className="ml-10 grid grid-cols-[60px_1fr] pb-3 text-sm">
                    <DataValue mono className="text-zinc-600">inner {inner.index}</DataValue>
                    <span className="text-zinc-500">{inner.programName}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Surface>

        <Surface>
          <SystemLabel>Raw logs</SystemLabel>
          <div id="raw-logs" className="mt-3 overflow-x-auto bg-ink/70 py-3">
            {report.transaction.logs.map((line, index) => (
              <LogLine key={`${line}-${index}`} line={index + 1} highlight={report.diagnosis.evidence.some((item) => item.line === index + 1)}>
                {line}
              </LogLine>
            ))}
          </div>
        </Surface>
      </div>

      <aside className="space-y-6 border-t border-white/[0.06] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <Surface>
          <SystemLabel>Evidence</SystemLabel>
          <div id="evidence" className="mt-3 divide-y divide-white/[0.06]">
            {report.diagnosis.evidence.map((item, index) => (
              <EvidenceRow key={item.id} id={item.id} source={item.source} text={item.text} active={index === 0} />
            ))}
          </div>
        </Surface>

        <Surface>
          <SystemLabel>Transaction metadata</SystemLabel>
          <TechnicalTable
            rows={[
              { label: "Slot", value: report.transaction.slot ?? "Unknown", mono: true },
              { label: "Fee", value: report.transaction.fee ? `${report.transaction.fee / 1_000_000_000} SOL` : "Unknown", mono: true },
                { label: "Compute", value: report.transaction.computeUnitsConsumed ?? "Unknown", mono: true },
                { label: "Version", value: report.transaction.version ?? "legacy" },
                { label: "Analyzed", value: new Date(report.createdAt).toLocaleString() },
                { label: "Retrieved", value: report.rpcRetrievedAt ? new Date(report.rpcRetrievedAt).toLocaleString() : report.isDemo ? "demo fixture" : "not recorded" },
                { label: "AI", value: report.aiProvider === "deterministic" ? "deterministic explanation" : `AI-assisted explanation: ${report.aiProvider}` }
              ]}
            />
        </Surface>

        <Surface>
          <SystemLabel>Report</SystemLabel>
          <div id="report" className="mt-3 space-y-3">
            <div>
              <span className="block text-xs text-zinc-500">Slug</span>
              <DataValue mono className="text-[12px]">{report.slug}</DataValue>
            </div>
            <div>
              <span className="block text-xs text-zinc-500">Memo payload</span>
              <p className="mt-1 break-all font-mono text-[11px] leading-5 text-zinc-500">{report.attestation?.memoPayload}</p>
            </div>
            <a href={`/report/${report.slug}`} className="text-xs text-zinc-300 underline decoration-white/20 underline-offset-4">Open shareable report</a>
            <a href={`/api/reports/${report.slug}/export`} className="block text-xs text-zinc-300 underline decoration-white/20 underline-offset-4">Export JSON snapshot</a>
          </div>
          <SectionDivider className="my-5" />
          <SystemLabel>Devnet attestation</SystemLabel>
          <div className="mt-3">
            <AttestationPanel reportId={report.id} existingSignature={report.attestation?.signature} existingExplorerUrl={report.attestation?.explorerUrl} />
          </div>
        </Surface>
      </aside>
    </div>
  );
}

export function AnalysisShell({ report }: { report: AnalysisReport }) {
  return <Shell><AnalysisView report={report} /></Shell>;
}
