import type { AnalysisReport } from "@/lib/types";
import type { AiProvider, ExplanationResult } from "./provider";

export class DeterministicProvider implements AiProvider {
  async explain(report: AnalysisReport): Promise<ExplanationResult> {
    return {
      provider: "deterministic",
      userExplanation: report.diagnosis.userExplanation,
      developerExplanation: report.diagnosis.developerExplanation,
      limitations: "Generated deterministically from classifier output and report evidence."
    };
  }
}
