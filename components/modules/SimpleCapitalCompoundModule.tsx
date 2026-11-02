"use client";

import React, { useState, useMemo } from "react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoReceipt } from "@/components/ui/NeoReceipt";
import { NeoChart, GrowthChartPoint } from "@/components/visual/NeoChart";
import {
  formatCompactIDR,
  formatIDR,
  formatPercent,
  parseSmartInput,
} from "@/lib/formatters";
import { CalculationHistoryItem } from "@/lib/types";

interface SimpleCapitalCompoundModuleProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, "id" | "timestamp">) => void;
}

type GoalMode = "find-capital" | "find-profit" | "simple-compound";

export function SimpleCapitalCompoundModule({
  onSaveHistory,
}: SimpleCapitalCompoundModuleProps) {
  const [goalMode, setGoalMode] = useState<GoalMode>("find-capital");

  const [desiredProfitRaw, setDesiredProfitRaw] = useState("15jt");
  const [profitPercentRaw, setProfitPercentRaw] = useState("20%");

  const [myCapitalRaw, setMyCapitalRaw] = useState("50jt");
  const [myMarginRaw, setMyMarginRaw] = useState("25%");

  const [initialSavingsRaw, setInitialSavingsRaw] = useState("20jt");
  const [monthlySaveRaw, setMonthlySaveRaw] = useState("1.5jt");
  const [annualReturnRaw, setAnnualReturnRaw] = useState("8%");
  const [durationYearsRaw, setDurationYearsRaw] = useState("10thn");

  const desiredProfit = parseSmartInput(desiredProfitRaw).numeric;
  const rawPct1 = parseSmartInput(profitPercentRaw).numeric;
  const pctDecimal1 = rawPct1 > 1 ? rawPct1 / 100 : rawPct1;
  const requiredCapital = pctDecimal1 > 0 ? desiredProfit / pctDecimal1 : 0;

  const myCapital = parseSmartInput(myCapitalRaw).numeric;
  const rawPct2 = parseSmartInput(myMarginRaw).numeric;
  const pctDecimal2 = rawPct2 > 1 ? rawPct2 / 100 : rawPct2;
  const earnedProfit = myCapital * pctDecimal2;
  const totalMoneyBack = myCapital + earnedProfit;

  const compoundData = useMemo(() => {
    const startMoney = parseSmartInput(initialSavingsRaw).numeric;
    const monthlyAdd = parseSmartInput(monthlySaveRaw).numeric;
    const rawRate = parseSmartInput(annualReturnRaw).numeric;
    const rateDecimal = rawRate > 1 ? rawRate / 100 : rawRate;
    const yearsCount = Math.max(
      1,
      Math.min(40, Math.round(parseSmartInput(durationYearsRaw).numeric || 1))
    );

    const points: GrowthChartPoint[] = [];
    let balance = startMoney;
    let totalPrincipal = startMoney;

    for (let y = 1; y <= yearsCount; y++) {
      for (let m = 1; m <= 12; m++) {
        balance += monthlyAdd;
        totalPrincipal += monthlyAdd;
        balance *= 1 + rateDecimal / 12;
      }
      points.push({
        yearLabel: `Thn ${y}`,
        principal: Math.round(totalPrincipal),
        interest: Math.max(0, Math.round(balance - totalPrincipal)),
        total: Math.round(balance),
      });
    }

    const last = points[points.length - 1] || {
      principal: startMoney,
      interest: 0,
      total: startMoney,
    };

    return {
      points,
      finalBalance: last.total,
      totalPrincipal: last.principal,
      totalInterest: last.interest,
      yearsCount,
      ratePercent: rateDecimal * 100,
    };
  }, [initialSavingsRaw, monthlySaveRaw, annualReturnRaw, durationYearsRaw]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setGoalMode("find-capital")}
          className={`min-h-[48px] border-2 border-neo-black rounded-xl font-bold text-xs px-2 transition-all ${
            goalMode === "find-capital"
              ? "bg-neo-yellow shadow-none translate-x-[1px] translate-y-[1px]"
              : "bg-neo-surface shadow-neo-sm"
          }`}
        >
          1. Cari Modal
        </button>
        <button
          type="button"
          onClick={() => setGoalMode("find-profit")}
          className={`min-h-[48px] border-2 border-neo-black rounded-xl font-bold text-xs px-2 transition-all ${
            goalMode === "find-profit"
              ? "bg-neo-mint shadow-none translate-x-[1px] translate-y-[1px]"
              : "bg-neo-surface shadow-neo-sm"
          }`}
        >
          2. Cari Untung
        </button>
        <button
          type="button"
          onClick={() => setGoalMode("simple-compound")}
          className={`min-h-[48px] border-2 border-neo-black rounded-xl font-bold text-xs px-2 transition-all ${
            goalMode === "simple-compound"
              ? "bg-neo-lilac shadow-none translate-x-[1px] translate-y-[1px]"
              : "bg-neo-surface shadow-neo-sm"
          }`}
        >
          3. Compound Simpel
        </button>
      </div>

      {goalMode === "find-capital" && (
        <div className="space-y-4">
          <NeoCard
            title="Cari Modal Awal (Cukup Isi Target Untung & Persen)"
            subtitle="Cocok saat kamu punya target keuntungan rupiah tertentu dan ingin tahu berapa modal yang harus disiapkan"
            badge="CARI MODAL"
            accent="yellow"
          >
            <div className="space-y-3">
              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl">
                <label className="text-xs font-bold block">
                  Mau Dapat Keuntungan Berapa Rupiah? (Ketik 15jt / 500rb)
                </label>
                <input
                  type="text"
                  value={desiredProfitRaw}
                  onChange={(e) => setDesiredProfitRaw(e.target.value)}
                  className="w-full min-h-[46px] mt-1.5 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono text-base font-bold"
                />
                <span className="text-[11px] font-mono text-neo-muted mt-1 block">
                  Target Untung: {formatIDR(desiredProfit)}
                </span>
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl">
                <label className="text-xs font-bold block">
                  Berapa Persen Margin / Return Bisnisnya? (Ketik 10% / 20%)
                </label>
                <input
                  type="text"
                  value={profitPercentRaw}
                  onChange={(e) => setProfitPercentRaw(e.target.value)}
                  className="w-full min-h-[46px] mt-1.5 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono text-base font-bold"
                />
                <div className="flex gap-1.5 mt-2">
                  {["5%", "10%", "15%", "20%", "30%", "50%"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProfitPercentRaw(p)}
                      className="bg-neo-surface border border-neo-black rounded px-2 py-1 font-mono text-xs font-bold"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </NeoCard>

          <div className="bg-neo-mint border-2 border-neo-black rounded-xl shadow-neo p-4 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase bg-neo-surface border border-neo-black rounded px-2 py-0.5">
              MODAL YANG WAJIB DISIAPKAN
            </span>
            <p className="font-mono text-2xl sm:text-3xl font-bold pt-1">
              {formatIDR(requiredCapital)}
            </p>
            <p className="text-xs font-medium">
              Dengan modal {formatCompactIDR(requiredCapital)} dan return{" "}
              {formatPercent(pctDecimal1 * 100, 1)}, kamu akan meraih untung{" "}
              {formatCompactIDR(desiredProfit)}.
            </p>
          </div>

          <NeoReceipt
            module="capital"
            title="Pencari Modal Awal"
            formula="Modal = Target_Untung / Persen"
            variables={{
              Target_Untung: desiredProfit,
              Persen: pctDecimal1,
            }}
            substituted={`Modal = ${formatIDR(desiredProfit)} / ${formatPercent(pctDecimal1 * 100, 1)}`}
            resultFormatted={formatIDR(requiredCapital)}
            rawResult={requiredCapital}
            onSaveHistory={onSaveHistory}
          />
        </div>
      )}

      {goalMode === "find-profit" && (
        <div className="space-y-4">
          <NeoCard
            title="Hitung Keuntungan & Total Balik Uang"
            subtitle="Masukkan uang modal yang kamu punya dan persentase cuannya"
            badge="CARI UNTUNG"
            accent="mint"
          >
            <div className="space-y-3">
              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl">
                <label className="text-xs font-bold block">
                  Modal yang Kamu Punya (Ketik 50jt / 10jt)
                </label>
                <input
                  type="text"
                  value={myCapitalRaw}
                  onChange={(e) => setMyCapitalRaw(e.target.value)}
                  className="w-full min-h-[46px] mt-1.5 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono text-base font-bold"
                />
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl">
                <label className="text-xs font-bold block">
                  Persentase Keuntungan (%)
                </label>
                <input
                  type="text"
                  value={myMarginRaw}
                  onChange={(e) => setMyMarginRaw(e.target.value)}
                  className="w-full min-h-[46px] mt-1.5 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono text-base font-bold"
                />
              </div>
            </div>
          </NeoCard>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neo-mint border-2 border-neo-black rounded-xl shadow-neo p-3.5">
              <p className="text-[10px] font-bold uppercase">UNTUNG BERSIH</p>
              <p className="font-mono text-xl font-bold mt-1">
                {formatIDR(earnedProfit)}
              </p>
            </div>
            <div className="bg-neo-yellow border-2 border-neo-black rounded-xl shadow-neo p-3.5">
              <p className="text-[10px] font-bold uppercase">TOTAL UANG AKHIR</p>
              <p className="font-mono text-xl font-bold mt-1">
                {formatIDR(totalMoneyBack)}
              </p>
            </div>
          </div>
        </div>
      )}

      {goalMode === "simple-compound" && (
        <div className="space-y-4">
          <NeoCard
            title="Compound Interest Simpel (Nabung Berbunga)"
            subtitle="Ketik langsung pakai 20jt, 1.5jt, 8%, dan 10thn tanpa pusing rumus bank"
            badge="BUNGA BERBUNGA"
            accent="lilac"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl">
                <label className="text-xs font-bold block">
                  Uang Tabungan Awal (Contoh: 20jt)
                </label>
                <input
                  type="text"
                  value={initialSavingsRaw}
                  onChange={(e) => setInitialSavingsRaw(e.target.value)}
                  className="w-full min-h-[44px] mt-1 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono font-bold text-sm"
                />
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl">
                <label className="text-xs font-bold block">
                  Nabung Rutin per Bulan (Contoh: 1.5jt)
                </label>
                <input
                  type="text"
                  value={monthlySaveRaw}
                  onChange={(e) => setMonthlySaveRaw(e.target.value)}
                  className="w-full min-h-[44px] mt-1 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono font-bold text-sm"
                />
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl">
                <label className="text-xs font-bold block">
                  Bunga / Return per Tahun (Contoh: 8%)
                </label>
                <input
                  type="text"
                  value={annualReturnRaw}
                  onChange={(e) => setAnnualReturnRaw(e.target.value)}
                  className="w-full min-h-[44px] mt-1 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono font-bold text-sm"
                />
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl">
                <label className="text-xs font-bold block">
                  Lama Waktu Menabung (Contoh: 10thn)
                </label>
                <input
                  type="text"
                  value={durationYearsRaw}
                  onChange={(e) => setDurationYearsRaw(e.target.value)}
                  className="w-full min-h-[44px] mt-1 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono font-bold text-sm"
                />
              </div>
            </div>
          </NeoCard>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 bg-neo-mint border-2 border-neo-black rounded-xl shadow-neo p-4">
              <p className="text-xs font-bold uppercase">
                TOTAL SALDO AKHIR ({compoundData.yearsCount} TAHUN)
              </p>
              <p className="font-mono text-2xl sm:text-3xl font-bold mt-1">
                {formatIDR(compoundData.finalBalance)}
              </p>
            </div>
            <div className="bg-neo-surface border-2 border-neo-black rounded-xl shadow-neo p-3">
              <p className="text-[10px] font-bold uppercase text-neo-muted">
                UANG POKOK SETORANMU
              </p>
              <p className="font-mono text-base font-bold mt-1">
                {formatCompactIDR(compoundData.totalPrincipal)}
              </p>
            </div>
            <div className="bg-neo-surface border-2 border-neo-black rounded-xl shadow-neo p-3">
              <p className="text-[10px] font-bold uppercase text-neo-muted">
                HASIL MURNI BUNGA
              </p>
              <p className="font-mono text-base font-bold mt-1">
                +{formatCompactIDR(compoundData.totalInterest)}
              </p>
            </div>
          </div>

          <NeoCard
            title="Grafik Pertumbuhan Tabungan vs Bunga"
            accent="sky"
            badge={`${compoundData.yearsCount} TAHUN`}
          >
            <NeoChart data={compoundData.points} />
          </NeoCard>
        </div>
      )}
    </div>
  );
}
