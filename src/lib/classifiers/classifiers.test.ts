import { describe, expect, it } from "vitest";
import { classify } from ".";
import type { NormalizedTransaction } from "@/lib/types";

function baseTx(overrides: Partial<NormalizedTransaction>): NormalizedTransaction {
  return {
    signature: "fixture",
    network: "devnet",
    status: "failed",
    signers: [],
    instructions: [],
    logs: [],
    balanceChanges: [],
    tokenBalanceChanges: [],
    ...overrides
  };
}

describe("classify", () => {
  it("does not fabricate a failure for successful transactions with matching log text", () => {
    const match = classify(baseTx({ status: "success", logs: ["Program consumed 81813 of 200000 compute units"] }), [], {});
    expect(match.category).toBe("successful_transaction");
  });

  it("classifies unknown custom errors conservatively", () => {
    const match = classify(baseTx({ error: "custom program error: 0xbeef" }), [], {});
    expect(match.category).toBe("custom_program_error");
    expect(match.verificationStatus).toBe("probable_diagnosis");
  });
});
