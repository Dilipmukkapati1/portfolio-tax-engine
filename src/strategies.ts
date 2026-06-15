import type { Strategy } from "@portfolio/contracts";
import { prepareTaxInputForEstimate } from "@portfolio/contracts";
import { estimateFederalTax } from "./estimate.js";
import type { HouseholdContext, TaxRulePack } from "./types.js";

export function suggestStrategies(
  ctx: HouseholdContext,
  rules: TaxRulePack
): Strategy[] {
  const strategies: Strategy[] = [];
  const base = estimateFederalTax(prepareTaxInputForEstimate(ctx.taxInput), rules);

  if (ctx.persona === "w2_employee" || ctx.persona === "family_with_kids") {
    const limit = rules.retirement401kLimit ?? 23500;
    if (ctx.taxInput.retirementContributions < limit) {
      const room = limit - ctx.taxInput.retirementContributions;
      const withContrib = estimateFederalTax(
        prepareTaxInputForEstimate({
          ...ctx.taxInput,
          retirementContributions:
            ctx.taxInput.retirementContributions + Math.min(room, 10000),
        }),
        rules
      );
      strategies.push({
        id: "max-401k",
        title: "Increase pre-tax 401(k) contributions",
        description: `You may have up to $${room.toLocaleString()} of additional 401(k) deferral room for ${rules.taxYear}.`,
        estimatedSavings: round2(base.federalTax - withContrib.federalTax),
        eligibility: "Eligible if employer plan allows deferrals",
        risks: "Reduces take-home pay; funds locked until distribution rules apply",
        missingData: ctx.taxInput.retirementContributions === 0 ? ["current_401k_ytd"] : undefined,
        priority: 1,
      });
    }
  }

  if (ctx.persona === "w2_employee" || ctx.persona === "family_with_kids") {
    const hsaLimit =
      ctx.taxInput.dependents > 0 || ctx.filingStatus === "married_filing_jointly"
        ? (rules.hsaFamilyLimit ?? 8550)
        : (rules.hsaSingleLimit ?? 4300);
    if (ctx.taxInput.hsaContributions < hsaLimit) {
      strategies.push({
        id: "max-hsa",
        title: "Fund HSA if eligible",
        description: `HSA contributions up to $${hsaLimit.toLocaleString()} may reduce taxable income with triple tax advantage when used for medical expenses.`,
        eligibility: "Requires HDHP coverage",
        risks: "Must maintain HDHP; non-qualified withdrawals penalized",
        priority: 2,
      });
    }
  }

  if (ctx.persona === "business_owner") {
    strategies.push({
      id: "qbi-review",
      title: "Review QBI deduction planning",
      description:
        "Schedule C or pass-through income may qualify for a 20% QBI deduction subject to taxable income limits and SSTB rules.",
      eligibility: "Self-employment or pass-through business income",
      risks: "Complex aggregation and wage/capital limits apply",
      missingData: ["business_income", "entity_type", "w2_wages_paid"],
      priority: 1,
    });
    strategies.push({
      id: "estimated-tax",
      title: "Quarterly estimated tax payments",
      description:
        "Self-employment income typically requires Form 1040-ES payments to avoid underpayment penalties.",
      eligibility: "Net self-employment tax liability expected",
      risks: "Underpayment penalties if safe harbor not met",
      priority: 2,
    });
  }

  if (ctx.persona === "low_income") {
    strategies.push({
      id: "eitc-aca",
      title: "Review EITC and ACA subsidy eligibility",
      description:
        "Lower AGI may increase Earned Income Credit or premium tax credit; coordinate income timing carefully.",
      eligibility: "Income within federal phase-out ranges",
      risks: "ACA cliff effects if income crosses subsidy thresholds",
      missingData: ["household_size", "aca_marketplace_enrollment"],
      priority: 1,
    });
  }

  if (ctx.persona === "family_with_kids" && ctx.dependents > 0) {
    const credit = rules.childTaxCredit ?? 2000;
    strategies.push({
      id: "ctc",
      title: "Child Tax Credit optimization",
      description: `Up to $${credit.toLocaleString()} per qualifying child may reduce tax liability; phase-outs apply at higher incomes.`,
      eligibility: `${ctx.dependents} dependent(s) claimed`,
      risks: "Phase-out and creditability rules apply",
      priority: 3,
    });
  }

  if (ctx.taxInput.capitalGainsLong > 0) {
    strategies.push({
      id: "tax-loss-harvest",
      title: "Tax-loss harvesting review",
      description:
        "Offset realized gains with losses where appropriate; watch wash-sale rules.",
      eligibility: "Taxable brokerage accounts",
      risks: "Wash-sale disallows loss if substantially identical security repurchased within 30 days",
      priority: 4,
    });
  }

  return strategies.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
