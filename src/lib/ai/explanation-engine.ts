import type { AnalysisReport } from "@/lib/types";
import { AnthropicProvider } from "./anthropic-provider";
import { DeterministicProvider } from "./deterministic-provider";
import { OpenAiProvider } from "./openai-provider";
import type { AiProvider } from "./provider";

function getProvider(): AiProvider {
  if (process.env.ENABLE_AI_EXPLANATIONS !== "true") return new DeterministicProvider();
  if (process.env.AI_PROVIDER === "openai") return new OpenAiProvider();
  if (process.env.AI_PROVIDER === "anthropic") return new AnthropicProvider();
  return new DeterministicProvider();
}

export async function applyExplanation(report: AnalysisReport): Promise<AnalysisReport> {
  const provider = getProvider();
  try {
    const explanation = await provider.explain(report);
    return {
      ...report,
      aiProvider: explanation.provider,
      diagnosis: {
        ...report.diagnosis,
        userExplanation: explanation.userExplanation,
        developerExplanation: explanation.developerExplanation,
        confidenceReasons: [...report.diagnosis.confidenceReasons, `Explanation provider: ${explanation.provider}. ${explanation.limitations}`]
      }
    };
  } catch (error) {
    return {
      ...report,
      aiProvider: "deterministic",
      diagnosis: {
        ...report.diagnosis,
        confidenceReasons: [...report.diagnosis.confidenceReasons, `AI explanation unavailable: ${error instanceof Error ? error.message : "unknown error"}. Deterministic explanation retained.`]
      }
    };
  }
}
