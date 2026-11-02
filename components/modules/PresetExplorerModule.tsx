"use client";

import React, { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { ECONOMIC_PRESETS } from "@/lib/engine/presets";
import { EconomicPreset, PresetCategory } from "@/lib/types";
import { NeoCard } from "@/components/ui/NeoCard";

interface PresetExplorerModuleProps {
  onPickPreset: (preset: EconomicPreset) => void;
}

const CATEGORIES: PresetCategory[] = [
  "Semua",
  "Cari Modal & Untung",
  "UMKM & F&B",
  "Valuasi & Investor",
  "Bank & Tabungan",
  "Makro & Mikro",
];

export function PresetExplorerModule({
  onPickPreset,
}: PresetExplorerModuleProps) {
  const [category, setCategory] = useState<PresetCategory>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = ECONOMIC_PRESETS.filter((preset) => {
    const matchesCat = category === "Semua" || preset.category === category;
    const matchesQuery =
      preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.simpleExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-4">
      <NeoCard
        title="Perpustakaan 18+ Rumus Ekonomi & Bisnis"
        subtitle="Pilih rumus apa saja, lalu ketik angkanya (20jt, 10%, 10thn) langsung di dalam kotak rumusnya"
        badge={`${ECONOMIC_PRESETS.length} PRESET`}
        accent="mint"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-neo-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari rumus (misal: Modal, PE, BEP, KPR, Food Cost)..."
              className="w-full min-h-[44px] bg-neo-bg border-2 border-neo-black rounded-lg pl-9 pr-3 text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-[38px] px-3 py-1 border-2 border-neo-black rounded-lg font-bold text-xs shrink-0 transition-all ${
                  category === cat
                    ? "bg-neo-yellow shadow-none translate-x-[1px] translate-y-[1px]"
                    : "bg-neo-surface shadow-neo-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </NeoCard>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPickPreset(preset)}
            className="bg-neo-surface border-2 border-neo-black rounded-xl p-4 text-left shadow-neo hover:bg-neo-yellow/20 transition-all space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase bg-neo-sky border border-neo-black rounded px-2 py-0.5">
                {preset.category}
              </span>
              <span className="text-xs font-bold flex items-center gap-1 text-neo-black">
                <span>Pakai Rumus</span>
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            <h3 className="font-bold text-sm">{preset.title}</h3>
            <p className="text-xs text-neo-muted leading-relaxed">
              {preset.simpleExplanation}
            </p>

            <div className="bg-neo-lcd border border-neo-black rounded-lg px-3 py-2 font-mono text-xs font-bold break-all">
              {preset.formula}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
