"use client";

import React, { useState, useEffect } from "react";
import {
  Keyboard,
  Sparkles,
  GitCompare,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { parseAndEvaluateFormula } from "@/lib/engine/parser";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoSlider } from "@/components/ui/NeoSlider";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoReceipt } from "@/components/ui/NeoReceipt";
import { MobileFormulaPad } from "@/components/keypad/MobileFormulaPad";
import { CalculationHistoryItem, SavedCustomFormula } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/formatters";
import {
  getSavedCustomFormulas,
  saveCustomFormula,
  deleteCustomFormula,
} from "@/lib/storage";

interface SandboxModuleProps {
  initialFormula?: string;
  initialValues?: Record<string, number>;
  onSaveHistory: (item: Omit<CalculationHistoryItem, "id" | "timestamp">) => void;
}

const QUICK_FORMULAS = [
  {
    label: "Contoh M = i * (P - 1)",
    formula: "M = i * (P - 1)",
    defaults: { i: 0.12, P: 5000000 },
  },
  {
    label: "Cicilan Anuitas",
    formula: "M = P * (i * (1 + i)^n) / ((1 + i)^n - 1)",
    defaults: { P: 100000000, i: 0.01, n: 36 },
  },
  {
    label: "Laba Bersih Bisnis",
    formula: "Laba = (Harga - Modal) * Unit - Operasional",
    defaults: { Harga: 75000, Modal: 42000, Unit: 1200, Operasional: 15000000 },
  },
  {
    label: "Compound Future Value",
    formula: "FV = PV * (1 + r)^t",
    defaults: { PV: 25000000, r: 0.08, t: 10 },
  },
];

