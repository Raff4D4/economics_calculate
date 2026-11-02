"use client";

import React, { useState, useMemo } from "react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoSlider } from "@/components/ui/NeoSlider";
import { NeoReceipt } from "@/components/ui/NeoReceipt";
import { NeoChart, GrowthChartPoint } from "@/components/visual/NeoChart";
import { CalculationHistoryItem } from "@/lib/types";
import {
  formatCompactIDR,
  formatIDR,
  formatNumber,
  formatPercent,
} from "@/lib/formatters";

interface InvestModuleProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, "id" | "timestamp">) => void;
}

type InvestSubTab = "compound" | "roi" | "pe";

export function InvestModule({ onSaveHistory }: InvestModuleProps) {
  const [subTab, setSubTab] = useState<InvestSubTab>("compound");

  const [principal, setPrincipal] = useState(10000000);
  const [monthlyDeposit, setMonthlyDeposit] = useState(1000000);
  const [annualRate, setAnnualRate] = useState(8);
  const [years, setYears] = useState(10);
  const [compoundFreq, setCompoundFreq] = useState<12 | 4 | 1>(12);

  const [roiCost, setRoiCost] = useState(25000000);
  const [roiFinal, setRoiFinal] = useState(38000000);
  const [roiYears, setRoiYears] = useState(2);

  const [stockPrice, setStockPrice] = useState(3000);
  const [eps, setEps] = useState(250);
  const [epsGrowth, setEpsGrowth] = useState(15);

  const compoundProjection = useMemo(() => {
    const safeYears = Math.max(1, Math.min(40, Math.round(years)));
    const r = annualRate / 100;
    const points: GrowthChartPoint[] = [];
    let balance = principal;
    let totalContributed = principal;

    for (let y = 1; y <= safeYears; y++) {
      for (let m = 1; m <= 12; m++) {
        balance += monthlyDeposit;
        totalContributed += monthlyDeposit;
        if (compoundFreq === 12) {
          balance *= 1 + r / 12;
        } else if (compoundFreq === 4 && m % 3 === 0) {
          balance *= 1 + r / 4;
        } else if (compoundFreq === 1 && m === 12) {
          balance *= 1 + r;
        }
      }
      points.push({
        yearLabel: `Thn ${y}`,
        principal: Math.round(totalContributed),
        interest: Math.max(0, Math.round(balance - totalContributed)),
        total: Math.round(balance),
      });
    }

    const last = points[points.length - 1] || {
      principal,
      interest: 0,
      total: principal,
    };

    return {
      points,
      finalValue: last.total,
      totalPrincipal: last.principal,
      totalInterest: last.interest,
    };
  }, [principal, monthlyDeposit, annualRate, years, compoundFreq]);

  const netReturnRoi = roiFinal - roiCost;
  const roiPercentage = roiCost > 0 ? (netReturnRoi / roiCost) * 100 : 0;
  const annualizedRoi =
    roiCost > 0 && roiFinal > 0 && roiYears > 0
      ? (Math.pow(roiFinal / roiCost, 1 / roiYears) - 1) * 100
      : 0;

  const peRatio = eps > 0 ? stockPrice / eps : 0;
  const earningsYield = stockPrice > 0 ? (eps / stockPrice) * 100 : 0;
  const pegRatio = epsGrowth > 0 ? peRatio / epsGrowth : 0;

  const peStatus =
    peRatio <= 0
      ? { text: "EPS Negatif / Nihil", bg: "bg-neo-coral" }
      : peRatio < 10
      ? { text: "Undervalued / Murah (< 10x)", bg: "bg-neo-mint" }
      : peRatio <= 20
      ? { text: "Valuasi Wajar (10x - 20x)", bg: "bg-neo-yellow" }
      : { text: "Valuasi Premium / Growth (> 20x)", bg: "bg-neo-lilac" };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setSubTab("compound")}
          className={`min-h-[48px] border-3 border-neo-black font-bold text-xs uppercase px-2 transition-all ${
            subTab === "compound"
              ? "bg-neo-yellow shadow-none translate-x-[2px] translate-y-[2px]"
              : "bg-neo-surface shadow-neo-sm"
          }`}
        >
          Compound Rate
        </button>
        <button
          type="button"
          onClick={() => setSubTab("roi")}
          className={`min-h-[48px] border-3 border-neo-black font-bold text-xs uppercase px-2 transition-all ${
            subTab === "roi"
              ? "bg-neo-mint shadow-none translate-x-[2px] translate-y-[2px]"
              : "bg-neo-surface shadow-neo-sm"
          }`}
        >
          Hitung ROI
        </button>
        <button
          type="button"
          onClick={() => setSubTab("pe")}
          className={`min-h-[48px] border-3 border-neo-black font-bold text-xs uppercase px-2 transition-all ${
            subTab === "pe"
              ? "bg-neo-lilac shadow-none translate-x-[2px] translate-y-[2px]"
              : "bg-neo-surface shadow-neo-sm"
          }`}
        >
          P/E Saham
        </button>
      </div>

      {subTab === "compound" && (
        <div className="space-y-4">
          <NeoCard
            title="Compound Interest (Bunga Majemuk)"
            subtitle="Simulasi pertumbuhan modal pokok & setoran bulanan perbankan/investasi"
            badge="PERBANKAN"
            accent="yellow"
          >
            <div className="space-y-4">
              <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                <NeoInput
                  label="Modal Awal (Principal P)"
                  symbol="P"
                  unit="Rp"
                  step={1000000}
                  value={principal}
                  onChange={setPrincipal}
                />
                <NeoSlider
                  min={0}
                  max={200000000}
                  step={1000000}
                  value={principal}
                  onChange={setPrincipal}
                />
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                <NeoInput
                  label="Setoran Rutin Bulanan (PMT)"
                  symbol="PMT"
                  unit="Rp"
                  step={250000}
                  value={monthlyDeposit}
                  onChange={setMonthlyDeposit}
                />
                <NeoSlider
                  min={0}
                  max={25000000}
                  step={250000}
                  value={monthlyDeposit}
                  onChange={setMonthlyDeposit}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                  <NeoInput
                    label="Suku Bunga / Return Tahunan (r)"
                    symbol="r"
                    unit="%"
                    step={0.5}
                    value={annualRate}
                    onChange={setAnnualRate}
                  />
                  <NeoSlider
                    min={0}
                    max={30}
                    step={0.25}
                    value={annualRate}
                    onChange={setAnnualRate}
                  />
                </div>

                <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                  <NeoInput
                    label="Durasi Waktu (t Tahun)"
                    symbol="t"
                    unit="tahun"
                    step={1}
                    value={years}
                    onChange={setYears}
                  />
                  <NeoSlider
                    min={1}
                    max={30}
                    step={1}
                    value={years}
                    onChange={setYears}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase mb-1.5">
                  FREKUENSI COMPOUNDING (n):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { label: "Bulanan (12x)", val: 12 },
                      { label: "Kuartalan (4x)", val: 4 },
                      { label: "Tahunan (1x)", val: 1 },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setCompoundFreq(item.val)}
                      className={`min-h-[44px] border-2 border-neo-black font-mono text-xs font-bold ${
                        compoundFreq === item.val
                          ? "bg-neo-mint shadow-none translate-x-[1px] translate-y-[1px]"
                          : "bg-neo-bg shadow-neo-sm"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </NeoCard>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 bg-neo-mint border-3 border-neo-black shadow-neo p-4">
              <p className="text-xs font-bold uppercase">
                NILAI AKHIR (FUTURE VALUE)
              </p>
              <p className="font-mono text-2xl font-bold mt-1">
                {formatIDR(compoundProjection.finalValue)}
              </p>
            </div>
            <div className="bg-neo-surface border-3 border-neo-black shadow-neo p-3">
              <p className="text-[11px] font-bold uppercase text-neo-black/70">
                TOTAL POKOK SETORAN
              </p>
              <p className="font-mono text-base font-bold mt-1">
                {formatCompactIDR(compoundProjection.totalPrincipal)}
              </p>
            </div>
            <div className="bg-neo-surface border-3 border-neo-black shadow-neo p-3">
              <p className="text-[11px] font-bold uppercase text-neo-black/70">
                TOTAL BUNGA DIDAPAT
              </p>
              <p className="font-mono text-base font-bold mt-1 text-neo-black">
                {formatCompactIDR(compoundProjection.totalInterest)}
              </p>
            </div>
          </div>

          <NeoCard
            title="Grafik Pertumbuhan Pokok vs Bunga"
            accent="sky"
            badge={`${years} TAHUN`}
          >
            <NeoChart data={compoundProjection.points} />
          </NeoCard>

          <NeoReceipt
            module="invest"
            title="Compound Interest (Bunga Majemuk)"
            formula="FV = P * (1 + r/n)^(n*t) + PMT_Akumulasi"
            variables={{
              P: principal,
              PMT: monthlyDeposit,
              r: annualRate,
              t: years,
              n: compoundFreq,
            }}
            substituted={`FV = ${formatCompactIDR(principal)} * (1 + ${annualRate}%/${compoundFreq})^(${compoundFreq}*${years}) + Setoran`}
            resultFormatted={formatIDR(compoundProjection.finalValue)}
            rawResult={compoundProjection.finalValue}
            onSaveHistory={onSaveHistory}
          />
        </div>
      )}

      {subTab === "roi" && (
        <div className="space-y-4">
          <NeoCard
            title="Kalkulator ROI (Return on Investment)"
            subtitle="Hitung persentase keuntungan investasi dan CAGR tahunan"
            badge="INVESTASI"
            accent="mint"
          >
            <div className="space-y-4">
              <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                <NeoInput
                  label="Modal Investasi Awal (Cost)"
                  symbol="COST"
                  unit="Rp"
                  step={1000000}
                  value={roiCost}
                  onChange={setRoiCost}
                />
                <NeoSlider
                  min={500000}
                  max={200000000}
                  step={500000}
                  value={roiCost}
                  onChange={setRoiCost}
                />
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                <NeoInput
                  label="Nilai Akhir / Hasil Investasi (Final)"
                  symbol="FINAL"
                  unit="Rp"
                  step={1000000}
                  value={roiFinal}
                  onChange={setRoiFinal}
                />
                <NeoSlider
                  min={0}
                  max={300000000}
                  step={500000}
                  value={roiFinal}
                  onChange={setRoiFinal}
                />
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                <NeoInput
                  label="Durasi Periode Investasi (Tahun)"
                  symbol="t"
                  unit="tahun"
                  step={0.5}
                  value={roiYears}
                  onChange={setRoiYears}
                />
                <NeoSlider
                  min={0.5}
                  max={20}
                  step={0.5}
                  value={roiYears}
                  onChange={setRoiYears}
                />
              </div>
            </div>
          </NeoCard>

          <div className="grid grid-cols-2 gap-3">
            <div
              className={`col-span-2 border-3 border-neo-black shadow-neo p-4 flex items-center justify-between ${
                roiPercentage >= 0 ? "bg-neo-mint" : "bg-neo-coral"
              }`}
            >
              <div>
                <p className="text-xs font-bold uppercase">TOTAL ROI (%)</p>
                <p className="font-mono text-3xl font-bold mt-0.5">
                  {formatPercent(roiPercentage, 2)}
                </p>
              </div>
              <div className="text-right font-mono">
                <p className="text-xs font-bold uppercase">RETURN BERSIH</p>
                <p className="text-base font-bold">{formatIDR(netReturnRoi)}</p>
              </div>
            </div>

            <div className="col-span-2 bg-neo-surface border-3 border-neo-black shadow-neo p-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase">
                ANNUALIZED ROI (CAGR TAHUNAN):
              </span>
              <span className="font-mono text-lg font-bold bg-neo-yellow border-2 border-neo-black px-2.5 py-0.5">
                {formatPercent(annualizedRoi, 2)} / thn
              </span>
            </div>
          </div>

          <NeoReceipt
            module="invest"
            title="Return on Investment (ROI)"
            formula="ROI = ((FINAL - COST) / COST) * 100"
            variables={{ COST: roiCost, FINAL: roiFinal, t: roiYears }}
            substituted={`ROI = ((${formatIDR(roiFinal)} - ${formatIDR(roiCost)}) / ${formatIDR(roiCost)}) * 100`}
            resultFormatted={`${formatPercent(roiPercentage, 2)} (${formatIDR(netReturnRoi)})`}
            rawResult={roiPercentage}
            onSaveHistory={onSaveHistory}
          />
        </div>
      )}

      {subTab === "pe" && (
        <div className="space-y-4">
          <NeoCard
            title="Valuasi P/E Ratio & PEG Saham"
            subtitle="Ukur mahal atau murahnya harga saham terhadap laba per lembar (EPS)"
            badge="VALUASI"
            accent="lilac"
          >
            <div className="space-y-4">
              <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                <NeoInput
                  label="Harga Saham per Lembar (Price)"
                  symbol="P"
                  unit="Rp"
                  step={50}
                  value={stockPrice}
                  onChange={setStockPrice}
                />
                <NeoSlider
                  min={50}
                  max={50000}
                  step={50}
                  value={stockPrice}
                  onChange={setStockPrice}
                />
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                <NeoInput
                  label="Laba Bersih per Saham Tahunan (EPS)"
                  symbol="EPS"
                  unit="Rp"
                  step={10}
                  value={eps}
                  onChange={setEps}
                />
                <NeoSlider
                  min={1}
                  max={5000}
                  step={10}
                  value={eps}
                  onChange={setEps}
                />
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black space-y-2">
                <NeoInput
                  label="Pertumbuhan EPS Tahunan (EPS Growth)"
                  symbol="G"
                  unit="%"
                  step={1}
                  value={epsGrowth}
                  onChange={setEpsGrowth}
                />
                <NeoSlider
                  min={1}
                  max={100}
                  step={1}
                  value={epsGrowth}
                  onChange={setEpsGrowth}
                />
              </div>
            </div>
          </NeoCard>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neo-surface border-3 border-neo-black shadow-neo p-3">
              <p className="text-[11px] font-bold uppercase text-neo-black/70">
                P/E RATIO (PER)
              </p>
              <p className="font-mono text-2xl font-bold mt-1">
                {formatNumber(peRatio, 2)}x
              </p>
              <p className="text-[11px] font-medium mt-1">
                Balik modal laba ~{formatNumber(peRatio, 1)} tahun
              </p>
            </div>

            <div className="bg-neo-surface border-3 border-neo-black shadow-neo p-3">
              <p className="text-[11px] font-bold uppercase text-neo-black/70">
                EARNINGS YIELD
              </p>
              <p className="font-mono text-2xl font-bold mt-1">
                {formatPercent(earningsYield, 2)}
              </p>
              <p className="text-[11px] font-medium mt-1">
                PEG Ratio: {formatNumber(pegRatio, 2)}
              </p>
            </div>

            <div
              className={`col-span-2 border-3 border-neo-black shadow-neo p-3.5 ${peStatus.bg}`}
            >
              <p className="text-xs font-bold uppercase">
                STATUS VALUASI SAHAM:
              </p>
              <p className="font-mono text-base font-bold mt-0.5">
                {peStatus.text}
              </p>
            </div>
          </div>

          <NeoReceipt
            module="invest"
            title="Valuasi Price to Earnings (P/E Ratio)"
            formula="PE = P / EPS"
            variables={{ P: stockPrice, EPS: eps, G: epsGrowth }}
            substituted={`PE = ${formatIDR(stockPrice)} / ${formatIDR(eps)}`}
            resultFormatted={`${formatNumber(peRatio, 2)}x (Earnings Yield ${formatPercent(earningsYield, 2)})`}
            rawResult={peRatio}
            onSaveHistory={onSaveHistory}
          />
        </div>
      )}
    </div>
  );
}

