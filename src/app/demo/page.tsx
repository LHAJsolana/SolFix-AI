import { demoScenarios } from "@/data/demo-scenarios";
import { Shell, StatusPill, Surface, SystemLabel } from "@/components/ui";

export const metadata = { title: "Examples - SolFix" };

export default function DemoPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
        <SystemLabel>Examples</SystemLabel>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Deterministic investigations.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">These fixtures exercise the classifier pipeline without live RPC. Demo signatures are not blockchain transactions.</p>
        <Surface className="mt-7">
          <div className="divide-y divide-white/[0.06]">
          {demoScenarios.map((scenario) => (
            <a key={scenario.id} href={`/demo/${scenario.id}`} className="grid gap-3 py-4 transition hover:bg-white/[0.025] md:grid-cols-[260px_1fr_auto]">
              <h2 className="font-medium text-zinc-100">{scenario.title}</h2>
              <p className="text-sm text-zinc-500">{scenario.developerExplanation}</p>
              <StatusPill tone="info">Evidence available</StatusPill>
            </a>
          ))}
          </div>
        </Surface>
      </div>
    </Shell>
  );
}
