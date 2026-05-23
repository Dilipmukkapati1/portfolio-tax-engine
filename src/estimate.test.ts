import { describe, it, expect } from "vitest";
import { loadRulePack, estimateFederalTax, suggestStrategies } from "./index.js";
import type { TaxYearInput } from "@portfolio/contracts";

describe("estimateFederalTax", () => {
  const rules = loadRulePack(2025);

  it("computes tax for single filer with wages", () => {
    const input: TaxYearInput = {
      taxYear: 2025,
      filingStatus: "single",
      wages: 85000,
      selfEmploymentIncome: 0,
      interestIncome: 0,
      dividendIncome: 0,
      capitalGainsShort: 0,
      capitalGainsLong: 0,
      otherIncome: 0,
      adjustments: 0,
      dependents: 0,
      retirementContributions: 0,
      hsaContributions: 0,
    };
    const result = estimateFederalTax(input, rules);
    expect(result.adjustedGrossIncome).toBe(85000);
    expect(result.taxableIncome).toBe(85000 - rules.standardDeduction.single);
    expect(result.federalTax).toBeGreaterThan(0);
    expect(result.marginalRate).toBeGreaterThan(0);
  });

  it("returns zero tax for income below standard deduction", () => {
    const input: TaxYearInput = {
      taxYear: 2025,
      filingStatus: "single",
      wages: 10000,
      selfEmploymentIncome: 0,
      interestIncome: 0,
      dividendIncome: 0,
      capitalGainsShort: 0,
      capitalGainsLong: 0,
      otherIncome: 0,
      adjustments: 0,
      dependents: 0,
      retirementContributions: 0,
      hsaContributions: 0,
    };
    const result = estimateFederalTax(input, rules);
    expect(result.federalTax).toBe(0);
  });

  it("suggests strategies for business owner persona", () => {
    const input: TaxYearInput = {
      taxYear: 2025,
      filingStatus: "single",
      wages: 0,
      selfEmploymentIncome: 120000,
      interestIncome: 0,
      dividendIncome: 0,
      capitalGainsShort: 0,
      capitalGainsLong: 0,
      otherIncome: 0,
      adjustments: 0,
      dependents: 0,
      retirementContributions: 0,
      hsaContributions: 0,
    };
    const strategies = suggestStrategies(
      {
        householdId: "hh-1",
        persona: "business_owner",
        filingStatus: "single",
        state: "TX",
        dependents: 0,
        taxInput: input,
      },
      rules
    );
    expect(strategies.some((s) => s.id === "qbi-review")).toBe(true);
  });
});
