"use client";

import { useState } from "react";
import { demoScenarios } from "@/data/demo-scenarios";
import { PrimaryAction, TextAction } from "@/components/ui";

export function AnalyzeForm({ compact = false }: { compact?: boolean }) {
  const [signature, setSignature] = useState("");
  const [network, setNetwork] = useState("devnet");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(demoScenario?: string) {
    setLoading(true);
    setMessage("Validating and starting investigation...");
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ signature, network, demoScenario })
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "Analysis failed.");
      setLoading(false);
      return;
    }
    window.location.href = `/analysis/${json.id}`;
  }

  return (
    <div className="space-y-3">
      <div className={`bg-elevated ${compact ? "p-2" : "p-3"}`}>
        <label htmlFor={compact ? "home-signature" : "signature"} className="sr-only">Transaction signature</label>
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_148px_auto]">
          <input
            id={compact ? "home-signature" : "signature"}
            value={signature}
            onChange={(event) => setSignature(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submit();
            }}
            placeholder="Paste a Solana transaction signature"
            className="min-h-11 w-full bg-transparent px-3 font-mono text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:bg-white/[0.035]"
          />
          <label htmlFor={compact ? "home-network" : "network"} className="sr-only">Network</label>
          <select
            id={compact ? "home-network" : "network"}
            value={network}
            onChange={(event) => setNetwork(event.target.value)}
            className="min-h-11 bg-ink px-3 text-sm text-zinc-300 outline-none focus:bg-white/[0.05]"
          >
            <option value="mainnet-beta">mainnet-beta</option>
            <option value="devnet">devnet</option>
          </select>
          <PrimaryAction disabled={loading} onClick={() => void submit()} className="min-h-11">
            Inspect transaction
          </PrimaryAction>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
        <TextAction disabled={loading} onClick={() => void submit(demoScenarios[0].id)}>Load example</TextAction>
        <span>Enter to inspect</span>
        <span className="font-mono">Example: 5xY7...8Vq2</span>
      </div>
      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
    </div>
  );
}
