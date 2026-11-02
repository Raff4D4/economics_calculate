"use client";

import React, { useState } from "react";
import { Copy, Check, BookmarkPlus, Receipt } from "lucide-react";
import { AppTab, CalculationHistoryItem } from "@/lib/types";
import { formatNumber } from "@/lib/formatters";
import { NeoButton } from "./NeoButton";

interface NeoReceiptProps {
  title: string;
  formula: string;
  variables: Record<string, number>;
  substituted: string;
  resultFormatted: string;
  rawResult: number;
  module: AppTab;
  onSaveHistory: (item: Omit<CalculationHistoryItem, "id" | "timestamp">) => void;
}

export function NeoReceipt({
  title,
  formula,
  variables,
  substituted,
  resultFormatted,
  rawResult,
  module,
  onSaveHistory,
}: NeoReceiptProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const variableEntries = Object.entries(variables);

  const handleCopy = async () => {
    const varsLine = variableEntries
      .map(([k, v]) => `${k} = ${formatNumber(v, 4)}`)
      .join(", ");
    const receiptText = [
      `=== STRUK KALKULASI ECONOBRUTAL ===`,
      `Modul: ${title}`,
      `Rumus: ${formula}`,
      `Variabel: ${varsLine}`,
      `Substitusi: ${substituted}`,
      `Hasil Akhir: ${resultFormatted}`,
      `===================================`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSave = () => {
    onSaveHistory({
      module,
      title,
      formula,
      substituted,
      variables,
      resultFormatted,
      rawResult,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-neo-surface border-3 border-neo-black shadow-neo p-4 font-mono space-y-3">
      <div className="flex items-center justify-between border-b-2 border-dashed border-neo-black pb-2.5">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 stroke-[2.5]" />
          <span className="font-bold text-sm uppercase">
            STRUK SUBSTITUSI RUMUS
          </span>
        </div>
        <span className="text-[11px] bg-neo-yellow border-2 border-neo-black px-2 py-0.5 font-bold">
          STEP-BY-STEP
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase text-neo-black/60">
            1. RUMUS PERSAMAAN:
          </p>
          <p className="font-bold bg-neo-bg border-2 border-neo-black p-2 mt-0.5 break-all">
            {formula}
          </p>
        </div>

        {variableEntries.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase text-neo-black/60">
              2. NILAI INPUT VARIABEL:
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {variableEntries.map(([key, val]) => (
                <span
                  key={key}
                  className="bg-neo-lilac/40 border-2 border-neo-black px-2 py-0.5 font-bold"
                >
                  {key} = {formatNumber(val, 4)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] font-bold uppercase text-neo-black/60">
            3. SUBSTITUSI LANGSUNG:
          </p>
          <p className="font-bold bg-neo-bg border-2 border-neo-black p-2 mt-0.5 break-all">
            {substituted}
          </p>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-neo-black pt-3 flex items-center justify-between bg-neo-mint/30 p-3 border-2">
        <span className="text-xs font-bold uppercase">HASIL KALKULASI:</span>
        <span className="text-lg font-bold tracking-tight break-all">
          {resultFormatted}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <NeoButton variant="white" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Salin Struk</span>
            </>
          )}
        </NeoButton>
        <NeoButton variant="yellow" size="sm" onClick={handleSave}>
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-4 h-4" />
              <span>Simpan Riwayat</span>
            </>
          )}
        </NeoButton>
      </div>
    </div>
  );
}

