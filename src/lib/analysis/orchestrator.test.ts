import { describe, expect, it } from "vitest";
import { analyzeTransaction } from "./orchestrator";

describe("analyzeTransaction", () => {
  it("analyzes a deterministic demo scenario", async () => {
    const report = await analyzeTransaction({ network: "devnet", demoScenario: "compute-budget" });
    expect(report.diagnosis.category).toBe("compute_budget_exceeded");
    expect(report.diagnosis.evidence.length).toBeGreaterThan(1);
    expect(report.repair.immediate).toContain("compute");
  });
});
