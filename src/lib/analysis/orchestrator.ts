import { demoScenarios, getDemoScenario } from "@/data/demo-scenarios";
import { classify } from "@/lib/classifiers";
import { toDiagnosis } from "@/lib/classifiers/types";
import { saveReport } from "@/lib/database/report-store";
import { fetchNormalizedTransaction } from "@/lib/solana/transaction-fetcher";
import { validateSignature } from "@/lib/validation";
import { applyExplanation } from "@/lib/ai/explanation-engine";
import type { AnalysisMode, AnalysisReport, Network, NormalizedTransaction } from "../types";
import { calculateConfidence } from "./confidence-engine";
import { isolateFailure } from "./failure-isolator";
import { memoPayload } from "./report-hash";
import { buildRepair } from "./repair-engine";

const ANALYSIS_VERSION = "2026-07-16";
const PARSER_VERSION = "rpc-normalizer-v1";
const CLASSIFIER_VERSION = "deterministic-classifiers-v1";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function analyzeTransaction(input: {
  signature?: string;
  network: Network;
  demoScenario?: string;
  mode?: AnalysisMode;
}): Promise<AnalysisReport> {
  let transaction: NormalizedTransaction;
  const isDemo = Boolean(input.demoScenario);
  if (input.demoScenario) {
    const scenario = getDemoScenario(input.demoScenario);
    if (!scenario) throw new Error("Unknown demo scenario.");
    transaction = scenario.transaction;
  } else {
    if (!input.signature) throw new Error("Transaction signature is required.");
    const parsed = validateSignature(input.signature);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid signature.");
    transaction = await fetchNormalizedTransaction(parsed.data, input.network);
  }

  const isolated = isolateFailure(transaction);
  const match = classify(transaction, isolated.evidence, isolated.failingInstruction);
  const confidence = calculateConfidence(transaction, match);
  const diagnosis = toDiagnosis(match, confidence.confidence, confidence.reasons);
  const repair = buildRepair(diagnosis.category);
  const id = makeId(isDemo ? "demo" : "analysis");
  const slug = `${slugify(diagnosis.category)}-${id.slice(-6)}`;
  const createdAt = new Date().toISOString();
  const timeline: AnalysisReport["timeline"] = [
    { label: "Validating signature", status: "complete", detail: isDemo ? "Demo signature bypassed and clearly labeled." : "Base58 signature validation completed." },
    { label: "Connecting to RPC", status: "complete", detail: isDemo ? "Deterministic demo data loaded." : `Fetched from ${input.network} RPC.` },
    { label: "Parsing instructions", status: "complete", detail: `${transaction.instructions.length} top-level instruction(s) normalized.` },
    { label: "Inspecting logs", status: "complete", detail: `${transaction.logs.length} log line(s) inspected.` },
    { label: "Isolating failure", status: diagnosis.failingInstruction.instructionIndex === undefined ? "warning" : "complete", detail: diagnosis.failingInstruction.instructionIndex === undefined ? "No precise instruction index found." : `Instruction ${diagnosis.failingInstruction.instructionIndex} identified.` },
    { label: "Classifying error", status: diagnosis.category === "unknown_error" ? "warning" : "complete", detail: diagnosis.title },
    { label: "Building recommendation", status: "complete", detail: repair.immediate },
    { label: "Verification", status: diagnosis.verificationStatus === "manual_review_required" ? "warning" : "complete", detail: diagnosis.verificationStatus.replace(/_/g, " ") },
    { label: "Saving report", status: "complete", detail: isDemo ? "Demo report saved with demo namespace." : "Analysis snapshot persisted for this report URL." }
  ];

  let report: AnalysisReport = {
    id,
    slug,
    reportVersion: "1",
    analysisVersion: ANALYSIS_VERSION,
    parserVersion: PARSER_VERSION,
    classifierVersion: CLASSIFIER_VERSION,
    isDemo,
    rpcRetrievedAt: transaction.retrievedAt,
    aiProvider: "deterministic",
    createdAt,
    visibility: "public",
    transaction,
    diagnosis,
    repair,
    timeline,
    mode: input.mode ?? "user"
  };
  report.attestation = {
    reportHash: "",
    memoPayload: ""
  };
  report.attestation.memoPayload = memoPayload(report);
  report.attestation.reportHash = report.attestation.memoPayload.split("hash:")[1]?.split("|")[0] ?? "";
  report = await applyExplanation(report);
  await saveReport(report);
  return report;
}

export function getDefaultDemoId() {
  return demoScenarios[0]?.id ?? "insufficient-sol";
}
