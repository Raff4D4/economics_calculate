export type AppTab = "scientific" | "valuation" | "capital" | "presets";

export type NeoColor =
  | "yellow"
  | "mint"
  | "coral"
  | "lilac"
  | "sky"
  | "orange"
  | "white";

export type PresetCategory =
  | "Semua"
  | "Cari Modal & Untung"
  | "UMKM & F&B"
  | "Valuasi & Investor"
  | "Bank & Tabungan"
  | "Makro & Mikro";

export interface FormulaToken {
  type: "variable" | "operator" | "text";
  value: string;
}

export interface VariableMeta {
  symbol: string;
  label: string;
  placeholder: string;
  defaultRaw: string;
  unitHint: string;
  helperText: string;
}

export interface EconomicPreset {
  id: string;
  category: Exclude<PresetCategory, "Semua">;
  title: string;
  badge: string;
  formula: string;
  simpleExplanation: string;
  defaultTarget: string;
  variables: VariableMeta[];
}

export interface SolvedFormulaOutput {
  isValid: boolean;
  rawFormula: string;
  lhsVariable: string;
  rhsExpression: string;
  allVariables: string[];
  targetVariable: string;
  numericMap: Record<string, number>;
  substitutedText: string;
  result: number | null;
  error: string | null;
}

export interface CalculationHistoryItem {
  id: string;
  timestamp: string;
  module: AppTab;
  title: string;
  formula: string;
  substituted: string;
  variables: Record<string, number>;
  resultFormatted: string;
  rawResult: number;
}

export interface SavedCustomFormula {
  id: string;
  name: string;
  formula: string;
  rawInputs: Record<string, string>;
  targetVariable: string;
  createdAt: string;
}
