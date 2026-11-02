"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ECONOMIC_PRESETS } from "@/lib/engine/presets";
import { parseAndEvaluateFormula } from "@/lib/engine/parser";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoSlider } from "@/components/ui/NeoSlider";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoReceipt } from "@/components/ui/NeoReceipt";
import { CalculationHistoryItem, EconomicPreset } from "@/lib/types";
import { formatIDR, formatNumber, formatPercent } from "@/lib/formatters";

interface PresetModuleProps {
  onOpenInSandbox: (formula: string, values: Record<string, number>) => void;
  onSaveHistory: (item: Omit<CalculationHistoryItem, "id" | "timestamp">) => void;
}

const CATEGORIES = ["Semua", "Mikroekonomi", "Makroekonomi", "Perbankan"] as const;

export function PresetModule({
  onOpenInSandbox,
  onSaveHistory,
}: PresetModuleProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("Semua");
  const [activePresetId, setActivePresetId] = useState<string>(
    ECONOMIC_PRESETS[0].id
  );

  const [presetValues, setPresetValues] = useState<
    Record<string, Record<string, number>>
  >(() => {
    const initial: Record<string, Record<string, number>> = {};
    for (const preset of ECONOMIC_PRESETS) {
      initial[preset.id] = {};
      for (const v of preset.variables) {
        initial[preset.id][v.symbol] = v.defaultValue;
      }
    }
    return initial;
  });

  const filteredPresets =
    selectedCategory === "Semua"
      ? ECONOMIC_PRESETS
      : ECONOMIC_PRESETS.filter((p) => p.category === selectedCategory);

  const activePreset: EconomicPreset =
    ECONOMIC_PRESETS.find((p) => p.id === activePresetId) || ECONOMIC_PRESETS[0];

  const currentVars = presetValues[activePreset.id] || {};
  const evaluated = parseAndEvaluateFormula(activePreset.formula, currentVars);
  const numericResult = evaluated.result ?? 0;
  const interpretation = activePreset.interpret(numericResult, currentVars);

  const formatPresetResult = (val: number, unit: EconomicPreset["resultUnit"]) => {
    if (unit === "Rp") return formatIDR(val);
    if (unit === "%") return formatPercent(val, 2);
    if (unit === "unit") return `${formatNumber(val, 2)} Unit`;
    return formatNumber(val, 4);
  };

  const handleVarChange = (symbol: string, nextVal: number) => {
    setPresetValues((prev) => ({
      ...prev,
      [activePreset.id]: {
        ...(prev[activePreset.id] || {}),
        [symbol]: nextVal,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`min-h-[42px] px-3 py-1.5 border-3 border-neo-black font-bold text-xs uppercase shrink-0 transition-all ${
              selectedCategory === category
                ? "bg-neo-yellow shadow-none translate-x-[2px] translate-y-[2px]"
                : "bg-neo-surface shadow-neo-sm"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredPresets.map((preset) => {
          const isSelected = preset.id === activePreset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setActivePresetId(preset.id)}
              className={`p-3 border-3 border-neo-black text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-neo-sky shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-neo-surface shadow-neo-sm"
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase bg-neo-surface border-2 border-neo-black px-1.5 py-0.5">
                  {preset.category}
                </span>
                <p className="font-bold text-xs mt-1.5 leading-snug">
                  {preset.title}
                </p>
              </div>
              <p className="font-mono text-[10px] font-bold mt-2 truncate bg-neo-bg border border-neo-black px-1.5 py-0.5">
                {preset.formula}
              </p>
            </button>
          );
        })}
      </div>

      <NeoCard
        title={activePreset.title}
        subtitle={activePreset.description}
        badge={activePreset.shortCode}
        accent="sky"
      >
        <div className="space-y-4">
          <div className="bg-neo-bg border-2 border-neo-black p-2.5 flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold break-all">
              {activePreset.formula}
            </span>
            <NeoButton
              variant="lilac"
              size="sm"
              onClick={() => onOpenInSandbox(activePreset.formula, currentVars)}
            >
              <span>Edit Rumus</span>
              <ArrowUpRight className="w-4 h-4" />
            </NeoButton>
          </div>

          {activePreset.variables.map((variable) => {
            const val = currentVars[variable.symbol] ?? variable.defaultValue;
            return (
              <div
                key={variable.symbol}
                className="p-3 bg-neo-bg border-2 border-neo-black space-y-2"
              >
                <NeoInput
                  label={variable.label}
                  symbol={variable.symbol}
                  unit={variable.unit}
                  step={variable.step}
                  value={val}
                  onChange={(next) => handleVarChange(variable.symbol, next)}
                  helperText={variable.description}
                />
                <NeoSlider
                  min={variable.min}
                  max={variable.max}
                  step={variable.step}
                  value={val}
                  onChange={(next) => handleVarChange(variable.symbol, next)}
                />
              </div>
            );
          })}
        </div>
      </NeoCard>

      <NeoCard
        title={interpretation.status}
        accent={interpretation.color}
        badge="INTERPRETASI EKONOMI"
      >
        <div className="space-y-2">
          <div className="flex items-baseline justify-between border-b-2 border-neo-black pb-2">
            <span className="text-xs font-bold uppercase">
              NILAI {evaluated.targetVariable}:
            </span>
            <span className="font-mono text-2xl font-bold">
              {formatPresetResult(numericResult, activePreset.resultUnit)}
            </span>
          </div>
          <p className="text-xs font-medium leading-relaxed">
            {interpretation.summary}
          </p>
        </div>
      </NeoCard>

      <NeoReceipt
        module="presets"
        title={activePreset.title}
        formula={activePreset.formula}
        variables={currentVars}
        substituted={evaluated.substitutedExpression || activePreset.formula}
        resultFormatted={formatPresetResult(numericResult, activePreset.resultUnit)}
        rawResult={numericResult}
        onSaveHistory={onSaveHistory}
      />
    </div>
  );
}

