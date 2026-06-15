export { estimateFederalTax, computeTaxOnIncome } from "./estimate.js";
export { suggestStrategies } from "./strategies.js";
export { loadRulePack, loadRulePackFromPath, getDefaultRulesPath, resolveSupportedTaxYear } from "./rulePack.js";
export type { SupportedTaxYear } from "./rulePack.js";
export type { TaxRulePack, HouseholdContext, TaxBracket } from "./types.js";
