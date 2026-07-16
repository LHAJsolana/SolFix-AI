"use client";

import { useState } from "react";
import { StatusPill } from "./ui";

export function DiagnosticModePanel({
  userExplanation,
  developerExplanation
}: {
  userExplanation: string;
  developerExplanation: string;
}) {
  const [mode, setMode] = useState<"user" | "developer">("user");
  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button type="button" onClick={() => setMode("user")} aria-pressed={mode === "user"}>
          <StatusPill tone={mode === "user" ? "info" : "neutral"}>User mode</StatusPill>
        </button>
        <button type="button" onClick={() => setMode("developer")} aria-pressed={mode === "developer"}>
          <StatusPill tone={mode === "developer" ? "info" : "neutral"}>Developer mode</StatusPill>
        </button>
      </div>
      <p className="text-sm leading-6 text-zinc-300">{mode === "user" ? userExplanation : developerExplanation}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">This text explains the report. The diagnosis source is the RPC evidence, classifier, and evidence rows below.</p>
    </div>
  );
}
