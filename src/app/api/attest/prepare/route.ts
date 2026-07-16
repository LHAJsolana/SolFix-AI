import { NextRequest, NextResponse } from "next/server";
import { Transaction, TransactionInstruction, PublicKey } from "@solana/web3.js";
import { getReportById } from "@/lib/database/report-store";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { createConnection } from "@/lib/solana/rpc-client";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export async function POST(request: NextRequest) {
  const limited = rateLimit(`attest:${clientKey(request)}`, 10);
  if (!limited.ok) return NextResponse.json({ error: "Too many attestation requests." }, { status: 429, headers: rateLimitHeaders(limited) });
  const body = await request.json().catch(() => null);
  const reportId = typeof body?.reportId === "string" ? body.reportId : "";
  const feePayer = typeof body?.feePayer === "string" ? body.feePayer : "";
  const report = await getReportById(reportId);
  if (!report?.attestation) return NextResponse.json({ error: "Report not found." }, { status: 404 });
  let payer: PublicKey;
  try {
    payer = new PublicKey(feePayer);
  } catch {
    return NextResponse.json({ error: "Invalid fee payer public key." }, { status: 400 });
  }

  try {
    const connection = createConnection("devnet");
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({ feePayer: payer, recentBlockhash: blockhash });
    tx.add(new TransactionInstruction({ programId: MEMO_PROGRAM_ID, keys: [], data: Buffer.from(report.attestation.memoPayload, "utf8") }));
    return NextResponse.json({
      network: "devnet",
      memoPayload: report.attestation.memoPayload,
      transaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64"),
      blockhash,
      lastValidBlockHeight,
      note: "Client must request wallet approval, send the signed devnet transaction, confirm it, and save the signature."
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not prepare devnet Memo transaction." }, { status: 503 });
  }
}
