"use client";

import { Connection, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { PrimaryAction, StatusPill, TextAction } from "@/components/ui";

type WalletProvider = {
  isPhantom?: boolean;
  publicKey?: { toBase58(): string };
  connect(): Promise<{ publicKey: { toBase58(): string } }>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
};

type PrepareResponse = {
  transaction: string;
  blockhash: string;
  lastValidBlockHeight: number;
  memoPayload: string;
};

type AttestationState = "idle" | "preparing" | "awaiting_signature" | "submitted" | "confirming" | "confirmed" | "failed";

function getWallet(): WalletProvider | null {
  if (typeof window === "undefined") return null;
  const candidate = (window as unknown as { solana?: WalletProvider }).solana;
  return candidate?.isPhantom || candidate?.connect ? candidate : null;
}

function base64ToBytes(value: string) {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function AttestationPanel({
  reportId,
  existingSignature,
  existingExplorerUrl
}: {
  reportId: string;
  existingSignature?: string;
  existingExplorerUrl?: string;
}) {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [status, setStatus] = useState(existingSignature ? "Attestation saved." : "Devnet Memo attestation is optional.");
  const [attestationState, setAttestationState] = useState<AttestationState>(existingSignature ? "confirmed" : "idle");
  const [signature, setSignature] = useState(existingSignature ?? "");
  const [explorerUrl, setExplorerUrl] = useState(existingExplorerUrl ?? "");
  const [busy, setBusy] = useState(false);

  async function connect() {
    const wallet = getWallet();
    if (!wallet) {
      setStatus("No browser wallet found. Install a Solana wallet that exposes window.solana.");
      return null;
    }
    try {
      const connected = await wallet.connect();
      const address = connected.publicKey.toBase58();
      setWalletAddress(address);
      setStatus(`Connected ${address.slice(0, 4)}...${address.slice(-4)} for devnet Memo attestation.`);
      return { wallet, address };
    } catch {
      setAttestationState("failed");
      setStatus("Wallet connection was rejected. No transaction was prepared or sent.");
      return null;
    }
  }

  async function attest() {
    if (busy || signature) return;
    setBusy(true);
    try {
      setAttestationState("preparing");
      const connected = walletAddress ? { wallet: getWallet(), address: walletAddress } : await connect();
      if (!connected?.wallet) return;
      const prepare = await fetch("/api/attest/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reportId, feePayer: connected.address })
      });
      const prepared = (await prepare.json()) as PrepareResponse & { error?: string };
      if (!prepare.ok) throw new Error(prepared.error || "Could not prepare Memo transaction.");
      const transaction = Transaction.from(base64ToBytes(prepared.transaction));
      setAttestationState("awaiting_signature");
      setStatus("Review the devnet Memo transaction in your wallet. It publishes only the report hash payload.");
      const signed = await connected.wallet.signTransaction(transaction);
      const raw = signed.serialize();
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com", "confirmed");
      setAttestationState("submitted");
      const txSignature = await connection.sendRawTransaction(raw, { skipPreflight: false });
      setStatus("Memo sent. Confirming on devnet...");
      setAttestationState("confirming");
      await connection.confirmTransaction(
        { signature: txSignature, blockhash: prepared.blockhash, lastValidBlockHeight: prepared.lastValidBlockHeight },
        "confirmed"
      );
      const saved = await fetch("/api/attest/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reportId, signature: txSignature })
      });
      const savedJson = await saved.json();
      if (!saved.ok) throw new Error(savedJson.error || "Memo confirmed but could not be saved.");
      setSignature(txSignature);
      setExplorerUrl(savedJson.attestation?.explorerUrl ?? "");
      setAttestationState("confirmed");
      setStatus("Attestation confirmed and saved.");
    } catch (error) {
      setAttestationState("failed");
      const message = error instanceof Error ? error.message : "Attestation failed.";
      setStatus(message.includes("User rejected") ? "You rejected the wallet request. No Memo was sent." : message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <StatusPill tone={attestationState === "confirmed" ? "verified" : attestationState === "failed" ? "warning" : "info"}>
          {attestationState === "idle" ? "Optional devnet Memo" : attestationState.replace(/_/g, " ")}
        </StatusPill>
        {walletAddress ? <StatusPill tone="neutral">{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</StatusPill> : null}
      </div>
      <p className="text-xs leading-5 text-zinc-500">{status}</p>
      {signature ? (
        <a href={explorerUrl || `https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noreferrer" className="block break-all font-mono text-[11px] text-zinc-300 underline decoration-white/20 underline-offset-4">
          {signature}
        </a>
      ) : (
        <div className="flex flex-wrap gap-3">
          <TextAction disabled={busy} onClick={() => void connect()}>Connect wallet</TextAction>
          <PrimaryAction disabled={busy} onClick={() => void attest()}>{busy ? "Working..." : "Anchor Memo"}</PrimaryAction>
        </div>
      )}
    </div>
  );
}
