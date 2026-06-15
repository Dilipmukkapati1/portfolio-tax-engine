import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TaxRulePack } from "./types.js";
import rules2025 from "../rules/tax-rules-2025.json" with { type: "json" };
import rules2026 from "../rules/tax-rules-2026.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));

export type SupportedTaxYear = 2025 | 2026;

const RULES_BY_YEAR: Record<SupportedTaxYear, TaxRulePack> = {
  2025: rules2025 as TaxRulePack,
  2026: rules2026 as TaxRulePack,
};

const SUPPORTED_YEARS = Object.keys(RULES_BY_YEAR)
  .map(Number)
  .sort((a, b) => a - b) as SupportedTaxYear[];

export function resolveSupportedTaxYear(taxYear: number): SupportedTaxYear {
  if (taxYear in RULES_BY_YEAR) {
    return taxYear as SupportedTaxYear;
  }
  const latest = SUPPORTED_YEARS[SUPPORTED_YEARS.length - 1]!;
  if (taxYear > latest) return latest;
  return SUPPORTED_YEARS[0]!;
}

export function loadRulePack(taxYear: number): TaxRulePack {
  return RULES_BY_YEAR[resolveSupportedTaxYear(taxYear)];
}

export function loadRulePackFromPath(path: string): TaxRulePack {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as TaxRulePack;
}

export function getDefaultRulesPath(): string {
  const latest = SUPPORTED_YEARS[SUPPORTED_YEARS.length - 1]!;
  return join(__dirname, "..", "rules", `tax-rules-${latest}.json`);
}
