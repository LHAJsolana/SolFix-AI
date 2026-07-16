import type { AnalysisReport } from "@/lib/types";
import type { AiProvider, ExplanationResult } from "./provider";
import { buildEvidencePrompt } from "./provider";
import { parseExplanationJson } from "./output-validator";

export class OpenAiProvider implements AiProvider {
  async explain(report: AnalysisReport): Promise<ExplanationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return JSON with userExplanation, developerExplanation, limitations. Use only supplied evidence." },
          { role: "user", content: buildEvidencePrompt(report) }
        ]
      })
    });
    if (!response.ok) throw new Error(`OpenAI explanation failed: ${response.status}`);
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return parseExplanationJson(json.choices?.[0]?.message?.content, "openai");
  }
}
