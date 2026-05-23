import type { FilingStatus, TaxEstimate, TaxYearInput } from "@portfolio/contracts";
import type { TaxBracket, TaxRulePack } from "./types.js";

function computeGrossIncome(input: TaxYearInput): number {
  return (
    input.wages +
    input.selfEmploymentIncome +
    input.interestIncome +
    input.dividendIncome +
    input.capitalGainsShort +
    input.capitalGainsLong +
    input.otherIncome
  );
}

function getStandardDeduction(
  filingStatus: FilingStatus,
  rules: TaxRulePack,
  override?: number
): number {
  if (override !== undefined) return override;
  return rules.standardDeduction[filingStatus];
}

export function computeTaxOnIncome(
  taxableIncome: number,
  brackets: TaxBracket[]
): { tax: number; marginalRate: number } {
  if (taxableIncome <= 0) {
    return { tax: 0, marginalRate: brackets[0]?.rate ?? 0 };
  }

  let remaining = taxableIncome;
  let tax = 0;
  let prevLimit = 0;
  let marginalRate = brackets[0]?.rate ?? 0;

  for (const bracket of brackets) {
    const limit = bracket.upTo ?? Infinity;
    const width = Math.min(remaining, limit - prevLimit);
    if (width <= 0) break;
    tax += width * bracket.rate;
    remaining -= width;
    prevLimit = limit;
    marginalRate = bracket.rate;
    if (remaining <= 0) break;
  }

  return { tax, marginalRate };
}

export function estimateFederalTax(
  input: TaxYearInput,
  rules: TaxRulePack
): TaxEstimate {
  const grossIncome = computeGrossIncome(input);
  const agi = Math.max(0, grossIncome - input.adjustments);

  const standardDeduction = getStandardDeduction(
    input.filingStatus,
    rules,
    input.standardDeductionOverride ?? input.itemizedDeductions
  );

  const deductionUsed =
    input.itemizedDeductions !== undefined &&
    input.itemizedDeductions > standardDeduction
      ? input.itemizedDeductions
      : standardDeduction;

  const taxableIncome = Math.max(0, agi - deductionUsed);
  const brackets = rules.brackets[input.filingStatus];
  const { tax, marginalRate } = computeTaxOnIncome(taxableIncome, brackets);

  const effectiveRate = agi > 0 ? tax / agi : 0;

  return {
    taxYear: input.taxYear,
    adjustedGrossIncome: round2(agi),
    taxableIncome: round2(taxableIncome),
    standardDeduction: round2(deductionUsed),
    federalTax: round2(tax),
    effectiveRate: round4(effectiveRate),
    marginalRate: round4(marginalRate),
    breakdown: {
      grossIncome: round2(grossIncome),
      adjustments: round2(input.adjustments),
      ordinaryTax: round2(tax),
    },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
