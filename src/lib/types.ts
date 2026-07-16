export type Network = "mainnet-beta" | "devnet";

export type VerificationStatus =
  | "simulation_verified"
  | "evidence_supported"
  | "probable_diagnosis"
  | "manual_review_required";

export type AnalysisMode = "user" | "developer";

export type EvidenceSource =
  | "rpc_error"
  | "log"
  | "instruction"
  | "inner_instruction"
  | "classifier"
  | "simulation";

export interface EvidenceItem {
  id: string;
  source: EvidenceSource;
  line?: number;
  instructionIndex?: number;
  innerInstructionIndex?: number;
  programId?: string;
  text: string;
  reason: string;
}

export interface NormalizedInstruction {
  index: number;
  programId: string;
  programName: string;
  type: string;
  accounts: string[];
  data?: string;
  innerInstructions: NormalizedInnerInstruction[];
  status: "success" | "failed" | "unknown";
}

export interface NormalizedInnerInstruction {
  index: number;
  parentIndex: number;
  programId: string;
  programName: string;
  type: string;
  accounts: string[];
  status: "success" | "failed" | "unknown";
}

export interface NormalizedTransaction {
  signature: string;
  network: Network;
  slot?: number;
  blockTime?: number | null;
  fee?: number;
  feePayer?: string;
  signers: string[];
  status: "failed" | "success" | "not_found" | "pending" | "partial";
  error?: string;
  computeUnitsConsumed?: number;
  confirmationStatus?: string;
  version?: string | number;
  recentBlockhash?: string;
  instructions: NormalizedInstruction[];
  logs: string[];
  balanceChanges: Array<{ account: string; lamports: number }>;
  tokenBalanceChanges: Array<{ account: string; mint: string; amount: string; owner?: string }>;
  raw?: unknown;
  retrievedAt?: string;
}

export interface FailingInstruction {
  instructionIndex?: number;
  innerInstructionIndex?: number;
  programId?: string;
  programName?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface Diagnosis {
  category: string;
  title: string;
  summary: string;
  userExplanation: string;
  developerExplanation: string;
  impact: string;
  failingInstruction: FailingInstruction;
  evidence: EvidenceItem[];
  confidence: number;
  confidenceReasons: string[];
  verificationStatus: VerificationStatus;
}

export interface RepairRecommendation {
  immediate: string;
  codeLevel: string;
  prevention: string[];
  limitations: string;
  codeExample: {
    language: "typescript" | "rust" | "anchor";
    title: string;
    code: string;
  };
}

export interface AnalysisReport {
  id: string;
  slug: string;
  reportVersion: "1";
  analysisVersion: string;
  parserVersion: string;
  classifierVersion: string;
  isDemo: boolean;
  rpcRetrievedAt?: string;
  aiProvider?: string;
  createdAt: string;
  visibility: "public" | "unlisted" | "private";
  transaction: NormalizedTransaction;
  diagnosis: Diagnosis;
  repair: RepairRecommendation;
  timeline: Array<{ label: string; status: "complete" | "warning" | "error"; detail: string }>;
  mode: AnalysisMode;
  attestation?: {
    reportHash: string;
    memoPayload: string;
    signature?: string;
    explorerUrl?: string;
  };
}

export interface DemoScenario {
  id: string;
  title: string;
  userExplanation: string;
  developerExplanation: string;
  transaction: NormalizedTransaction;
  expectedCategory: string;
  expectedConfidence: number;
  verificationStatus: VerificationStatus;
  repair: RepairRecommendation;
}
