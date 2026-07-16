import type { ClassifierMatch } from "../classifiers/types";
import type { NormalizedTransaction } from "../types";

export function calculateConfidence(tx: NormalizedTransaction, match: ClassifierMatch) {
  const reasons: string[] = [`Base classifier confidence: ${match.confidenceBase}.`];
  let score = match.confidenceBase;
  if (tx.error) {
    score += 6;
    reasons.push("RPC error metadata is present.");
  }
  if (match.evidence.some((evidence) => evidence.source === "log")) {
    score += 6;
    reasons.push("A matching program log line supports the diagnosis.");
  }
  if (match.failingInstruction.instructionIndex !== undefined) {
    score += 5;
    reasons.push("The failing instruction index was isolated.");
  }
  if (match.verificationStatus === "manual_review_required") {
    score -= 10;
    reasons.push("Manual review is required because the evidence is incomplete or unmapped.");
  }
  return { confidence: Math.max(0, Math.min(99, score)), reasons };
}
