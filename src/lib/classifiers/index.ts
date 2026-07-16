import type { Classifier, ClassifierMatch } from "./types";
import type { EvidenceItem, FailingInstruction, NormalizedTransaction, VerificationStatus } from "../types";

function has(tx: NormalizedTransaction, pattern: RegExp) {
  return pattern.test([tx.error, ...tx.logs].filter(Boolean).join("\n"));
}

function makeClassifier(
  id: string,
  label: string,
  pattern: RegExp,
  category: string,
  title: string,
  userExplanation: string,
  developerExplanation: string,
  impact: string,
  verificationStatus: VerificationStatus = "evidence_supported",
  confidenceBase = 78
): Classifier {
  return {
    id,
    label,
    match(tx, baseEvidence, failingInstruction) {
      if (!has(tx, pattern)) return null;
      const classifierEvidence: EvidenceItem = {
        id: `classifier-${id}`,
        source: "classifier",
        instructionIndex: failingInstruction.instructionIndex,
        programId: failingInstruction.programId,
        text: `Matched deterministic rule: ${label}`,
        reason: "This rule matched the RPC error or program logs."
      };
      return {
        category,
        title,
        userExplanation,
        developerExplanation,
        impact,
        confidenceBase,
        verificationStatus,
        evidence: [...baseEvidence, classifierEvidence],
        failingInstruction
      };
    }
  };
}

