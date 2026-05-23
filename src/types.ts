import type { FilingStatus, Persona, TaxEstimate, TaxYearInput, Strategy } from "@portfolio/contracts";

export interface TaxBracket {
  upTo: number | null;
  rate: number;
}

export interface TaxRulePack {
  taxYear: number;
  source: string;
  standardDeduction: Record<FilingStatus, number>;
  brackets: Record<FilingStatus, TaxBracket[]>;
  capitalGainsRates?: Partial<Record<FilingStatus, TaxBracket[]>>;
  childTaxCredit?: number;
  retirement401kLimit?: number;
  hsaFamilyLimit?: number;
  hsaSingleLimit?: number;
}

export interface HouseholdContext {
  householdId: string;
  persona: Persona;
  filingStatus: FilingStatus;
  state: string;
  dependents: number;
  taxInput: TaxYearInput;
}

export type { TaxEstimate, TaxYearInput, Strategy };
