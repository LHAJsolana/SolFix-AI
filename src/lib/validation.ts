import bs58 from "bs58";
import { z } from "zod";
import type { Network } from "./types";

export const networks = ["mainnet-beta", "devnet"] as const;

export const networkSchema = z.enum(networks);

export const signatureSchema = z
  .string()
  .trim()
  .min(64, "A Solana signature is usually 64-88 base58 characters.")
  .max(88, "Signature is too long for a Solana transaction signature.")
  .refine((value) => {
    try {
      const decoded = bs58.decode(value);
      return decoded.length === 64;
    } catch {
      return false;
    }
  }, "Enter a valid base58 Solana transaction signature.");

export const analyzeRequestSchema = z.object({
  signature: z.string().optional(),
  network: networkSchema.default("devnet"),
  mode: z.enum(["user", "developer"]).default("user"),
  demoScenario: z.string().min(1).optional()
});

export function isNetwork(value: string): value is Network {
  return networks.includes(value as Network);
}

export function validateSignature(signature: string) {
  return signatureSchema.safeParse(signature);
}
