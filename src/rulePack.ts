import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TaxRulePack } from "./types.js";
import rules2025 from "../rules/tax-rules-2025.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadRulePack(year: 2025): TaxRulePack {
  if (year === 2025) {
    return rules2025 as TaxRulePack;
  }
  throw new Error(`Unsupported tax year: ${year}`);
}

export function loadRulePackFromPath(path: string): TaxRulePack {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as TaxRulePack;
}

export function getDefaultRulesPath(): string {
  return join(__dirname, "..", "rules", "tax-rules-2025.json");
}
