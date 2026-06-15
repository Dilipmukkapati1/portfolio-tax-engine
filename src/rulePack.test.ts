import { describe, it, expect } from "vitest";
import { loadRulePack, resolveSupportedTaxYear } from "./rulePack.js";

describe("loadRulePack", () => {
  it("loads 2026 brackets and limits", () => {
    const rules = loadRulePack(2026);
    expect(rules.taxYear).toBe(2026);
    expect(rules.standardDeduction.married_filing_jointly).toBe(32200);
    expect(rules.retirement401kLimit).toBe(24500);
    expect(rules.hsaFamilyLimit).toBe(8750);
    expect(rules.hsaSingleLimit).toBe(4400);
  });

  it("uses 2026 rules for future years until a newer pack exists", () => {
    expect(resolveSupportedTaxYear(2027)).toBe(2026);
    expect(loadRulePack(2027).taxYear).toBe(2026);
  });

  it("uses 2025 rules for 2025", () => {
    const rules = loadRulePack(2025);
    expect(rules.taxYear).toBe(2025);
    expect(rules.standardDeduction.married_filing_jointly).toBe(30000);
    expect(rules.retirement401kLimit).toBe(23500);
  });
});
