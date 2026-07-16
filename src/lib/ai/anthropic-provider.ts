import type { AnalysisReport } from "@/lib/types";
import type { AiProvider, ExplanationResult } from "./provider";
import { buildEvidencePrompt } from "./provider";
import { parseExplanationJson } from "./output-validator";

export class AnthropicProvider implements AiProvider {
  async explain(report: AnalysisReport): Promise<ExplanationResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
        max_tokens: 700,
        temperature: 0.2,
        system: "Return strict JSON with userExplanation, developerExplanation, limitations. Use only supplied evidence.",
        messages: [{ role: "user", content: buildEvidencePrompt(report) }]
      })
    });
    if (!response.ok) throw new Error(`Anthropic explanation failed: ${response.status}`);
    const json = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = json.content?.find((item) => item.type === "text")?.text;
    return parseExplanationJson(text, "anthropic");
  }
}
