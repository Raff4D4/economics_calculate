"use client";

import React from "react";
import { Delete, RotateCcw } from "lucide-react";

interface MobileFormulaPadProps {
  onInsert: (token: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const VARIABLE_KEYS = ["M", "i", "P", "n", "r", "t", "Q", "C"];
const OPERATOR_KEYS = ["(", ")", "^", "*", "/", "+", "-", "="];
const FUNCTION_KEYS = ["sqrt(", "log(", "100", "1", "0.01"];

export function MobileFormulaPad({
  onInsert,
  onBackspace,
  onClear,
}: MobileFormulaPadProps) {
  return (
    <div className="bg-neo-bg border-3 border-neo-black shadow-neo p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase bg-neo-lilac border-2 border-neo-black px-2 py-0.5">
          KEYPAD RUMUS CEPAT (MOBILE)
        </span>
        <span className="text-[11px] font-bold text-neo-black/70">
          Sentuh tombol untuk menyisipkan
        </span>
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {VARIABLE_KEYS.map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => onInsert(token)}
            className="min-h-[44px] bg-neo-lilac border-2 border-neo-black font-mono font-bold text-sm shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {token}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {OPERATOR_KEYS.map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => onInsert(` ${token} `.replace(/\s+\(\s+/g, "(").replace(/\s+\)\s+/g, ")").replace(/\s+\^\s+/g, "^"))}
            className="min-h-[46px] bg-neo-yellow border-2 border-neo-black font-mono font-bold text-base shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {token}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {FUNCTION_KEYS.map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => onInsert(token)}
            className="min-h-[44px] bg-neo-surface border-2 border-neo-black font-mono font-bold text-xs shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {token}
          </button>
        ))}
        <button
          type="button"
          onClick={onBackspace}
          aria-label="Hapus karakter terakhir"
          className="min-h-[44px] bg-neo-orange border-2 border-neo-black font-bold text-xs shadow-neo-sm flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <Delete className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Kosongkan rumus"
          className="min-h-[44px] bg-neo-coral border-2 border-neo-black font-bold text-xs shadow-neo-sm flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

