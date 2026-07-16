import type { RepairRecommendation } from "../types";

const defaultCode = `import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export async function rebuildWithFreshState(connection: Connection, transaction: Transaction) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  // Re-fetch balances/accounts here before signing.
  return { transaction, lastValidBlockHeight };
}`;

export function buildRepair(category: string): RepairRecommendation {
  const repairs: Record<string, RepairRecommendation> = {
    successful_transaction: {
      immediate: "No repair is required for this transaction.",
      codeLevel: "Use the instruction list, logs, fee, balances, and account changes for inspection or reconciliation.",
      prevention: ["Store the signature and slot for audit trails.", "Inspect logs when debugging unexpected but successful behavior."],
      limitations: "A successful on-chain status does not prove the transaction achieved the user's intended business outcome.",
      codeExample: { language: "typescript", title: "Inspect confirmed transaction", code: `const transaction = await connection.getParsedTransaction(signature, {\n  commitment: "confirmed",\n  maxSupportedTransactionVersion: 0\n});` }
    },
    insufficient_sol: {
      immediate: "Fund the fee payer with enough SOL for fees, rent, and the requested transfer amount, then rebuild the transaction.",
      codeLevel: "Before signing, fetch the fee payer balance and compare it against the estimated fee plus any lamports required by account creation instructions.",
      prevention: ["Check balance before building the transaction.", "Show rent and fee requirements separately.", "Handle fee-payer and source-account balances independently."],
      limitations: "Exact rent requirements depend on account size and current cluster rent rules.",
      codeExample: { language: "typescript", title: "Check SOL balance before signing", code: `const balance = await connection.getBalance(feePayer, "confirmed");\nconst fee = 5000;\nif (balance < requiredLamports + fee) {\n  throw new Error("Not enough SOL for this transaction");\n}` }
    },
    missing_required_signer: {
      immediate: "Collect the missing authority signature and rebuild the transaction with all required signer accounts.",
      codeLevel: "Make sure every account marked as signer in the instruction metas is signed by the matching wallet or keypair.",
      prevention: ["Validate signer metas during instruction construction.", "Avoid marking PDA accounts as signers unless using invoke_signed on-chain.", "Display the required wallet authority before approval."],
      limitations: "SolFix cannot infer private signing authority from public chain data.",
      codeExample: { language: "typescript", title: "Verify signer metas", code: `for (const key of instruction.keys) {\n  if (key.isSigner && !availableSigners.has(key.pubkey.toBase58())) {\n    throw new Error(\`Missing signer: \${key.pubkey.toBase58()}\`);\n  }\n}` }
    },
    blockhash_expired: {
      immediate: "Request a fresh blockhash, rebuild the transaction, and have the user sign again.",
      codeLevel: "Avoid reusing signed transactions after the last valid block height has passed.",
      prevention: ["Fetch blockhash immediately before signing.", "Track lastValidBlockHeight.", "Retry by rebuilding, not by resending stale bytes."],
      limitations: "A fresh blockhash does not solve separate account or program errors.",
      codeExample: { language: "typescript", title: "Refresh blockhash", code: defaultCode }
    },
    compute_budget_exceeded: {
      immediate: "Reduce instruction complexity or add an appropriate compute budget instruction before the expensive instructions.",
      codeLevel: "Simulate the transaction, inspect consumed units, then set a measured compute-unit limit and priority fee.",
      prevention: ["Simulate before requesting signature.", "Avoid unnecessary CPI calls.", "Split large workflows into multiple transactions."],
      limitations: "Compute use can vary with account state and program version.",
      codeExample: { language: "typescript", title: "Add compute budget", code: `import { ComputeBudgetProgram } from "@solana/web3.js";\n\ntransaction.instructions.unshift(\n  ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),\n  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 5_000 })\n);` }
    },
    associated_token_account_already_exists: {
      immediate: "Use the idempotent associated token account creation instruction or skip creation when the ATA already exists.",
      codeLevel: "Check getAccountInfo for the ATA or use createAssociatedTokenAccountIdempotentInstruction.",
      prevention: ["Prefer idempotent ATA creation.", "Cache known token accounts carefully.", "Do not treat an existing ATA as a fatal user error."],
      limitations: "The existing ATA should still be validated for mint and owner.",
      codeExample: { language: "typescript", title: "Use idempotent ATA creation", code: `// from @solana/spl-token\nconst ix = createAssociatedTokenAccountIdempotentInstruction(\n  payer,\n  ata,\n  owner,\n  mint\n);` }
    },
    anchor_constraint_violation: {
      immediate: "Pass the account expected by the Anchor constraint and verify seeds, owner, mint, authority, and has_one relationships.",
      codeLevel: "Compare the failing constraint with the program's #[account(...)] definitions or IDL error map.",
      prevention: ["Derive PDAs from the same seeds as the program.", "Validate account owners client-side.", "Surface Anchor error names in the UI."],
      limitations: "Exact constraint names require the program IDL or source.",
      codeExample: { language: "anchor", title: "Match PDA seeds", code: `#[account(\n  seeds = [b"vault", authority.key().as_ref()],\n  bump,\n  has_one = authority\n)]\npub vault: Account<'info, Vault>,` }
    }
  };

  return repairs[category] ?? {
    immediate: "Review the failing instruction, matched logs, and program-specific documentation before retrying.",
    codeLevel: "Add preflight simulation, account validation, and program-specific error decoding for this path.",
    prevention: ["Keep program IDLs and custom error maps available.", "Surface raw logs to developers.", "Do not retry unchanged transactions blindly."],
    limitations: "This recommendation is evidence-supported only when logs or RPC metadata identify the failure.",
    codeExample: { language: "typescript", title: "Preflight before requesting approval", code: defaultCode }
  };
}
