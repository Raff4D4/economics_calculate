"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Sparkles,
  Edit3,
  Bookmark,
  Trash2,
} from "lucide-react";
import { ECONOMIC_PRESETS } from "@/lib/engine/presets";
import {
  solveFormulaWithTarget,
  tokenizeFormulaForDisplay,
} from "@/lib/engine/parser";
import {
  formatSmartPreview,
  parseSmartInput,
} from "@/lib/formatters";
import {
  CalculationHistoryItem,
  EconomicPreset,
  SavedCustomFormula,
} from "@/lib/types";
import {
  getSavedCustomFormulas,
  saveCustomFormula,
  deleteCustomFormula,
} from "@/lib/storage";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoReceipt } from "@/components/ui/NeoReceipt";
import { MobileFormulaPad } from "@/components/keypad/MobileFormulaPad";

interface ScientificSlotModuleProps {
  selectedPreset: EconomicPreset;
  onSelectPreset: (preset: EconomicPreset) => void;
  onSaveHistory: (item: Omit<CalculationHistoryItem, "id" | "timestamp">) => void;
}

export function ScientificSlotModule({
  selectedPreset,
  onSelectPreset,
  onSaveHistory,
}: ScientificSlotModuleProps) {
  const [formulaText, setFormulaText] = useState<string>(selectedPreset.formula);
  const [rawInputs, setRawInputs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const v of selectedPreset.variables) {
      map[v.symbol] = v.defaultRaw;
    }
    return map;
  });
  const [targetVar, setTargetVar] = useState<string>(
    selectedPreset.defaultTarget
  );
  const [focusedVar, setFocusedVar] = useState<string>("");
  const [isEditingFormula, setIsEditingFormula] = useState<boolean>(false);
  const [showHelperPad, setShowHelperPad] = useState<boolean>(true);
  const [customFormulaName, setCustomFormulaName] = useState<string>("");
  const [savedFormulas, setSavedFormulas] = useState<SavedCustomFormula[]>([]);

  useEffect(() => {
    setSavedFormulas(getSavedCustomFormulas());
  }, []);

  useEffect(() => {
    setFormulaText(selectedPreset.formula);
    const nextInputs: Record<string, string> = {};
    for (const v of selectedPreset.variables) {
      nextInputs[v.symbol] = v.defaultRaw;
    }
    setRawInputs(nextInputs);
    setTargetVar(selectedPreset.defaultTarget);
    const firstInputVar = selectedPreset.variables.find(
      (v) => v.symbol !== selectedPreset.defaultTarget
    );
    setFocusedVar(firstInputVar ? firstInputVar.symbol : "");
  }, [selectedPreset]);

  const solved = solveFormulaWithTarget(formulaText, rawInputs, targetVar);
  const formulaTokens = tokenizeFormulaForDisplay(formulaText);

  useEffect(() => {
    if (solved.allVariables.length > 0) {
      setRawInputs((prev) => {
        const updated: Record<string, string> = { ...prev };
        let changed = false;
        for (const sym of solved.allVariables) {
          if (updated[sym] === undefined) {
            updated[sym] = sym === "i" || sym === "Persen" ? "10%" : "20jt";
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
      if (!solved.allVariables.includes(targetVar)) {
        setTargetVar(solved.allVariables[0]);
      }
    }
  }, [solved.allVariables, targetVar]);

  const handleSlotChange = (symbol: string, value: string) => {
    setRawInputs((prev) => ({
      ...prev,
      [symbol]: value,
    }));
  };

  const handleSelectTarget = (symbol: string) => {
    if ( solved.result !== null && Number.isFinite(solved.result) ) {
      setRawInputs((prev) => ({
        ...prev,
        [targetVar]: String(Math.round(solved.result! * 10000) / 10000),
      }));
    }
    setTargetVar(symbol);
    const otherVar = solved.allVariables.find((v) => v !== symbol);
    if (otherVar) {
      setFocusedVar(otherVar);
    }
  };

  const handlePadInsert = (token: string) => {
    if (isEditingFormula) {
      setFormulaText((prev) => `${prev}${token}`);
      return;
    }
    const activeSym =
      focusedVar && focusedVar !== targetVar
        ? focusedVar
        : solved.allVariables.find((v) => v !== targetVar) || "";
    if (!activeSym) return;
    setRawInputs((prev) => ({
      ...prev,
      [activeSym]: `${prev[activeSym] || ""}${token}`,
    }));
  };

  const handlePadBackspace = () => {
    if (isEditingFormula) {
      setFormulaText((prev) => prev.slice(0, -1));
      return;
    }
    const activeSym =
      focusedVar && focusedVar !== targetVar
        ? focusedVar
        : solved.allVariables.find((v) => v !== targetVar) || "";
    if (!activeSym) return;
    setRawInputs((prev) => ({
      ...prev,
      [activeSym]: (prev[activeSym] || "").slice(0, -1),
    }));
  };

  const handlePadClear = () => {
    if (isEditingFormula) {
      setFormulaText("");
      return;
    }
    const activeSym =
      focusedVar && focusedVar !== targetVar
        ? focusedVar
        : solved.allVariables.find((v) => v !== targetVar) || "";
    if (!activeSym) return;
    setRawInputs((prev) => ({
      ...prev,
      [activeSym]: "",
    }));
  };

  const handleSaveCustom = () => {
    if (!solved.isValid) return;
    const nextList = saveCustomFormula(
      customFormulaName || `Rumus ${solved.targetVariable}`,
      formulaText,
      rawInputs,
      targetVar
    );
    setSavedFormulas(nextList);
    setCustomFormulaName("");
  };

  const getVariableMeta = (symbol: string) => {
    return selectedPreset.variables.find((v) => v.symbol === symbol);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase text-neo-muted">
            PILIH PRESET RUMUS CEPAT (GESER):
          </span>
          <span className="text-[11px] font-mono font-bold bg-neo-mint border border-neo-black rounded px-2 py-0.5">
            BISA KETIK 20jt / 10% / 10thn
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5">
          {ECONOMIC_PRESETS.slice(0, 8).map((preset) => {
            const isSelected = preset.id === selectedPreset.id && formulaText === preset.formula;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectPreset(preset);
                  setIsEditingFormula(false);
                }}
                className={`px-3 py-2 rounded-lg border-2 border-neo-black text-left shrink-0 transition-all ${
                  isSelected
                    ? "bg-neo-yellow shadow-none translate-x-[1px] translate-y-[1px]"
                    : "bg-neo-surface shadow-neo-sm"
                }`}
              >
                <span className="text-[10px] font-mono font-bold uppercase bg-neo-bg border border-neo-black rounded px-1.5 py-0.5">
                  {preset.badge}
                </span>
                <p className="font-bold text-xs mt-1">{preset.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      <section className="bg-neo-lcd border-2 border-neo-black rounded-xl shadow-neo p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b-2 border-neo-black/20 pb-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase bg-neo-surface border border-neo-black rounded px-2 py-0.5">
              SCIENTIFIC LCD INTERACTIVE FORMULA
            </span>
            <h2 className="font-bold text-sm mt-1">{selectedPreset.title}</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingFormula((prev) => !prev)}
            className="min-h-[38px] px-3 bg-neo-surface border-2 border-neo-black rounded-lg font-mono text-xs font-bold shadow-neo-sm flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingFormula ? "Selesai Edit" : "Ubah Rumus"}</span>
          </button>
        </div>

        <p className="text-xs font-medium text-neo-black/80 leading-relaxed">
          {selectedPreset.simpleExplanation}
        </p>

        {isEditingFormula ? (
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase">
              KETIK RUMUS BEBAS (CONTOH: M = i * (P - 1)):
            </label>
            <input
              type="text"
              value={formulaText}
              onChange={(e) => setFormulaText(e.target.value)}
              placeholder="Contoh: Untung = Modal * Persen"
              className="w-full min-h-[48px] bg-neo-surface border-2 border-neo-black rounded-lg px-3 py-2 font-mono text-sm font-bold shadow-neo-sm focus:outline-none"
            />
          </div>
        ) : (
          <div className="bg-neo-surface/90 border-2 border-neo-black rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-neo-muted">
                KETIK ANGKA LANGSUNG DI KOTAK RUMUS DI BAWAH INI:
              </span>
              <span className="text-[10px] font-mono font-bold text-neo-black">
                [?] = Variabel yang Dicari
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 py-1">
              {formulaTokens.map((token, idx) => {
                if (token.type !== "variable") {
                  return (
                    <span
                      key={`${token.value}-${idx}`}
                      className="font-mono text-base sm:text-lg font-bold px-1"
                    >
                      {token.value}
                    </span>
                  );
                }

                const sym = token.value;
                const isTarget = sym === targetVar;

                if (isTarget) {
                  return (
                    <div
                      key={`${sym}-${idx}`}
                      className="bg-neo-mint border-2 border-neo-black rounded-lg px-2.5 py-1.5 shadow-neo-sm inline-flex items-center gap-1.5"
                    >
                      <span className="text-[10px] font-mono font-bold bg-neo-surface border border-neo-black rounded px-1">
                        ? {sym}
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold">
                        {solved.isValid && solved.result !== null
                          ? formatSmartPreview(solved.result)
                          : "..."}
                      </span>
                    </div>
                  );
                }

                const currentRaw = rawInputs[sym] ?? "";

                return (
                  <div
                    key={`${sym}-${idx}`}
                    className={`inline-flex items-center border-2 border-neo-black rounded-lg overflow-hidden shadow-neo-sm ${
                      focusedVar === sym ? "bg-neo-yellow" : "bg-neo-surface"
                    }`}
                  >
                    <button
                      type="button"
                      title={`Klik untuk mencari nilai ${sym}`}
                      onClick={() => handleSelectTarget(sym)}
                      className="bg-neo-lilac border-r-2 border-neo-black px-2 py-1.5 text-[11px] font-mono font-bold hover:bg-neo-yellow transition-colors"
                    >
                      {sym}
                    </button>
                    <input
                      type="text"
                      value={currentRaw}
                      onFocus={() => {
                        setFocusedVar(sym);
                        setIsEditingFormula(false);
                      }}
                      onChange={(e) => handleSlotChange(sym, e.target.value)}
                      placeholder={sym}
                      aria-label={`Input nilai ${sym}`}
                      style={{
                        width: `${Math.max(5, (currentRaw.length || 3) + 2)}ch`,
                      }}
                      className="bg-transparent px-2 py-1.5 font-mono text-sm font-bold focus:outline-none text-center"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-neo-surface border-2 border-neo-black rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">
                MENCARI NILAI: {targetVar}
              </span>
            </div>
            <p className="text-xs text-neo-muted mt-0.5">
              {solved.isValid
                ? `Substitusi: ${solved.substitutedText}`
                : solved.error}
            </p>
          </div>
          <div className="bg-neo-mint border-2 border-neo-black rounded-lg px-3.5 py-2 text-right shrink-0">
            <p className="text-[10px] font-mono font-bold uppercase">
              HASIL {targetVar}
            </p>
            <p className="font-mono text-lg sm:text-xl font-bold">
              {solved.isValid && solved.result !== null
                ? formatSmartPreview(solved.result)
                : "---"}
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase">
          PILIH VARIABEL YANG INGIN DICARI (?):
        </span>
        <button
          type="button"
          onClick={() => setShowHelperPad((prev) => !prev)}
          className="text-xs font-mono font-bold underline"
        >
          {showHelperPad ? "Sembunyikan Keypad" : "Tampilkan Keypad"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {solved.allVariables.map((sym) => {
          const isTarget = sym === targetVar;
          const meta = getVariableMeta(sym);
          return (
            <button
              key={sym}
              type="button"
              onClick={() => handleSelectTarget(sym)}
              className={`min-h-[42px] px-3 py-1.5 rounded-lg border-2 border-neo-black font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                isTarget
                  ? "bg-neo-mint shadow-none translate-x-[1px] translate-y-[1px]"
                  : "bg-neo-surface shadow-neo-sm"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                Cari {sym} {meta ? `(${meta.label})` : ""}
              </span>
            </button>
          );
        })}
      </div>

      {showHelperPad && (
        <MobileFormulaPad
          mode={isEditingFormula ? "formula" : "value"}
          activeLabel={focusedVar || targetVar}
          onInsert={handlePadInsert}
          onBackspace={handlePadBackspace}
          onClear={handlePadClear}
        />
      )}

      <NeoCard
        title="Detail Angka & Penjelasan Variabel"
        subtitle="Ketik langsung pakai singkatan seperti 20jt, 500rb, 1.5m, 10%, atau 10thn"
        badge="INPUT MUDAH"
        accent="yellow"
      >
        <div className="space-y-3">
          {solved.allVariables.map((sym) => {
            const isTarget = sym === targetVar;
            const meta = getVariableMeta(sym);
            const rawVal = rawInputs[sym] ?? "";
            const parsedInfo = parseSmartInput(rawVal);

            if (isTarget) {
              return (
                <div
                  key={sym}
                  className="p-3 bg-neo-mint/40 border-2 border-neo-black rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase bg-neo-mint border border-neo-black rounded px-2 py-0.5">
                      SEDANG DICARI (?)
                    </span>
                    <p className="font-bold text-sm mt-1">
                      {sym} — {meta ? meta.label : `Variabel ${sym}`}
                    </p>
                  </div>
                  <div className="text-right font-mono font-bold text-base">
                    {solved.isValid && solved.result !== null
                      ? formatSmartPreview(solved.result)
                      : "---"}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={sym}
                className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span className="bg-neo-lilac border border-neo-black rounded px-1.5 py-0.5 font-mono text-xs">
                        {sym}
                      </span>
                      <span>{meta ? meta.label : `Nilai ${sym}`}</span>
                    </label>
                    {meta && (
                      <p className="text-[11px] text-neo-muted mt-0.5">
                        {meta.helperText}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectTarget(sym)}
                    className="text-[11px] font-mono font-bold bg-neo-surface border border-neo-black rounded px-2 py-1 shadow-neo-sm shrink-0"
                  >
                    Jadikan Dicari (?)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rawVal}
                    onFocus={() => {
                      setFocusedVar(sym);
                      setIsEditingFormula(false);
                    }}
                    onChange={(e) => handleSlotChange(sym, e.target.value)}
                    placeholder={meta ? meta.placeholder : "Contoh: 20jt"}
                    className="w-full min-h-[46px] bg-neo-surface border-2 border-neo-black rounded-lg px-3 py-2 font-mono text-base font-bold shadow-neo-sm focus:outline-none focus:bg-neo-yellow/30"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neo-muted">
                    Terbaca sistem:{" "}
                    <strong className="text-neo-black">
                      {parsedInfo.displayBadge}
                    </strong>
                  </span>
                  <div className="flex gap-1">
                    {["10%", "500rb", "20jt", "100jt", "10thn"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSlotChange(sym, chip)}
                        className="bg-neo-surface border border-neo-black rounded px-1.5 py-0.5 text-[10px] font-bold"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </NeoCard>

      <NeoCard
        title="Simpan Rumus ke Koleksi HP"
        subtitle="Simpan rumus beserta angka defaultnya agar bisa dibuka lagi dalam 1 sentuhan"
        accent="white"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={customFormulaName}
              onChange={(e) => setCustomFormulaName(e.target.value)}
              placeholder="Beri nama (contoh: Hitungan Modal Outlet)"
              className="w-full min-h-[44px] bg-neo-bg border-2 border-neo-black rounded-lg px-3 py-1.5 text-xs font-bold"
            />
            <NeoButton
              variant="mint"
              size="sm"
              disabled={!solved.isValid}
              onClick={handleSaveCustom}
            >
              <Bookmark className="w-4 h-4" />
              <span>Simpan</span>
            </NeoButton>
          </div>

          {savedFormulas.length > 0 && (
            <div className="space-y-2">
              {savedFormulas.map((item) => (
                <div
                  key={item.id}
                  className="bg-neo-bg border-2 border-neo-black rounded-lg p-2.5 flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFormulaText(item.formula);
                      setRawInputs(item.rawInputs);
                      setTargetVar(item.targetVariable);
                    }}
                    className="text-left flex-1"
                  >
                    <p className="font-bold text-xs">{item.name}</p>
                    <p className="font-mono text-[11px] text-neo-muted break-all">
                      {item.formula} (Cari: {item.targetVariable})
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSavedFormulas(deleteCustomFormula(item.id))
                    }
                    className="p-2 bg-neo-coral border border-neo-black rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </NeoCard>

      {solved.isValid && solved.result !== null && (
        <NeoReceipt
          module="scientific"
          title={`${selectedPreset.title} (Cari ${targetVar})`}
          formula={formulaText}
          variables={solved.numericMap}
          substituted={solved.substitutedText}
          resultFormatted={formatSmartPreview(solved.result)}
          rawResult={solved.result}
          onSaveHistory={onSaveHistory}
        />
      )}
    </div>
  );
}
