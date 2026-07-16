import { z } from "zod";

export const explanationSchema = z.object({
  userExplanation: z.string().trim().min(1).max(1600),
  developerExplanation: z.string().trim().min(1).max(2200),
  limitations: z.string().trim().min(1).max(1000).default("AI explanation must be reviewed against the evidence.")
});

export function parseExplanationJson(content: string | undefined, provider: "openai" | "anthropic") {
  if (!content) throw new Error(`${provider} returned an empty explanation.`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`${provider} returned invalid JSON.`);
  }
  const result = explanationSchema.safeParse(parsed);
  if (!result.success) throw new Error(`${provider} explanation did not match the required schema.`);
  return { provider, ...result.data };
}
