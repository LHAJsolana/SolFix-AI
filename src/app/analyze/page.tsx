import { AnalyzeForm } from "./analyze-form";
import { demoScenarios } from "@/data/demo-scenarios";
import { Shell, StatusPill, Surface, SystemLabel } from "@/components/ui";

export const metadata = {
  title: "Analyze - SolFix"
};

export default function AnalyzePage() {
  return (
    <Shell>
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        <Surface>
          <SystemLabel>Inspect transaction</SystemLabel>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Start with a signature.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">SolFix retrieves the transaction, maps instructions and logs, then returns a report with evidence references.</p>
          <div className="mt-6"><AnalyzeForm /></div>
        </Surface>
        <Surface>
          <SystemLabel>Examples</SystemLabel>
          <div className="mt-4 divide-y divide-white/[0.06]">
            {demoScenarios.slice(0, 6).map((scenario) => (
              <a key={scenario.id} href={`/demo/${scenario.id}`} className="grid grid-cols-[1fr_auto] gap-3 py-3">
                <span className="text-sm font-medium text-zinc-200">{scenario.title}</span>
                <StatusPill tone="info">demo</StatusPill>
              </a>
            ))}
          </div>
        </Surface>
      </div>
    </Shell>
  );
}
