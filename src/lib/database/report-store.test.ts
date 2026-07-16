import { describe, expect, it } from "vitest";
import { analyzeTransaction } from "@/lib/analysis/orchestrator";
import { getReportById, saveAttestation, saveReport } from "./report-store";

describe("report-store", () => {
  it("saves attestation signatures onto persisted reports", async () => {
    const report = await analyzeTransaction({ network: "devnet", demoScenario: "insufficient-sol" });
    const updated = await saveAttestation({
      reportId: report.id,
      signature: "5xY7demoMemoSignature111111111111111111111111111111111111111111111111111",
      explorerUrl: "https://explorer.solana.com/tx/demo?cluster=devnet"
    });
    expect(updated?.attestation?.signature).toContain("5xY7demoMemoSignature");
    const fetched = await getReportById(report.id);
    expect(fetched?.attestation?.explorerUrl).toContain("cluster=devnet");
  });

  it("updates duplicate report IDs instead of creating an unsafe duplicate", async () => {
    const report = await analyzeTransaction({ network: "devnet", demoScenario: "missing-signer" });
    await saveReport({ ...report, visibility: "unlisted" });
    const fetched = await getReportById(report.id);
    expect(fetched?.slug).toBe(report.slug);
    expect(fetched?.visibility).toBe("unlisted");
  });
});
