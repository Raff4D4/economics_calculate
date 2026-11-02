"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

interface NeoInputProps {
  label: string;
  symbol?: string;
  value: number;
  onChange: (nextValue: number) => void;
  unit?: string;
  step?: number;
  helperText?: string;
}

export function NeoInput({
  label,
  symbol,
  value,
  onChange,
  unit,
  step = 1,
  helperText,
}: NeoInputProps) {
  const handleStep = (direction: -1 | 1) => {
    const next = Number((value + direction * step).toFixed(6));
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
          {symbol && (
            <span className="bg-neo-lilac border-2 border-neo-black px-1.5 py-0.5 font-mono text-xs shadow-neo-sm">
              {symbol}
            </span>
          )}
          <span>{label}</span>
        </label>
        {unit && (
          <span className="text-[11px] font-mono font-bold bg-neo-bg border-2 border-neo-black px-2 py-0.5">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-stretch gap-1.5">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            onChange(Number.isFinite(parsed) ? parsed : 0);
          }}
          className="w-full min-h-[48px] bg-neo-surface border-3 border-neo-black px-3 py-2 font-mono text-base font-bold shadow-neo-sm focus:outline-none focus:bg-neo-yellow/20"
        />
        <button
          type="button"
          aria-label="Kurangi nilai"
          onClick={() => handleStep(-1)}
          className="min-w-[48px] min-h-[48px] bg-neo-surface border-3 border-neo-black shadow-neo-sm flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <Minus className="w-4 h-4 stroke-[3]" />
        </button>
        <button
          type="button"
          aria-label="Tambah nilai"
          onClick={() => handleStep(1)}
          className="min-w-[48px] min-h-[48px] bg-neo-yellow border-3 border-neo-black shadow-neo-sm flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] font-medium text-neo-black/75">{helperText}</p>
      )}
    </div>
  );
}

