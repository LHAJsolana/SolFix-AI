import { Shell, SystemLabel } from "@/components/ui";
import { SimulationForm } from "./simulation-form";

export default function SimulatePage() {
  return (
    <Shell>
      <section className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6">
        <SystemLabel>Advanced RPC tool</SystemLabel>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
          Simulate a serialized transaction.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
          Submit a base64 serialized Solana transaction to the selected RPC network. SolFix does not sign, broadcast, or store the payload.
        </p>
        <SimulationForm />
      </section>
    </Shell>
  );
}
