import { DataValue, SectionDivider, Shell, Surface, SystemLabel, TechnicalTable } from "@/components/ui";

export const metadata = { title: "How It Works - SolFix" };

export default function HowItWorksPage() {
  const steps = ["RPC retrieval", "Transaction parsing", "Log normalization", "Failure isolation", "Deterministic classification", "AI explanation layer", "Confidence scoring", "Report hashing", "Memo attestation"];
  return (
    <Shell>
      <div className="mx-auto max-w-[980px] px-4 py-10 sm:px-6">
        <SystemLabel>Methodology</SystemLabel>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Evidence is gathered before language is generated.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">SolFix follows one central principle: RPC facts -&gt; deterministic rules -&gt; optional explanatory text.</p>
        <Surface className="mt-7">
          <div className="divide-y divide-white/[0.06]">
            {steps.map((step, index) => (
              <div key={step} className="grid grid-cols-[56px_1fr] py-4">
                <DataValue mono className="text-zinc-600">{String(index + 1).padStart(2, "0")}</DataValue>
                <span className="text-sm text-zinc-200">{step}</span>
              </div>
            ))}
          </div>
          <SectionDivider className="my-5" />
          <TechnicalTable
            rows={[
              { label: "Input", value: "Public transaction signature" },
              { label: "Primary source", value: "Solana RPC transaction metadata" },
              { label: "Output", value: "Diagnosis, evidence, confidence, repair recommendation" }
            ]}
          />
        </Surface>
      </div>
    </Shell>
  );
}
