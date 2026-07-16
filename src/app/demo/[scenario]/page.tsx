import { notFound, redirect } from "next/navigation";
import { getDemoScenario } from "@/data/demo-scenarios";
import { analyzeTransaction } from "@/lib/analysis/orchestrator";

export default async function DemoScenarioPage({ params }: { params: Promise<{ scenario: string }> }) {
  const { scenario: scenarioId } = await params;
  const scenario = getDemoScenario(scenarioId);
  if (!scenario) notFound();
  const report = await analyzeTransaction({ network: "devnet", demoScenario: scenario.id });
  redirect(`/analysis/${report.id}`);
}
