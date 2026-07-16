import { describe, expect, it } from "vitest";
import { networkSchema, validateSignature } from "./validation";

describe("validation", () => {
  it("rejects invalid signatures", () => {
    expect(validateSignature("not-real").success).toBe(false);
  });

  it("allows supported networks only", () => {
    expect(networkSchema.safeParse("devnet").success).toBe(true);
    expect(networkSchema.safeParse("testnet").success).toBe(false);
  });
});