export const classifiers: Classifier[] = [
  makeClassifier("insufficient-sol", "insufficient SOL balance", /insufficient.*(lamports|funds|sol)|Attempt to debit/i, "insufficient_sol", "Insufficient SOL balance", "The paying wallet did not have enough SOL to cover the transfer, rent, or transaction fee.", "RPC logs indicate a lamport debit or fee/rent requirement exceeded the available wallet balance.", "The transaction was rejected before the requested state change completed."),
  makeClassifier("insufficient-token-balance", "insufficient token funds", /insufficient.*token|custom program error: 0x1/i, "insufficient_token_funds", "Insufficient token funds", "The token account did not hold enough tokens for the requested operation.", "The SPL Token program commonly reports this when the source token account balance is lower than the transfer amount.", "No token movement should be assumed."),
  makeClassifier("missing-signer", "missing required signer", /missing required signature|signature verification failed|MissingRequiredSignature/i, "missing_required_signer", "Missing required signer", "A required wallet or authority did not sign the transaction.", "The message required a signer account that was absent from the signed transaction.", "The program could not authorize the requested account change."),
  makeClassifier("blockhash-expired", "blockhash expired", /blockhash not found|BlockhashNotFound|expired blockhash/i, "blockhash_expired", "Blockhash expired", "The transaction used a recent blockhash that was no longer valid.", "The validator could not find the blockhash in its recent blockhash queue.", "The transaction must be rebuilt with a fresh blockhash."),
  makeClassifier("compute-budget", "compute budget exceeded", /computational budget exceeded|exceeded maximum number of instructions|consumed .* of .* compute units/i, "compute_budget_exceeded", "Compute budget exceeded", "The transaction ran out of compute units before it completed.", "Logs show the runtime consumed the compute budget or hit the instruction limit.", "State changes from the failed transaction did not commit."),
  makeClassifier("ata-exists", "associated token account already exists", /already in use|already initialized|Associated token account.*exists/i, "associated_token_account_already_exists", "Associated token account already exists", "The transaction tried to create an associated token account that already exists.", "The Associated Token Program or System Program reports the destination account is already initialized.", "The create step should be skipped or replaced with an idempotent instruction."),
  makeClassifier("anchor-constraint", "Anchor constraint violation", /AnchorError|Constraint[A-Za-z]+|constraint was violated/i, "anchor_constraint_violation", "Anchor constraint violation", "An Anchor account constraint failed, so the program rejected the instruction.", "Anchor emitted a constraint error, which means an account did not satisfy the program's declared validation rules.", "The program did not execute past account validation."),
  makeClassifier("invalid-owner", "invalid account owner", /invalid account owner|IllegalOwner|owner does not match/i, "invalid_account_owner", "Invalid account owner", "One account is owned by a different program than the instruction expected.", "Program account validation expected a specific owner program and received another.", "The request needs the correct account address for this program."),
  makeClassifier("not-initialized", "account not initialized", /AccountNotInitialized|not initialized|uninitialized account/i, "account_not_initialized", "Account not initialized", "The transaction referenced an account that has not been initialized yet.", "The program expected initialized account data but received an empty or uninitialized account.", "Create or initialize the account before this instruction."),
  makeClassifier("invalid-account-data", "invalid account data", /invalid account data|InvalidAccountData|failed to deserialize/i, "invalid_account_data", "Invalid account data", "An account's stored data did not match what the program expected.", "The program could not deserialize or validate the account data layout.", "Use the correct account type or migrate/recreate the account."),
  makeClassifier("missing-ata", "missing associated token account", /could not find.*associated token|TokenAccountNotFound|associated token account does not exist/i, "missing_associated_token_account", "Missing associated token account", "The recipient or source associated token account does not exist.", "The token operation referenced an ATA that has not been created.", "Create the ATA first or use an idempotent create instruction."),
  makeClassifier("invalid-program-id", "invalid program id", /incorrect program id|InvalidProgramId|program id was not as expected/i, "invalid_program_id", "Invalid program ID", "The instruction targeted or referenced the wrong Solana program.", "The runtime or invoked program detected a program ID mismatch.", "Check cluster, program deployment address, and instruction builder configuration."),
  makeClassifier("transaction-too-large", "transaction too large", /transaction too large|packet too large|VersionedTransaction too large/i, "transaction_too_large", "Transaction too large", "The transaction exceeded Solana's size limits.", "The serialized message could not fit within the transaction packet limit.", "Split the operation or use address lookup tables."),
  makeClassifier("custom-program-error", "custom program error", /custom program error: (0x[0-9a-f]+|\d+)/i, "custom_program_error", "Custom program error", "A program returned a custom error code.", "The program emitted a custom error. Without an IDL or error map, SolFix can show the code but may not know the exact semantic meaning.", "Manual review may be needed unless the program error map is known.", "probable_diagnosis", 64),
  makeClassifier("slippage", "slippage exceeded", /slippage|price impact|other amount threshold|0x1771/i, "slippage_exceeded", "Slippage exceeded", "The swap output fell below the minimum amount the transaction allowed.", "Swap logs or error codes indicate the route violated the configured slippage threshold.", "Requote the swap and use a realistic slippage limit."),
  makeClassifier("rent-exempt", "rent exemption", /rent exempt|RentExempt|not rent exempt/i, "rent_exemption_failed", "Rent exemption failed", "An account creation step did not provide enough lamports for rent exemption.", "Solana account creation requires enough lamports to satisfy rent exemption for the account size.", "Increase the lamports allocated to account creation.")
];

export function classify(tx: NormalizedTransaction, baseEvidence: EvidenceItem[], failingInstruction: FailingInstruction): ClassifierMatch {
  if (tx.status === "success") {
    return {
      category: "successful_transaction",
      title: "Transaction succeeded",
      userExplanation: "This transaction completed successfully on-chain, so there is no failed instruction to repair.",
      developerExplanation: "RPC metadata contains no transaction error. Instruction and log inspection remain available for review.",
      impact: "No repair is required.",
      confidenceBase: 96,
      verificationStatus: "evidence_supported",
      evidence: baseEvidence,
      failingInstruction
    };
  }

  for (const classifier of classifiers) {
    const match = classifier.match(tx, baseEvidence, failingInstruction);
    if (match) return match;
  }
  return {
    category: "unknown_error",
    title: "Manual review required",
    userExplanation: "SolFix found a failure but could not map it to a known deterministic classifier.",
    developerExplanation: "Review the raw error object, logs, and program-specific error map or IDL.",
    impact: "The failed state transition did not commit.",
    confidenceBase: 42,
    verificationStatus: "manual_review_required",
    evidence: baseEvidence,
    failingInstruction
  };
}
