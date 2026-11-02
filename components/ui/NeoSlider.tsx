"use client";

import React, { useState } from "react";
import { formatNumber } from "@/lib/formatters";

interface NeoSliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  allowRangePreset?: boolean;
}

const SCALE_PRESETS = [
  { label: "Desimal (0-1)", min: 0, max: 1, step: 0.005 },
  { label: "Unit/Persen (0-100)", min: 0, max: 100, step: 1 },
  { label: "Ribuan (0-1Jt)", min: 0, max: 1000000, step: 10000 },
  { label: "Jutaan (0-100Jt)", min: 0, max: 100000000, step: 1000000 },
];

export function NeoSlider({
  value,
  min,
  max,
  step,
  onChange,
  allowRangePreset = false,
}: NeoSliderProps) {
  const [customRange, setCustomRange] = useState({ min, max, step });

  const activeMin = allowRangePreset ? customRange.min : min;
  const activeMax = allowRangePreset ? customRange.max : max;
  const activeStep = allowRangePreset ? customRange.step : step;

  const clampedValue = Math.min(Math.max(value, activeMin), activeMax);

  return (
    <div className="space-y-2 pt-1">
      <input
        type="range"
        className="neo-slider"
        min={activeMin}
        max={activeMax}
        step={activeStep}
        value={Number.isFinite(clampedValue) ? clampedValue : activeMin}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neo-black/75">
        <span>Min: {formatNumber(activeMin, 2)}</span>
        <span>Max: {formatNumber(activeMax, 2)}</span>
      </div>

      {allowRangePreset && (
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {SCALE_PRESETS.map((preset) => {
            const isSelected =
              customRange.max === preset.max && customRange.step === preset.step;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  setCustomRange({
                    min: preset.min,
                    max: preset.max,
                    step: preset.step,
                  })
                }
                className={`text-[11px] font-mono font-bold py-1.5 px-2 border-2 border-neo-black text-left transition-all ${
                  isSelected
                    ? "bg-neo-sky shadow-none translate-x-[1px] translate-y-[1px]"
                    : "bg-neo-bg shadow-neo-sm"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

