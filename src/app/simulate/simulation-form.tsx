"use client";

import { useState } from "react";
import { PrimaryAction, SectionDivider, StatusPill, SystemLabel, TechnicalTable } from "@/components/ui";
import type { Network } from "@/lib/types";

type SimulationResult = {
  status: string;
  err: unknown;
  logs: string[];
  unitsConsumed?: number;
  replacementBlockhash?: unknown;
  error?: string;
};

export function SimulationForm() {
  const [network, setNetwork] = useState<Network>("devnet");
  const [serializedTransaction, setSerializedTransaction] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ network, serializedTransaction, encoding: "base64" })
      });
      const json = (await response.json()) as SimulationResult;
      setResult(response.ok ? json : { ...json, status: "request_failed", logs: [] });
    } catch (error) {
      setResult({ status: "request_failed", error: error instanceof Error ? error.message : "Simulation request failed.", logs: [], err: null });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-zinc-400" htmlFor="simulation-network">Network</label>
          <select
            id="simulation-network"
            value={network}
            onChange={(event) => setNetwork(event.target.value as Network)}
            className="rounded-sm border border-white/[0.08] bg-surface px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-400"
          >
            <option value="devnet">devnet</option>
            <option value="mainnet-beta">mainnet-beta</option>
          </select>
        </div>
        <label className="block">
          <span className="text-sm text-zinc-400">Base64 serialized transaction</span>
          <textarea
            value={serializedTransaction}
            onChange={(event) => setSerializedTransaction(event.target.value)}
            rows={10}
            placeholder="Paste base64 serialized transaction"
            className="mt-2 w-full resize-y rounded-sm border border-white/[0.08] bg-black/20 p-3 font-mono text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400"
          />
        </label>
        <PrimaryAction disabled={loading || serializedTransaction.trim().length === 0}>
          {loading ? "Simulating..." : "Simulate transaction"}
        </PrimaryAction>
      </form>

      <aside className="bg-surface p-5">
        <SystemLabel>Limitations</SystemLabel>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
          <li>No signing or broadcasting occurs.</li>
          <li>Payloads are size-limited and not stored by default.</li>
          <li>Simulation results depend on current account state and blockhash replacement behavior.</li>
        </ul>
      </aside>

      {result && (
        <section className="lg:col-span-2">
          <SectionDivider className="mb-5" />
          <div className="mb-4 flex items-center gap-3">
            <SystemLabel>Simulation result</SystemLabel>
            <StatusPill tone={result.error || result.err ? "failed" : "verified"}>{result.status}</StatusPill>
          </div>
          <TechnicalTable
            rows={[
              { label: "Error", value: result.error ?? JSON.stringify(result.err ?? null), mono: true },
              { label: "Units", value: result.unitsConsumed ?? "not returned" },
              { label: "Replacement", value: JSON.stringify(result.replacementBlockhash ?? null), mono: true }
            ]}
          />
          <div className="mt-5 overflow-x-auto bg-black/30 p-3">
            {(result.logs ?? []).length ? (
              result.logs.map((line, index) => (
                <pre key={`${index}-${line}`} className="font-mono text-xs leading-6 text-zinc-400">{line}</pre>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No logs returned.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
