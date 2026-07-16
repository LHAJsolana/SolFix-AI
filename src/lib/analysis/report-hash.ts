import { createHash } from "crypto";
import type { AnalysisReport } from "../types";

export function canonicalReportPayload(report: AnalysisReport) {
  return {
    reportId: report.id,
    signature: report.transaction.signature,
    network: report.transaction.network,
    diagnosisCategory: report.diagnosis.category,
    failingProgramId: report.diagnosis.failingInstruction.programId ?? null,
    failingInstructionIndex: report.diagnosis.failingInstruction.instructionIndex ?? null,
    confidence: report.diagnosis.confidence,
    verificationStatus: report.diagnosis.verificationStatus,
    createdAt: report.createdAt,
    reportVersion: report.reportVersion
  };
}

export function hashReport(report: AnalysisReport) {
  const canonical = JSON.stringify(canonicalReportPayload(report));
  return createHash("sha256").update(canonical).digest("hex");
}

export function memoPayload(report: AnalysisReport) {
  const hash = hashReport(report);
  const shortSignature = report.transaction.signature.slice(0, 12);
  const ts = Math.floor(new Date(report.createdAt).getTime() / 1000);
  return `SOLFIX|v1|report:${report.id}|source:${shortSignature}|hash:${hash}|ts:${ts}`;
}
