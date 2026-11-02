import { CalculationHistoryItem, SavedCustomFormula } from "./types";

const HISTORY_KEY = "econobrutal_history_v1";
const FORMULAS_KEY = "econobrutal_formulas_v1";

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
  const updated = [nextItem, ...current].slice(0, 30);
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
  defaultValues: Record<string, number>
): SavedCustomFormula[] {
  if (typeof window === "undefined") return [];
  const current = getSavedCustomFormulas();
  const nextFormula: SavedCustomFormula = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || "Rumus Kustom",
    formula: formula.trim(),
    defaultValues,
    createdAt: new Date().toLocaleDateString("id-ID"),
  };
  const updated = [nextFormula, ...current].slice(0, 20);
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

