import { Shell, Surface, SystemLabel } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <Shell>
      <Surface className="mx-auto mt-10 max-w-3xl">
        <SystemLabel>Privacy</SystemLabel>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-100">Public transaction data only.</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          SolFix does not request private keys, does not store seed phrases, and does not require wallet connection for analysis. Transaction signatures are public blockchain data.
        </p>
      </Surface>
    </Shell>
  );
}
