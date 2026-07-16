import { describe, expect, it } from "vitest";
import { analyzeTransaction } from "./orchestrator";
import { hashReport, memoPayload } from "./report-hash";

describe("report hash and memo payload", () => {
  it("is deterministic for the same report payload", async () => {
    const report = await analyzeTransaction({ network: "devnet", demoScenario: "anchor-constraint" });
    expect(hashReport(report)).toBe(hashReport(report));
    expect(memoPayload(report)).toMatch(/^SOLFIX\|v1\|report:.+\|source:.+\|hash:[a-f0-9]{64}\|ts:\d+$/);
  });
});
