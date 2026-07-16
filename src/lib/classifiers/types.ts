import type { Diagnosis, EvidenceItem, FailingInstruction, NormalizedTransaction, VerificationStatus } from "../types";

export interface ClassifierMatch {
  category: string;
  title: string;
  userExplanation: string;
  developerExplanation: string;
  impact: string;
  confidenceBase: number;
  verificationStatus: VerificationStatus;
  evidence: EvidenceItem[];
  failingInstruction: FailingInstruction;
}

export interface Classifier {
  id: string;
  label: string;
  match(tx: NormalizedTransaction, baseEvidence: EvidenceItem[], failingInstruction: FailingInstruction): ClassifierMatch | null;
}

export function toDiagnosis(match: ClassifierMatch, confidence: number, confidenceReasons: string[]): Diagnosis {
  return {
    category: match.category,
    title: match.title,
    summary: match.userExplanation,
    userExplanation: match.userExplanation,
    developerExplanation: match.developerExplanation,
    impact: match.impact,
    failingInstruction: match.failingInstruction,
    evidence: match.evidence,
    confidence,
    confidenceReasons,
    verificationStatus: match.verificationStatus
  };
}