export function SandboxModule({
  initialFormula,
  initialValues,
  onSaveHistory,
}: SandboxModuleProps) {
  const [formulaInput, setFormulaInput] = useState(
    initialFormula || "M = i * (P - 1)"
  );
  const [variableValues, setVariableValues] = useState<Record<string, number>>(
    initialValues || { i: 0.12, P: 5000000 }
  );
  const [showKeypad, setShowKeypad] = useState(true);
  const [scenarioA, setScenarioA] = useState<{
    result: number;
    vars: Record<string, number>;
  } | null>(null);
  const [customName, setCustomName] = useState("");
  const [savedFormulas, setSavedFormulas] = useState<SavedCustomFormula[]>([]);

  useEffect(() => {
    setSavedFormulas(getSavedCustomFormulas());
  }, []);

  useEffect(() => {
    if (initialFormula) {
      setFormulaInput(initialFormula);
    }
    if (initialValues && Object.keys(initialValues).length > 0) {
      setVariableValues(initialValues);
    }
  }, [initialFormula, initialValues]);

  const parsed = parseAndEvaluateFormula(formulaInput, variableValues);

  useEffect(() => {
    if (parsed.variables.length > 0) {
      setVariableValues((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const sym of parsed.variables) {
          if (typeof next[sym] !== "number" || !Number.isFinite(next[sym])) {
            next[sym] = sym === "i" || sym === "r" ? 0.08 : 100;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [parsed.variables]);

  const handleInsertToken = (token: string) => {
    setFormulaInput((prev) => `${prev}${token}`);
  };

  const handleBackspace = () => {
    setFormulaInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setFormulaInput("");
  };

  const handleSaveCustomFormula = () => {
    if (!parsed.isValid) return;
    const updated = saveCustomFormula(
      customName || `Rumus ${parsed.targetVariable}`,
      formulaInput,
      variableValues
    );
    setSavedFormulas(updated);
    setCustomName("");
  };

  const handleDeleteCustom = (id: string) => {
    setSavedFormulas(deleteCustomFormula(id));
  };

  const currentResult = parsed.result ?? 0;
  const deltaNominal = scenarioA ? currentResult - scenarioA.result : 0;
  const deltaPercent =
    scenarioA && scenarioA.result !== 0
      ? (deltaNominal / Math.abs(scenarioA.result)) * 100
      : 0;

  return (
    <div className="space-y-4">
      <NeoCard
        title="Dynamic Formula Sandbox"
        subtitle="Ketik rumus ekonomi apa saja, variabel & slider dibuat otomatis"
        badge="CUSTOM ENGINE"
        accent="lilac"
      >
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-bold uppercase mb-1.5">
              TEMPLATE RUMUS DINAMIS (SENTUH UNTUK MUAT):
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {QUICK_FORMULAS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setFormulaInput(item.formula);
                    setVariableValues(item.defaults);
                    setScenarioA(null);
                  }}
                  className="bg-neo-bg border-2 border-neo-black px-2.5 py-1.5 text-xs font-mono font-bold shrink-0 shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>MASUKKAN RUMUS EKONOMI LANGSUNG:</span>
              </label>
              <button
                type="button"
                onClick={() => setShowKeypad((prev) => !prev)}
                className="text-xs font-mono font-bold bg-neo-yellow border-2 border-neo-black px-2 py-1 shadow-neo-sm flex items-center gap-1"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>{showKeypad ? "Tutup Keypad" : "Buka Keypad"}</span>
              </button>
            </div>

            <input
              type="text"
              value={formulaInput}
              onChange={(e) => setFormulaInput(e.target.value)}
              placeholder="Contoh: M = i * (P - 1)"
              className="w-full min-h-[52px] bg-neo-surface border-3 border-neo-black px-3 py-2 font-mono text-base font-bold shadow-neo-sm focus:outline-none focus:bg-neo-yellow/20"
            />

            <div
              className={`border-2 border-neo-black px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-2 ${
                parsed.isValid ? "bg-neo-mint" : "bg-neo-coral"
              }`}
            >
              {parsed.isValid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    VALID: {parsed.variables.length} Variabel Terdeteksi (
                    {parsed.variables.join(", ") || "Konstanta"})
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{parsed.error}</span>
                </>
              )}
            </div>
          </div>

          {showKeypad && (
            <MobileFormulaPad
              onInsert={handleInsertToken}
              onBackspace={handleBackspace}
              onClear={handleClear}
            />
          )}
        </div>
      </NeoCard>

      {parsed.variables.length > 0 && (
        <NeoCard
          title="Kontrol Variabel Otomatis"
          subtitle="Ubah angka atau geser slider untuk melihat perubahan hasil real-time"
          badge={`${parsed.variables.length} VARIABEL`}
          accent="yellow"
        >
          <div className="space-y-4">
            {parsed.variables.map((symbol) => {
              const currentVal = variableValues[symbol] ?? 0;
              const defaultStep =
                Math.abs(currentVal) > 0 && Math.abs(currentVal) < 1 ? 0.01 : 1;
              const defaultMax =
                Math.abs(currentVal) <= 1
                  ? 1
                  : Math.abs(currentVal) <= 100
                  ? 100
                  : Math.max(10000000, Math.abs(currentVal) * 2);

              return (
                <div
                  key={symbol}
                  className="p-3 bg-neo-bg border-2 border-neo-black space-y-2.5"
                >
                  <NeoInput
                    label={`Variabel ${symbol}`}
                    symbol={symbol}
                    value={currentVal}
                    step={defaultStep}
                    onChange={(val) =>
                      setVariableValues((prev) => ({ ...prev, [symbol]: val }))
                    }
                  />
                  <NeoSlider
                    min={0}
                    max={defaultMax}
                    step={defaultStep}
                    value={currentVal}
                    allowRangePreset={true}
                    onChange={(val) =>
                      setVariableValues((prev) => ({ ...prev, [symbol]: val }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </NeoCard>
      )}

      <div className="bg-neo-mint border-3 border-neo-black shadow-neo p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase bg-neo-surface border-2 border-neo-black px-2 py-0.5">
            OUTPUT REAL-TIME
          </span>
          <NeoButton
            variant="sky"
            size="sm"
            onClick={() =>
              setScenarioA(
                scenarioA
                  ? null
                  : { result: currentResult, vars: { ...variableValues } }
              )
            }
          >
            <GitCompare className="w-4 h-4" />
            <span>
              {scenarioA ? "Reset Komparasi" : "Kunci Skenario A"}
            </span>
          </NeoButton>
        </div>

        <div className="flex items-baseline justify-between gap-2 break-all">
          <span className="font-mono text-lg font-bold">
            {parsed.targetVariable} =
          </span>
          <span className="font-mono text-3xl font-bold">
            {parsed.isValid ? formatNumber(currentResult, 4) : "---"}
          </span>
        </div>

        {scenarioA && parsed.isValid && (
          <div className="bg-neo-surface border-2 border-neo-black p-3 space-y-1.5 font-mono text-xs">
            <p className="font-bold uppercase text-neo-black/70">
              KOMPARASI WHAT-IF (SKENARIO A VS SAAT INI):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px]">SKENARIO A (TERKUNCI):</p>
                <p className="font-bold text-sm">
                  {formatNumber(scenarioA.result, 4)}
                </p>
              </div>
              <div>
                <p className="text-[10px]">SELISIH PERUBAHAN:</p>
                <p
                  className={`font-bold text-sm ${
                    deltaNominal >= 0 ? "text-neo-black" : "text-neo-coral"
                  }`}
                >
                  {deltaNominal >= 0 ? "+" : ""}
                  {formatNumber(deltaNominal, 4)} ({formatPercent(deltaPercent, 1)})
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <NeoCard
        title="Koleksi Rumus Kustom Saya"
        subtitle="Simpan rumus buatanmu di memori HP agar siap dipakai kapan saja"
        accent="white"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nama rumus (misal: Rumus Kredit Motor)"
              className="w-full min-h-[46px] bg-neo-bg border-3 border-neo-black px-3 py-1.5 text-xs font-bold"
            />
            <NeoButton
              variant="yellow"
              size="sm"
              disabled={!parsed.isValid}
              onClick={handleSaveCustomFormula}
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </NeoButton>
          </div>

          {savedFormulas.length > 0 && (
            <div className="space-y-2 pt-1">
              {savedFormulas.map((item) => (
                <div
                  key={item.id}
                  className="bg-neo-bg border-2 border-neo-black p-2.5 flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFormulaInput(item.formula);
                      setVariableValues(item.defaultValues);
                    }}
                    className="text-left flex-1"
                  >
                    <p className="font-bold text-xs">{item.name}</p>
                    <p className="font-mono text-[11px] text-neo-black/80 break-all">
                      {item.formula}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustom(item.id)}
                    aria-label="Hapus rumus"
                    className="p-2 bg-neo-coral border-2 border-neo-black"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </NeoCard>

      {parsed.isValid && (
        <NeoReceipt
          module="sandbox"
          title={`Rumus Kustom (${parsed.targetVariable})`}
          formula={formulaInput}
          variables={variableValues}
          substituted={parsed.substitutedExpression}
          resultFormatted={formatNumber(currentResult, 4)}
          rawResult={currentResult}
          onSaveHistory={onSaveHistory}
        />
      )}
    </div>
  );
}

