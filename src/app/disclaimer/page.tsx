import { Shell, Surface, SystemLabel } from "@/components/ui";

export default function DisclaimerPage() {
  return (
    <Shell>
      <Surface className="mx-auto mt-10 max-w-3xl">
        <SystemLabel>Disclaimer</SystemLabel>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-100">Debugging guidance, not transaction execution.</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          SolFix provides evidence-backed debugging guidance. It does not automatically execute repairs, and simulation does not guarantee mainnet success.
        </p>
      </Surface>
    </Shell>
  );
}
