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
      `=== CATATAN KALKULASI ECONOBRUTAL ===`,
      `Topik: ${title}`,
      `Rumus: ${formula}`,
      `Data: ${varsLine}`,
      `Hitungan: ${substituted}`,
      `Hasil Akhir: ${resultFormatted}`,
      `=====================================`,
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
    <div className="bg-neo-surface border-2 border-neo-black rounded-xl shadow-neo p-4 font-mono space-y-3">
      <div className="flex items-center justify-between border-b-2 border-dashed border-neo-black/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 stroke-[2.5]" />
          <span className="font-bold text-xs uppercase">
            RINGKASAN LANGKAH HITUNG
          </span>
        </div>
        <span className="text-[10px] bg-neo-yellow border border-neo-black rounded px-2 py-0.5 font-bold">
          TRANSPARAN
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase text-neo-muted">
            RUMUS YANG DIPAKAI:
          </p>
          <p className="font-bold bg-neo-bg border border-neo-black rounded-lg p-2 mt-0.5 break-all">
            {formula}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase text-neo-muted">
            PROSES MASUK ANGKA:
          </p>
          <p className="font-bold bg-neo-bg border border-neo-black rounded-lg p-2 mt-0.5 break-all">
            {substituted}
          </p>
        </div>
      </div>

      <div className="bg-neo-mint/60 border-2 border-neo-black rounded-lg p-3 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase">HASIL AKHIR:</span>
        <span className="text-base sm:text-lg font-bold tracking-tight break-all text-right">
          {resultFormatted}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <NeoButton variant="white" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Salin Hasil</span>
            </>
          )}
        </NeoButton>
        <NeoButton variant="yellow" size="sm" onClick={handleSave}>
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Tersimpan</span>
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
