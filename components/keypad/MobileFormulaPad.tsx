"use client";

import React from "react";
import { Delete, RotateCcw } from "lucide-react";

interface MobileFormulaPadProps {
  mode: "value" | "formula";
  activeLabel?: string;
  onInsert: (token: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const SHORTHAND_UNITS: Array<{ label: string; token: string; desc: string }> = [
  { label: "rb (Ribu)", token: "rb", desc: "x1.000" },
  { label: "jt (Juta)", token: "jt", desc: "x1 Juta" },
  { label: "m (Miliar)", token: "m", desc: "x1 Miliar" },
  { label: "% (Persen)", token: "%", desc: "Persen" },
  { label: "thn (Tahun)", token: "thn", desc: "Durasi" },
  { label: "bln (Bulan)", token: "bln", desc: "Tenor" },
];

const QUICK_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00", "."];

const FORMULA_OPERATORS = ["(", ")", "*", "/", "+", "-", "^", "="];

export function MobileFormulaPad({
  mode,
  activeLabel,
  onInsert,
  onBackspace,
  onClear,
}: MobileFormulaPadProps) {
  return (
    <div className="bg-neo-bg border-2 border-neo-black rounded-xl shadow-neo-sm p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold bg-neo-yellow border border-neo-black rounded px-2 py-0.5">
          {mode === "value"
            ? `KEYPAD SINGKATAN: ${activeLabel || "INPUT"}`
            : "KEYPAD PENULIS RUMUS"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBackspace}
            className="min-h-[34px] px-2.5 bg-neo-orange border border-neo-black rounded font-mono text-xs font-bold flex items-center gap-1 active:translate-y-[1px]"
          >
            <Delete className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className="min-h-[34px] px-2.5 bg-neo-coral border border-neo-black rounded font-mono text-xs font-bold flex items-center gap-1 active:translate-y-[1px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {SHORTHAND_UNITS.map((unit) => (
          <button
            key={unit.token}
            type="button"
            onClick={() => onInsert(unit.token)}
            className="min-h-[42px] bg-neo-mint/70 border-2 border-neo-black rounded-lg px-2 py-1 text-left shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <p className="font-mono font-bold text-xs leading-none">
              +{unit.label}
            </p>
            <p className="text-[10px] text-neo-black/70 mt-0.5">{unit.desc}</p>
          </button>
        ))}
      </div>

      {mode === "value" ? (
        <div className="grid grid-cols-6 gap-1.5">
          {QUICK_NUMBERS.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onInsert(num)}
              className="min-h-[42px] bg-neo-surface border-2 border-neo-black rounded-lg font-mono font-bold text-sm shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              {num}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-8 gap-1.5">
          {FORMULA_OPERATORS.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => onInsert(op === "=" ? " = " : op)}
              className="min-h-[42px] bg-neo-yellow border-2 border-neo-black rounded-lg font-mono font-bold text-base shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              {op}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
