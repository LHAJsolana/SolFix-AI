// @vitest-environment node

import { Keypair, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction, TransactionMessage } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { decodeTransaction } from "./route";

const payer = Keypair.generate();
const recipient = Keypair.generate().publicKey;
const blockhash = Keypair.generate().publicKey.toBase58();
const transfer = new TransactionInstruction({
  programId: SystemProgram.programId,
  keys: [
    { pubkey: payer.publicKey, isSigner: true, isWritable: true },
    { pubkey: recipient, isSigner: false, isWritable: true }
  ],
  data: Buffer.alloc(0)
});

describe("decodeTransaction", () => {
  it("rejects malformed base64", () => {
    expect(() => decodeTransaction("not valid base64!!!")).toThrow(/base64|transaction/i);
  });

  it("rejects oversized payloads", () => {
    expect(() => decodeTransaction(Buffer.alloc(1601).toString("base64"))).toThrow(/too large/);
  });

  it("decodes legacy transactions", () => {
    const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(transfer);
    tx.sign(payer);
    const encoded = tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64");
    expect(decodeTransaction(encoded).kind).toBe("legacy");
  });

  it("decodes versioned transactions", () => {
    const message = new TransactionMessage({ payerKey: payer.publicKey, recentBlockhash: blockhash, instructions: [transfer] }).compileToV0Message();
    const tx = new VersionedTransaction(message);
    tx.sign([payer]);
    const encoded = Buffer.from(tx.serialize()).toString("base64");
    expect(decodeTransaction(encoded).kind).toBe("versioned");
  });
});
