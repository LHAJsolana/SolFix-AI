import { PrismaClient } from "@prisma/client";
import { getReportBySlug, saveAttestation, saveReport } from "../src/lib/database/report-store";
import type { AnalysisReport } from "../src/lib/types";

if (process.env.PERSISTENCE_MODE !== "postgres") {
  throw new Error("PERSISTENCE_MODE must be postgres for production verification.");
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for production verification.");
}

const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const id = `production-verification-${suffix}`;
const slug = `production-verification-${suffix}`;
const signature = "5xyiQJa2r5M8mDEYgjmpzkXCNqnzemdYz6Y7rorVYxPcJUyBcdPBjn3msVW5LAtb4UzxiCK3ooh2273t5NjirAzT";

const report: AnalysisReport = {
  id,
  slug,
  reportVersion: "1",
  analysisVersion: "production-verification",
  parserVersion: "production-verification",
  classifierVersion: "production-verification",
  isDemo: false,
  rpcRetrievedAt: new Date().toISOString(),
  aiProvider: "deterministic",
  createdAt: new Date().toISOString(),
  visibility: "unlisted",
  transaction: {
    signature,
    network: "mainnet-beta",
    slot: 433329992,
    blockTime: 1784228569,
    fee: 5000,
    signers: [],
    status: "failed",
    error: "{\"InstructionError\":[3,{\"Custom\":7}]}",
    instructions: [],
    logs: ["production verification log"],
    balanceChanges: [],
    tokenBalanceChanges: []
  },
  diagnosis: {
    category: "production_verification",
    title: "Production verification",
    summary: "Controlled persistence verification.",
    userExplanation: "Controlled persistence verification.",
    developerExplanation: "Controlled persistence verification.",
    impact: "No user data impact.",
    failingInstruction: { instructionIndex: 3, programId: "production-verification" },
    evidence: [
      {
        id: "production-verification-evidence",
        source: "classifier",
        text: "Controlled evidence item.",
        reason: "Verifies JSON serialization."
      }
    ],
    confidence: 1,
    confidenceReasons: ["Controlled verification record."],
    verificationStatus: "manual_review_required"
  },
  repair: {
    immediate: "Delete verification record after test.",
    codeLevel: "No code repair.",
    prevention: ["Use namespaced records."],
    limitations: "This is not a transaction diagnosis.",
    codeExample: { language: "typescript", title: "No-op", code: "void 0;" }
  },
  timeline: [{ label: "Verification", status: "complete", detail: "Created by production verification script." }],
  mode: "developer",
  attestation: {
    reportHash: "production-verification-hash",
    memoPayload: `SOLFIX|v1|report:${id}|source:${signature.slice(0, 12)}|hash:production-verification-hash|ts:${Math.floor(Date.now() / 1000)}`
  }
};

async function main() {
  const prisma = new PrismaClient();
  try {
    await saveReport(report);
    const bySlug = await getReportBySlug(slug);
    if (!bySlug) throw new Error("Report lookup by slug failed.");
    if (bySlug.slug !== slug || bySlug.transaction.signature !== signature) {
      throw new Error("Report JSON round-trip mismatch.");
    }

    const indexed = await prisma.analysisReport.findMany({
      where: { network: "mainnet-beta", signature },
      take: 1
    });
    if (indexed.length === 0) throw new Error("Network/signature query returned no records.");

    const attested = await saveAttestation({
      reportId: id,
      signature: `production-verification-signature-${suffix}`,
      explorerUrl: "https://explorer.solana.com/tx/production-verification?cluster=devnet"
    });
    if (attested?.attestation?.signature !== `production-verification-signature-${suffix}`) {
      throw new Error("Attestation update did not target the expected report.");
    }

    await prisma.$disconnect();
    const freshPrisma = new PrismaClient();
    const fresh = await freshPrisma.analysisReport.findUnique({ where: { slug } });
    await freshPrisma.$disconnect();
    if (!fresh) throw new Error("Report was not retrievable after Prisma client recreation.");

    console.log(`created=${id}`);
    console.log("json_round_trip=ok");
    console.log("network_signature_query=ok");
    console.log("attestation_update=ok");
    console.log("client_recreation_lookup=ok");
  } finally {
    const cleanup = new PrismaClient();
    await cleanup.attestation.deleteMany({ where: { reportId: id } });
    await cleanup.analysisReport.deleteMany({ where: { id } });
    await cleanup.$disconnect();
    console.log("cleanup=ok");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Production verification failed.");
  process.exit(1);
});
