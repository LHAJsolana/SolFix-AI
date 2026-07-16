"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

type Health = {
  status: "ok" | "degraded";
  rpc: {
    mainnet: { ok: boolean };
    devnet: { ok: boolean };
  };
};

export function RpcStatus() {
  const [label, setLabel] = useState("Checking RPC");
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then((response) => response.json())
      .then((health: Health) => {
        if (!active) return;
        const healthy = Boolean(health.rpc?.mainnet?.ok || health.rpc?.devnet?.ok);
        setOk(healthy);
        setLabel(healthy ? "RPC reachable" : "RPC degraded");
      })
      .catch(() => {
        if (!active) return;
        setOk(false);
        setLabel("RPC unknown");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
      <Activity size={13} className={ok === false ? "text-amber-400" : ok === true ? "text-emerald-500" : "text-zinc-500"} />
      {label}
    </span>
  );
}
