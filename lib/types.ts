export type AppTab = "ledger" | "invest" | "presets" | "sandbox";

export type NeoColor = "yellow" | "mint" | "coral" | "lilac" | "sky" | "orange" | "white";

export interface VariableMeta {
  symbol: string;
  label: string;
  unit?: "Rp" | "%" | "x" | "unit" | "tahun" | "bulan" | "angka";
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  description?: string;
}

export interface EconomicPreset {
  id: string;
  category: "Mikroekonomi" | "Makroekonomi" | "Perbankan";
  title: string;
  shortCode: string;
  formula: string;
  description: string;
  resultUnit: "Rp" | "%" | "x" | "unit" | "angka";
  variables: VariableMeta[];
  interpret: (result: number, vars: Record<string, number>) => {
    status: string;
    color: NeoColor;
    summary: string;
  };
}

export interface ParsedFormulaOutput {
  isValid: boolean;
  rawFormula: string;
  targetVariable: string;
  expression: string;
  variables: string[];
  substitutedExpression: string;
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
  defaultValues: Record<string, number>;
  createdAt: string;
}

