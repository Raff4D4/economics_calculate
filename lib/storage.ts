import { CalculationHistoryItem, SavedCustomFormula } from "./types";

const HISTORY_KEY = "econobrutal_v2_history";
const FORMULAS_KEY = "econobrutal_v2_formulas";

export function getSavedHistory(): CalculationHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CalculationHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(
  item: Omit<CalculationHistoryItem, "id" | "timestamp">
): CalculationHistoryItem[] {
  if (typeof window === "undefined") return [];
  const current = getSavedHistory();
  const nextItem: CalculationHistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  const updated = [nextItem, ...current].slice(0, 35);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    return current;
  }
  return updated;
}

export function clearSavedHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
}

export function getSavedCustomFormulas(): SavedCustomFormula[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FORMULAS_KEY);
    return raw ? (JSON.parse(raw) as SavedCustomFormula[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomFormula(
  name: string,
  formula: string,
  rawInputs: Record<string, string>,
  targetVariable: string
): SavedCustomFormula[] {
  if (typeof window === "undefined") return [];
  const current = getSavedCustomFormulas();
  const nextFormula: SavedCustomFormula = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || "Rumus Tersimpan",
    formula: formula.trim(),
    rawInputs: { ...rawInputs },
    targetVariable,
    createdAt: new Date().toLocaleDateString("id-ID"),
  };
  const updated = [nextFormula, ...current].slice(0, 25);
  try {
    window.localStorage.setItem(FORMULAS_KEY, JSON.stringify(updated));
  } catch {
    return current;
  }
  return updated;
}

export function deleteCustomFormula(id: string): SavedCustomFormula[] {
  if (typeof window === "undefined") return [];
  const updated = getSavedCustomFormulas().filter((item) => item.id !== id);
  try {
    window.localStorage.setItem(FORMULAS_KEY, JSON.stringify(updated));
  } catch {
    return [];
  }
  return updated;
}
