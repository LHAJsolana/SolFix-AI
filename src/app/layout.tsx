import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolFix - Solana Transaction Diagnostics",
  description: "Investigate failed Solana transactions, isolate the failing instruction, inspect program logs, and receive evidence-backed repair guidance.",
  openGraph: {
    title: "SolFix",
    description: "Evidence-backed Solana transaction debugging.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
