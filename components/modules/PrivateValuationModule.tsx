"use client";

import React, { useState } from "react";
import { Building2, Scale, Award } from "lucide-react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoReceipt } from "@/components/ui/NeoReceipt";
import {
  formatCompactIDR,
  formatNumber,
  formatPercent,
  parseSmartInput,
} from "@/lib/formatters";
import { CalculationHistoryItem } from "@/lib/types";

interface PrivateValuationModuleProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, "id" | "timestamp">) => void;
}

interface CompanyScenario {
  name: string;
  sector: "fnb" | "tech" | "retail";
  offerInvestmentRaw: string;
  equityShareRaw: string;
  monthlyRevenueRaw: string;
  monthlyCostRaw: string;
}

const QUICK_COMPANY_EXAMPLES: CompanyScenario[] = [
  {
    name: "Outlet F&B / Nightlife (Gaya Holywings)",
    sector: "fnb",
    offerInvestmentRaw: "1.5m",
    equityShareRaw: "10%",
    monthlyRevenueRaw: "850jt",
    monthlyCostRaw: "650jt",
  },
  {
    name: "Tech Startup / SaaS Platform",
    sector: "tech",
    offerInvestmentRaw: "3m",
    equityShareRaw: "5%",
    monthlyRevenueRaw: "400jt",
    monthlyCostRaw: "150jt",
  },
  {
    name: "Coffee Shop / Resto Cabang Baru",
    sector: "fnb",
    offerInvestmentRaw: "350jt",
    equityShareRaw: "25%",
    monthlyRevenueRaw: "120jt",
    monthlyCostRaw: "90jt",
  },
];

function evaluateCompany(scenario: CompanyScenario) {
  const offerAmount = parseSmartInput(scenario.offerInvestmentRaw).numeric;
  const equityRawParsed = parseSmartInput(scenario.equityShareRaw).numeric;
  const equityDecimal =
    equityRawParsed > 1 ? equityRawParsed / 100 : equityRawParsed;
  const equityPercent = equityDecimal * 100;

  const monthlyRev = parseSmartInput(scenario.monthlyRevenueRaw).numeric;
  const monthlyCost = parseSmartInput(scenario.monthlyCostRaw).numeric;
  const monthlyNetProfit = monthlyRev - monthlyCost;
  const annualNetProfit = monthlyNetProfit * 12;
  const netMarginPct =
    monthlyRev > 0 ? (monthlyNetProfit / monthlyRev) * 100 : 0;

  const impliedValuation =
    equityDecimal > 0 ? offerAmount / equityDecimal : 0;

  const peRatio =
    annualNetProfit > 0 ? impliedValuation / annualNetProfit : 0;

  const investorAnnualDividend = annualNetProfit * equityDecimal;
  const paybackYears =
    investorAnnualDividend > 0 ? offerAmount / investorAnnualDividend : 0;

  let verdict = "Laba Bersih Masih Minus / Nol";
  let badgeColor: "mint" | "yellow" | "coral" | "sky" = "coral";
  let explanation =
    "Pastikan pendapatan bulanan lebih besar dari total pengeluaran operasional.";

  if (annualNetProfit > 0) {
    if (scenario.sector === "tech") {
      if (peRatio <= 18) {
        verdict = "Valuasi Tech Sangat Menarik (<18x)";
        badgeColor = "mint";
      } else if (peRatio <= 30) {
        verdict = "Valuasi Tech Wajar / Growth (18x - 30x)";
        badgeColor = "sky";
      } else {
        verdict = "Valuasi Tech Sangat Premium (>30x)";
        badgeColor = "yellow";
      }
      explanation =
        "Perusahaan teknologi / SaaS lazim dihargai P/E di atas 15x karena potensi pertumbuhan skala pengguna yang eksponensial.";
    } else {
      if (peRatio <= 6) {
        verdict = "Valuasi Sangat Murah / Cepat Balik Modal (<6x)";
        badgeColor = "mint";
      } else if (peRatio <= 10) {
        verdict = "Valuasi Wajar Bisnis F&B / Ritel (6x - 10x)";
        badgeColor = "yellow";
      } else {
        verdict = "Valuasi Cenderung Mahal untuk Non-Tech (>10x)";
        badgeColor = "coral";
      }
      explanation =
        "Bisnis F&B, nightlife, atau toko fisik umumnya sehat di kisaran P/E 5x hingga 10x (balik modal di bawah 10 tahun).";
    }
  }

  return {
    offerAmount,
    equityPercent,
    monthlyRev,
    monthlyCost,
    monthlyNetProfit,
    annualNetProfit,
    netMarginPct,
    impliedValuation,
    peRatio,
    investorAnnualDividend,
    paybackYears,
    verdict,
    badgeColor,
    explanation,
  };
}

