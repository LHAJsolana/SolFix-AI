import type { ParsedInstruction, ParsedTransactionWithMeta, PartiallyDecodedInstruction } from "@solana/web3.js";
import type { Network, NormalizedInstruction, NormalizedTransaction } from "../types";
import { getProgramName } from "./program-registry";

function getProgramId(instruction: ParsedInstruction | PartiallyDecodedInstruction) {
  if ("programId" in instruction && instruction.programId) return instruction.programId.toBase58();
  return "programId" in instruction ? String(instruction.programId) : "unknown";
}

function getAccounts(instruction: ParsedInstruction | PartiallyDecodedInstruction) {
  if ("accounts" in instruction && Array.isArray(instruction.accounts)) {
    return instruction.accounts.map((account) => account.toString());
  }
  return [];
}

function getType(instruction: ParsedInstruction | PartiallyDecodedInstruction) {
  if ("parsed" in instruction && typeof instruction.parsed === "object" && instruction.parsed && "type" in instruction.parsed) {
    return String(instruction.parsed.type);
  }
  return "raw";
}

export function normalizeTransaction(
  signature: string,
  network: Network,
  tx: ParsedTransactionWithMeta | null
): NormalizedTransaction {
  if (!tx) {
    return {
      signature,
      network,
      status: "not_found",
      signers: [],
      instructions: [],
      logs: [],
      balanceChanges: [],
      tokenBalanceChanges: []
    };
  }

  const message = tx.transaction.message;
  const accountKeys = message.accountKeys.map((key) => ({
    pubkey: key.pubkey.toBase58(),
    signer: key.signer
  }));
  const innerByParent = new Map<number, Array<ParsedInstruction | PartiallyDecodedInstruction>>();
  tx.meta?.innerInstructions?.forEach((inner) => innerByParent.set(inner.index, inner.instructions));
  const failingIndex = typeof tx.meta?.err === "object" && tx.meta.err && "InstructionError" in tx.meta.err
    ? Number((tx.meta.err.InstructionError as [number, unknown])[0])
    : undefined;

  const instructions: NormalizedInstruction[] = message.instructions.map((instruction, index) => {
    const programId = getProgramId(instruction);
    return {
      index,
      programId,
      programName: getProgramName(programId),
      type: getType(instruction),
      accounts: getAccounts(instruction),
      data: "data" in instruction ? instruction.data : undefined,
      status: failingIndex === index ? "failed" : failingIndex !== undefined && index > failingIndex ? "unknown" : "success",
      innerInstructions: (innerByParent.get(index) ?? []).map((innerInstruction, innerIndex) => {
        const innerProgramId = getProgramId(innerInstruction);
        return {
          index: innerIndex,
          parentIndex: index,
          programId: innerProgramId,
          programName: getProgramName(innerProgramId),
          type: getType(innerInstruction),
          accounts: getAccounts(innerInstruction),
          status: failingIndex === index ? "unknown" : "success"
        };
      })
    };
  });

  const preBalances = tx.meta?.preBalances ?? [];
  const postBalances = tx.meta?.postBalances ?? [];
  const balanceChanges = accountKeys.map((account, index) => ({
    account: account.pubkey,
    lamports: (postBalances[index] ?? 0) - (preBalances[index] ?? 0)
  }));

  const tokenBalanceChanges = (tx.meta?.postTokenBalances ?? []).map((balance) => ({
    account: String(balance.accountIndex),
    mint: balance.mint,
    owner: balance.owner,
    amount: balance.uiTokenAmount.amount
  }));

  return {
    signature,
    network,
    slot: tx.slot,
    blockTime: tx.blockTime,
    fee: tx.meta?.fee,
    feePayer: accountKeys[0]?.pubkey,
    signers: accountKeys.filter((account) => account.signer).map((account) => account.pubkey),
    status: tx.meta?.err ? "failed" : "success",
    error: tx.meta?.err ? JSON.stringify(tx.meta.err) : undefined,
    computeUnitsConsumed: tx.meta?.computeUnitsConsumed ?? undefined,
    confirmationStatus: "confirmed",
    version: tx.version ?? "legacy",
    recentBlockhash: message.recentBlockhash,
    instructions,
    logs: tx.meta?.logMessages ?? [],
    balanceChanges,
    tokenBalanceChanges,
    raw: tx
  };
}
