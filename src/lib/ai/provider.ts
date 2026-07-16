import type { AnalysisReport } from "@/lib/types";

export interface ExplanationResult {
  userExplanation: string;
  developerExplanation: string;
  limitations: string;
  provider: "deterministic" | "openai" | "anthropic";
}

export interface AiProvider {
  explain(report: AnalysisReport): Promise<ExplanationResult>;
}

export function buildEvidencePrompt(report: AnalysisReport) {
  return [
    "Explain this Solana transaction diagnosis using only the provided evidence.",
    "Do not invent program IDs, instruction indexes, logs, balances, simulation results, or verification status.",
    JSON.stringify({
      category: report.diagnosis.category,
      title: report.diagnosis.title,
      verificationStatus: report.diagnosis.verificationStatus,
      confidence: report.diagnosis.confidence,
      failingInstruction: report.diagnosis.failingInstruction,
      evidence: report.diagnosis.evidence.map((item) => ({ id: item.id, source: item.source, text: item.text })),
      repair: report.repair.immediate
    })
  ].join("\n\n");
}