export function PrivateValuationModule({
  onSaveHistory,
}: PrivateValuationModuleProps) {
  const [mode, setMode] = useState<"single" | "compare">("single");
  const [companyA, setCompanyA] = useState<CompanyScenario>(
    QUICK_COMPANY_EXAMPLES[0]
  );
  const [companyB, setCompanyB] = useState<CompanyScenario>(
    QUICK_COMPANY_EXAMPLES[1]
  );

  const metricsA = evaluateCompany(companyA);
  const metricsB = evaluateCompany(companyB);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`min-h-[48px] border-2 border-neo-black rounded-xl font-bold text-xs uppercase px-3 flex items-center justify-center gap-1.5 transition-all ${
            mode === "single"
              ? "bg-neo-yellow shadow-none translate-x-[1px] translate-y-[1px]"
              : "bg-neo-surface shadow-neo-sm"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hitung P/E Bisnis Privat</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("compare")}
          className={`min-h-[48px] border-2 border-neo-black rounded-xl font-bold text-xs uppercase px-3 flex items-center justify-center gap-1.5 transition-all ${
            mode === "compare"
              ? "bg-neo-sky shadow-none translate-x-[1px] translate-y-[1px]"
              : "bg-neo-surface shadow-neo-sm"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Bandingkan 2 Bisnis</span>
        </button>
      </div>

      {mode === "single" ? (
        <div className="space-y-4">
          <NeoCard
            title="Valuasi & P/E Bisnis Privat (Tanpa Lembar Saham)"
            subtitle="Hitung P/E dari tawaran investasi & pendapatan operasional (Contoh: F&B Holywings vs Tech Startup)"
            badge="PRIVATE EQUITY"
            accent="sky"
          >
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase text-neo-muted mb-1.5">
                  CONTOH KASUS NYATA (KLIK UNTUK COBA):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {QUICK_COMPANY_EXAMPLES.map((ex) => (
                    <button
                      key={ex.name}
                      type="button"
                      onClick={() => setCompanyA(ex)}
                      className="bg-neo-bg border-2 border-neo-black rounded-lg p-2 text-left text-xs font-bold shadow-neo-sm active:translate-y-[1px]"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "fnb", label: "F&B / Holywings / Resto" },
                    { id: "retail", label: "Ritel / Jasa / UMKM" },
                    { id: "tech", label: "Tech Company (PE >15x)" },
                  ] as const
                ).map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() =>
                      setCompanyA((prev) => ({ ...prev, sector: sec.id }))
                    }
                    className={`min-h-[40px] border-2 border-neo-black rounded-lg px-2 py-1 text-[11px] font-bold ${
                      companyA.sector === sec.id
                        ? "bg-neo-yellow"
                        : "bg-neo-surface"
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl space-y-3">
                <p className="text-xs font-bold uppercase border-b border-neo-black/20 pb-1">
                  1. DATA PENAWARAN INVESTASI (EQUITY DEAL)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block">
                      Modal yang Diminta (Ketik 500jt / 1.5m)
                    </label>
                    <input
                      type="text"
                      value={companyA.offerInvestmentRaw}
                      onChange={(e) =>
                        setCompanyA((prev) => ({
                          ...prev,
                          offerInvestmentRaw: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] mt-1 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono font-bold text-sm"
                    />
                    <span className="text-[11px] font-mono text-neo-muted">
                      Terbaca: {formatCompactIDR(metricsA.offerAmount)}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-bold block">
                      Saham / Bagi Hasil Didapat (Contoh: 10%)
                    </label>
                    <input
                      type="text"
                      value={companyA.equityShareRaw}
                      onChange={(e) =>
                        setCompanyA((prev) => ({
                          ...prev,
                          equityShareRaw: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] mt-1 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono font-bold text-sm"
                    />
                    <span className="text-[11px] font-mono text-neo-muted">
                      Porsi: {formatPercent(metricsA.equityPercent, 2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neo-bg border-2 border-neo-black rounded-xl space-y-3">
                <p className="text-xs font-bold uppercase border-b border-neo-black/20 pb-1">
                  2. PENDAPATAN & PENGELUARAN RATA-RATA BULANAN
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block">
                      Rata-Rata Penjualan / Omzet per Bulan
                    </label>
                    <input
                      type="text"
                      value={companyA.monthlyRevenueRaw}
                      onChange={(e) =>
                        setCompanyA((prev) => ({
                          ...prev,
                          monthlyRevenueRaw: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] mt-1 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono font-bold text-sm"
                    />
                    <span className="text-[11px] font-mono text-neo-muted">
                      Omzet: {formatCompactIDR(metricsA.monthlyRev)} / bln
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-bold block">
                      Total Biaya (HPP + Sewa + Gaji) per Bulan
                    </label>
                    <input
                      type="text"
                      value={companyA.monthlyCostRaw}
                      onChange={(e) =>
                        setCompanyA((prev) => ({
                          ...prev,
                          monthlyCostRaw: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] mt-1 bg-neo-surface border-2 border-neo-black rounded-lg px-3 font-mono font-bold text-sm"
                    />
                    <span className="text-[11px] font-mono text-neo-muted">
                      Biaya: {formatCompactIDR(metricsA.monthlyCost)} / bln
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </NeoCard>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neo-surface border-2 border-neo-black rounded-xl shadow-neo p-3.5">
              <p className="text-[10px] font-bold uppercase text-neo-muted">
                VALUASI 100% PERUSAHAAN
              </p>
              <p className="font-mono text-lg font-bold mt-1">
                {formatCompactIDR(metricsA.impliedValuation)}
              </p>
              <p className="text-[11px] text-neo-muted mt-0.5">
                Dari tawaran {formatPercent(metricsA.equityPercent, 1)} saham
              </p>
            </div>

            <div className="bg-neo-surface border-2 border-neo-black rounded-xl shadow-neo p-3.5">
              <p className="text-[10px] font-bold uppercase text-neo-muted">
                LABA BERSIH 1 TAHUN
              </p>
              <p className="font-mono text-lg font-bold mt-1">
                {formatCompactIDR(metricsA.annualNetProfit)}
              </p>
              <p className="text-[11px] text-neo-muted mt-0.5">
                Net Margin: {formatPercent(metricsA.netMarginPct, 1)}
              </p>
            </div>

            <div className="col-span-2 bg-neo-mint border-2 border-neo-black rounded-xl shadow-neo p-4 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase bg-neo-surface border border-neo-black rounded px-2 py-0.5">
                  HASIL RASIO P/E TANPA LEMBAR SAHAM
                </span>
                <p className="font-mono text-3xl font-bold mt-1">
                  {formatNumber(metricsA.peRatio, 2)}x
                </p>
                <p className="text-xs font-medium mt-0.5">
                  Estimasi Balik Modal: ~{formatNumber(metricsA.paybackYears, 1)} Tahun
                </p>
              </div>
              <div className="text-right font-mono bg-neo-surface border-2 border-neo-black rounded-lg p-2.5">
                <p className="text-[10px] font-bold uppercase text-neo-muted">
                  DIVIDENMU / THN
                </p>
                <p className="text-sm font-bold">
                  {formatCompactIDR(metricsA.investorAnnualDividend)}
                </p>
              </div>
            </div>
          </div>

          <NeoCard
            title={metricsA.verdict}
            accent={metricsA.badgeColor}
            badge="ANALISIS PEMULA"
          >
            <p className="text-xs font-medium leading-relaxed">
              {metricsA.explanation}
            </p>
          </NeoCard>

          <NeoReceipt
            module="valuation"
            title={`Valuasi P/E ${companyA.name}`}
            formula="PE = (Modal_Tawaran / Persen_Saham) / ((Omzet_Bln - Biaya_Bln) * 12)"
            variables={{
              Valuasi: metricsA.impliedValuation,
              Laba_Tahunan: metricsA.annualNetProfit,
              Modal_Masuk: metricsA.offerAmount,
            }}
            substituted={`PE = ${formatCompactIDR(metricsA.impliedValuation)} / ${formatCompactIDR(metricsA.annualNetProfit)}`}
            resultFormatted={`P/E ${formatNumber(metricsA.peRatio, 2)}x (Balik Modal ${formatNumber(metricsA.paybackYears, 1)} Thn)`}
            rawResult={metricsA.peRatio}
            onSaveHistory={onSaveHistory}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <NeoCard
            title="Komparasi 2 Penawaran Bisnis (Bisnis A vs Bisnis B)"
            subtitle="Bandingkan mana investasi yang lebih murah P/E-nya dan lebih cepat balik modal"
            badge="HEAD TO HEAD"
            accent="lilac"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  {
                    label: "BISNIS A",
                    data: companyA,
                    setter: setCompanyA,
                    accent: "bg-neo-yellow/40",
                  },
                  {
                    label: "BISNIS B",
                    data: companyB,
                    setter: setCompanyB,
                    accent: "bg-neo-sky/40",
                  },
                ] as const
              ).map((col) => (
                <div
                  key={col.label}
                  className={`${col.accent} border-2 border-neo-black rounded-xl p-3 space-y-2.5`}
                >
                  <span className="text-xs font-mono font-bold bg-neo-surface border border-neo-black rounded px-2 py-0.5">
                    {col.label}
                  </span>
                  <div>
                    <label className="text-[11px] font-bold block">Nama Bisnis</label>
                    <input
                      type="text"
                      value={col.data.name}
                      onChange={(e) =>
                        col.setter((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full min-h-[40px] bg-neo-surface border-2 border-neo-black rounded-lg px-2.5 text-xs font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold block">Modal Masuk</label>
                      <input
                        type="text"
                        value={col.data.offerInvestmentRaw}
                        onChange={(e) =>
                          col.setter((prev) => ({
                            ...prev,
                            offerInvestmentRaw: e.target.value,
                          }))
                        }
                        className="w-full min-h-[40px] bg-neo-surface border-2 border-neo-black rounded-lg px-2 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold block">Dapat Saham</label>
                      <input
                        type="text"
                        value={col.data.equityShareRaw}
                        onChange={(e) =>
                          col.setter((prev) => ({
                            ...prev,
                            equityShareRaw: e.target.value,
                          }))
                        }
                        className="w-full min-h-[40px] bg-neo-surface border-2 border-neo-black rounded-lg px-2 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold block">Omzet / Bln</label>
                      <input
                        type="text"
                        value={col.data.monthlyRevenueRaw}
                        onChange={(e) =>
                          col.setter((prev) => ({
                            ...prev,
                            monthlyRevenueRaw: e.target.value,
                          }))
                        }
                        className="w-full min-h-[40px] bg-neo-surface border-2 border-neo-black rounded-lg px-2 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold block">Biaya / Bln</label>
                      <input
                        type="text"
                        value={col.data.monthlyCostRaw}
                        onChange={(e) =>
                          col.setter((prev) => ({
                            ...prev,
                            monthlyCostRaw: e.target.value,
                          }))
                        }
                        className="w-full min-h-[40px] bg-neo-surface border-2 border-neo-black rounded-lg px-2 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeoCard>

          <div className="bg-neo-surface border-2 border-neo-black rounded-xl shadow-neo overflow-hidden">
            <div className="bg-neo-mint border-b-2 border-neo-black px-4 py-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">
                HASIL PERBANDINGAN LANGSUNG
              </span>
            </div>
            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-3 gap-2 border-b border-neo-black/20 pb-2 font-bold">
                <span>METRIK</span>
                <span>{companyA.name}</span>
                <span>{companyB.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-neo-black/10 pb-2">
                <span className="font-sans font-bold">Valuasi 100%</span>
                <span>{formatCompactIDR(metricsA.impliedValuation)}</span>
                <span>{formatCompactIDR(metricsB.impliedValuation)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-neo-black/10 pb-2">
                <span className="font-sans font-bold">Laba Bersih/Thn</span>
                <span>{formatCompactIDR(metricsA.annualNetProfit)}</span>
                <span>{formatCompactIDR(metricsB.annualNetProfit)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-neo-black/10 pb-2">
                <span className="font-sans font-bold">Margin Bersih</span>
                <span>{formatPercent(metricsA.netMarginPct, 1)}</span>
                <span>{formatPercent(metricsB.netMarginPct, 1)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-neo-black/10 pb-2">
                <span className="font-sans font-bold">Rasio P/E</span>
                <span className="font-bold">{formatNumber(metricsA.peRatio, 2)}x</span>
                <span className="font-bold">{formatNumber(metricsB.peRatio, 2)}x</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-sans font-bold">Balik Modal</span>
                <span className="font-bold">
                  {formatNumber(metricsA.paybackYears, 1)} Thn
                </span>
                <span className="font-bold">
                  {formatNumber(metricsB.paybackYears, 1)} Thn
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
