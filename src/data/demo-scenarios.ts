import type { DemoScenario, NormalizedTransaction } from "@/lib/types";
import { buildRepair } from "@/lib/analysis/repair-engine";

function tx(id: string, error: string, logs: string[], programId = "11111111111111111111111111111111"): NormalizedTransaction {
  return {
    signature: `DEMO_${id}_NOT_A_REAL_SIGNATURE`,
    network: "devnet",
    slot: 284000000,
    blockTime: 1760000000,
    fee: 5000,
    feePayer: "DemoFeePayer111111111111111111111111111111",
    signers: ["DemoFeePayer111111111111111111111111111111"],
    status: "failed",
    error,
    computeUnitsConsumed: 13842,
    confirmationStatus: "demo",
    version: "legacy",
    recentBlockhash: "DemoBlockhash1111111111111111111111111111111",
    instructions: [
      {
        index: 0,
        programId: "ComputeBudget111111111111111111111111111111",
        programName: "Compute Budget Program",
        type: "setComputeUnitLimit",
        accounts: [],
        innerInstructions: [],
        status: "success"
      },
      {
        index: 1,
        programId,
        programName: programId === "11111111111111111111111111111111" ? "System Program" : "Unknown Program",
        type: "demoInstruction",
        accounts: ["DemoFeePayer111111111111111111111111111111", "DemoAccount222222222222222222222222222222"],
        innerInstructions: [
          {
            index: 0,
            parentIndex: 1,
            programId,
            programName: programId === "11111111111111111111111111111111" ? "System Program" : "Unknown Program",
            type: "invoke",
            accounts: ["DemoAccount222222222222222222222222222222"],
            status: "unknown"
          }
        ],
        status: "failed"
      }
    ],
    logs,
    balanceChanges: [{ account: "DemoFeePayer111111111111111111111111111111", lamports: -5000 }],
    tokenBalanceChanges: []
  };
}

function scenario(
  id: string,
  title: string,
  category: string,
  error: string,
  logs: string[],
  userExplanation: string,
  developerExplanation: string,
  confidence = 90,
  programId?: string
): DemoScenario {
  return {
    id,
    title,
    userExplanation,
    developerExplanation,
    transaction: tx(id, error, logs, programId),
    expectedCategory: category,
    expectedConfidence: confidence,
    verificationStatus: "evidence_supported",
    repair: buildRepair(category)
  };
}

export const demoScenarios: DemoScenario[] = [
  scenario("insufficient-sol", "Insufficient SOL balance", "insufficient_sol", "{\"InstructionError\":[1,\"InsufficientFundsForRent\"]}", ["Program 11111111111111111111111111111111 invoke [1]", "Transfer: insufficient lamports 4000, need 2039280", "Program 11111111111111111111111111111111 failed: insufficient funds"], "The wallet did not have enough SOL for the attempted account creation or fee.", "The System Program failed at instruction 1 because available lamports were lower than the debit/rent requirement."),
  scenario("missing-signer", "Missing required signer", "missing_required_signer", "{\"InstructionError\":[1,\"MissingRequiredSignature\"]}", ["Program DemoProgram111111111111111111111111111111 invoke [1]", "Program log: missing required signature for authority", "Program DemoProgram111111111111111111111111111111 failed: missing required signature"], "A required authority did not sign the transaction.", "Instruction account metas require a signer that is not present in the transaction signatures.", 91, "DemoProgram111111111111111111111111111111"),
  scenario("blockhash-expired", "Blockhash expired", "blockhash_expired", "BlockhashNotFound", ["Transaction simulation failed: Blockhash not found", "This transaction may have used an expired blockhash"], "The transaction was signed with a blockhash that validators no longer accept.", "The runtime rejected the transaction before program execution because the recent blockhash was stale.", 94),
  scenario("compute-budget", "Compute budget exceeded", "compute_budget_exceeded", "{\"InstructionError\":[1,\"ComputationalBudgetExceeded\"]}", ["Program DemoProgram111111111111111111111111111111 invoke [1]", "Program consumed 200000 of 200000 compute units", "Program DemoProgram111111111111111111111111111111 failed: computational budget exceeded"], "The transaction ran out of compute units.", "The invoked program consumed the transaction's compute unit limit before completion.", 92, "DemoProgram111111111111111111111111111111"),
  scenario("ata-exists", "Associated token account already exists", "associated_token_account_already_exists", "{\"InstructionError\":[1,{\"Custom\":0}]}", ["Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL invoke [1]", "Program log: Associated token account already exists", "Program failed: already in use"], "The token account creation step tried to create an account that already exists.", "Use idempotent ATA creation or skip this instruction after confirming the ATA owner and mint.", 89, "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
  scenario("anchor-constraint", "Anchor constraint violation", "anchor_constraint_violation", "{\"InstructionError\":[1,{\"Custom\":2006}]}", ["Program AnchorDemo11111111111111111111111111111 invoke [1]", "Program log: AnchorError caused by account: vault. Error Code: ConstraintSeeds. Error Number: 2006.", "Program AnchorDemo11111111111111111111111111111 failed: custom program error: 0x7d6"], "An Anchor account constraint failed, likely because a PDA or authority account was wrong.", "Anchor reported ConstraintSeeds for the vault account at instruction 1.", 91, "AnchorDemo11111111111111111111111111111"),
  scenario("invalid-owner", "Invalid account owner", "invalid_account_owner", "{\"InstructionError\":[1,\"IllegalOwner\"]}", ["Program DemoProgram111111111111111111111111111111 invoke [1]", "Program log: invalid account owner", "Program failed: owner does not match"], "An account belongs to a different program than expected.", "The program expected a specific owner but received an account controlled by another program.", 87, "DemoProgram111111111111111111111111111111"),
  scenario("account-not-initialized", "Account not initialized", "account_not_initialized", "{\"InstructionError\":[1,\"UninitializedAccount\"]}", ["Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]", "Program log: AccountNotInitialized", "Program failed: account not initialized"], "The transaction referenced a token or program account that has not been initialized.", "The account data exists but has not passed the target program's initialization path.", 88, "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  scenario("slippage", "Slippage exceeded", "slippage_exceeded", "{\"InstructionError\":[1,{\"Custom\":6001}]}", ["Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 invoke [1]", "Program log: Slippage tolerance exceeded", "Program failed: custom program error: 0x1771"], "The swap route could not meet the minimum output amount.", "The aggregator rejected execution because market movement exceeded the user's threshold.", 84, "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4")
];

export function getDemoScenario(id: string) {
  return demoScenarios.find((scenario) => scenario.id === id);
}
