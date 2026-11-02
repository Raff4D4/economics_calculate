"use client";

import React, { useState } from "react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoSlider } from "@/components/ui/NeoSlider";
import { NeoReceipt } from "@/components/ui/NeoReceipt";
import { CalculationHistoryItem } from "@/lib/types";
import { formatCompactIDR, formatIDR, formatPercent } from "@/lib/formatters";

interface LedgerModuleProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, "id" | "timestamp">) => void;
}

const BUSINESS_PRESETS = [
  {
    label: "UMKM Kuliner / F&B",
    revenue: 45000000,
    cogs: 18000000,
    opex: 11000000,
    tax: 2250000,
  },
  {
    label: "Bisnis Digital / SaaS",
    revenue: 80000000,
    cogs: 12000000,
    opex: 25000000,
    tax: 5000000,
  },
  {
    label: "Toko Retail / Grosir",
    revenue: 120000000,
    cogs: 84000000,
    opex: 18000000,
    tax: 3000000,
  },
];

export function LedgerModule({ onSaveHistory }: LedgerModuleProps) {
  const [revenue, setRevenue] = useState(50000000);
  const [cogs, setCogs] = useState(20000000);
  const [opex, setOpex] = useState(12000000);
  const [tax, setTax] = useState(3000000);

  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const totalExpenses = cogs + opex + tax;
  const netProfit = revenue - totalExpenses;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const safeBase = Math.max(revenue, totalExpenses, 1);
  const cogsPct = Math.max(0, Math.min(100, (cogs / safeBase) * 100));
  const opexPct = Math.max(0, Math.min(100, (opex / safeBase) * 100));
  const taxPct = Math.max(0, Math.min(100, (tax / safeBase) * 100));
  const netPct = netProfit > 0 ? Math.max(0, Math.min(100, (netProfit / safeBase) * 100)) : 0;

  const marginStatus =
    netMargin >= 20
      ? { label: "MARGIN SANGAT SEHAT", color: "bg-neo-mint" }
      : netMargin >= 5
      ? { label: "MARGIN STANDAR", color: "bg-neo-yellow" }
      : { label: "MARGIN TIPIS / RUGI", color: "bg-neo-coral" };

  return (
    <div className="space-y-4">
      <NeoCard
        title="Kas, Laba & Margin Bersih"
        subtitle="Masukkan pendapatan dan pengeluaran untuk menghitung Net Margin otomatis"
        badge="LEVEL 1"
        accent="mint"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase mb-1.5">
              CONTOH DATA CEPAT (1-TAP):
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {BUSINESS_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setRevenue(preset.revenue);
                    setCogs(preset.cogs);
                    setOpex(preset.opex);
                    setTax(preset.tax);
                  }}
                  className="bg-neo-bg border-2 border-neo-black p-2 text-left font-bold text-xs shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
            <NeoInput
              label="Pendapatan Kotor (Revenue)"
              symbol="REV"
              unit="Rp"
              step={1000000}
              value={revenue}
              onChange={setRevenue}
            />
            <NeoSlider
              min={0}
              max={250000000}
              step={1000000}
              value={revenue}
              onChange={setRevenue}
            />
          </div>

          <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
            <NeoInput
              label="HPP / Modal Pokok Barang (COGS)"
              symbol="COGS"
              unit="Rp"
              step={500000}
              value={cogs}
              onChange={setCogs}
            />
            <NeoSlider
              min={0}
              max={200000000}
              step={500000}
              value={cogs}
              onChange={setCogs}
            />
          </div>

          <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
            <NeoInput
              label="Biaya Operasional (Opex)"
              symbol="OPEX"
              unit="Rp"
              step={500000}
              value={opex}
              onChange={setOpex}
            />
            <NeoSlider
              min={0}
              max={150000000}
              step={500000}
              value={opex}
              onChange={setOpex}
            />
          </div>

          <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
            <NeoInput
              label="Pajak, Bunga & Biaya Lain (Tax)"
              symbol="TAX"
              unit="Rp"
              step={250000}
              value={tax}
              onChange={setTax}
            />
            <NeoSlider
              min={0}
              max={50000000}
              step={250000}
              value={tax}
              onChange={setTax}
            />
          </div>
        </div>
      </NeoCard>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neo-surface border-3 border-neo-black shadow-neo p-3">
          <p className="text-[11px] font-bold uppercase text-neo-black/70">
            LABA KOTOR (GROSS)
          </p>
          <p className="font-mono text-lg font-bold mt-1">
            {formatCompactIDR(grossProfit)}
          </p>
          <span className="inline-block mt-1 text-xs font-mono font-bold bg-neo-sky border-2 border-neo-black px-2 py-0.5">
            Gross Margin: {formatPercent(grossMargin)}
          </span>
        </div>

        <div className="bg-neo-surface border-3 border-neo-black shadow-neo p-3">
          <p className="text-[11px] font-bold uppercase text-neo-black/70">
            TOTAL PENGELUARAN
          </p>
          <p className="font-mono text-lg font-bold mt-1 text-neo-coral">
            {formatCompactIDR(totalExpenses)}
          </p>
          <span className="inline-block mt-1 text-xs font-mono font-bold bg-neo-coral/30 border-2 border-neo-black px-2 py-0.5">
            Beban: {formatPercent(revenue > 0 ? (totalExpenses / revenue) * 100 : 0)}
          </span>
        </div>

        <div className="col-span-2 bg-neo-surface border-3 border-neo-black shadow-neo p-4 flex items-center justify-between gap-3">
          <div>
            <span
              className={`inline-block text-[10px] font-mono font-bold border-2 border-neo-black px-2 py-0.5 mb-1 ${marginStatus.color}`}
            >
              {marginStatus.label}
            </span>
            <h3 className="text-xs font-bold uppercase">
              LABA BERSIH (NET PROFIT)
            </h3>
            <p className="font-mono text-2xl font-bold mt-0.5">
              {formatIDR(netProfit)}
            </p>
          </div>
          <div className="text-right bg-neo-yellow border-3 border-neo-black shadow-neo-sm px-3.5 py-2 shrink-0">
            <p className="text-[10px] font-bold uppercase">MARGIN BERSIH</p>
            <p className="font-mono text-2xl font-bold">
              {formatPercent(netMargin, 2)}
            </p>
          </div>
        </div>
      </div>

      <NeoCard
        title="Proporsi Alokasi Pendapatan"
        accent="yellow"
        badge="VISUAL BAR"
      >
        <div className="space-y-3">
          <div className="h-11 w-full border-3 border-neo-black shadow-neo-sm flex overflow-hidden bg-neo-bg">
            <div
              style={{ width: `${cogsPct}%` }}
              className="bg-neo-coral border-r-2 border-neo-black flex items-center justify-center text-[10px] font-mono font-bold overflow-hidden"
            >
              {cogsPct >= 10 ? `${Math.round(cogsPct)}%` : ""}
            </div>
            <div
              style={{ width: `${opexPct}%` }}
              className="bg-neo-yellow border-r-2 border-neo-black flex items-center justify-center text-[10px] font-mono font-bold overflow-hidden"
            >
              {opexPct >= 10 ? `${Math.round(opexPct)}%` : ""}
            </div>
            <div
              style={{ width: `${taxPct}%` }}
              className="bg-neo-lilac border-r-2 border-neo-black flex items-center justify-center text-[10px] font-mono font-bold overflow-hidden"
            >
              {taxPct >= 8 ? `${Math.round(taxPct)}%` : ""}
            </div>
            <div
              style={{ width: `${netPct}%` }}
              className="bg-neo-mint flex items-center justify-center text-[10px] font-mono font-bold overflow-hidden"
            >
              {netPct >= 10 ? `${Math.round(netPct)}%` : ""}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-neo-coral border-2 border-neo-black inline-block" />
              <span>HPP: {formatPercent(cogsPct, 1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-neo-yellow border-2 border-neo-black inline-block" />
              <span>Opex: {formatPercent(opexPct, 1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-neo-lilac border-2 border-neo-black inline-block" />
              <span>Pajak: {formatPercent(taxPct, 1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-neo-mint border-2 border-neo-black inline-block" />
              <span>Margin Bersih: {formatPercent(netPct, 1)}</span>
            </div>
          </div>
        </div>
      </NeoCard>

      <NeoReceipt
        module="ledger"
        title="Kalkulasi Margin Bersih (Net Profit Margin)"
        formula="Net_Margin = ((REV - (COGS + OPEX + TAX)) / REV) * 100"
        variables={{ REV: revenue, COGS: cogs, OPEX: opex, TAX: tax }}
        substituted={`Net_Margin = ((${formatIDR(revenue)} - ${formatIDR(totalExpenses)}) / ${formatIDR(revenue)}) * 100`}
        resultFormatted={`${formatPercent(netMargin, 2)} (${formatIDR(netProfit)})`}
        rawResult={netMargin}
        onSaveHistory={onSaveHistory}
      />
    </div>
  );
}

