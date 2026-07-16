import type { EvidenceItem, FailingInstruction, NormalizedTransaction } from "../types";

export function isolateFailure(tx: NormalizedTransaction): { failingInstruction: FailingInstruction; evidence: EvidenceItem[] } {
  const evidence: EvidenceItem[] = [];
  const failedInstruction = tx.instructions.find((instruction) => instruction.status === "failed");
  if (tx.error) {
    evidence.push({
      id: "rpc-error",
      source: "rpc_error",
      instructionIndex: failedInstruction?.index,
      programId: failedInstruction?.programId,
      text: tx.error,
      reason: "The RPC metadata reports this transaction error."
    });
  }

  const errorLogIndex = tx.logs.findIndex((line) => /failed|error|consumed|insufficient|constraint|slippage/i.test(line));
  if (errorLogIndex >= 0) {
    evidence.push({
      id: "log-error",
      source: "log",
      line: errorLogIndex + 1,
      instructionIndex: failedInstruction?.index,
      programId: failedInstruction?.programId,
      text: tx.logs[errorLogIndex],
      reason: "This log line contains the strongest failure signal."
    });
  }

  return {
    failingInstruction: {
      instructionIndex: failedInstruction?.index,
      programId: failedInstruction?.programId,
      programName: failedInstruction?.programName,
      errorMessage: tx.error
    },
    evidence
  };
}
