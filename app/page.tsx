"use client";

import React, { useState, useEffect } from "react";
import {
  Calculator,
  Building2,
  Coins,
  BookOpen,
  History,
  Trash2,
  X,
} from "lucide-react";
import { AppTab, CalculationHistoryItem, EconomicPreset } from "@/lib/types";
import { ECONOMIC_PRESETS } from "@/lib/engine/presets";
import {
  getSavedHistory,
  saveHistoryItem,
  clearSavedHistory,
} from "@/lib/storage";
import { ScientificSlotModule } from "@/components/modules/ScientificSlotModule";
import { PrivateValuationModule } from "@/components/modules/PrivateValuationModule";
import { SimpleCapitalCompoundModule } from "@/components/modules/SimpleCapitalCompoundModule";
import { PresetExplorerModule } from "@/components/modules/PresetExplorerModule";
import { NeoButton } from "@/components/ui/NeoButton";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<AppTab>("scientific");
  const [selectedPreset, setSelectedPreset] = useState<EconomicPreset>(
    ECONOMIC_PRESETS[0]
  );
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(getSavedHistory());
  }, []);

  const handleSaveHistory = (
    item: Omit<CalculationHistoryItem, "id" | "timestamp">
  ) => {
    setHistory(saveHistoryItem(item));
  };

  const handleClearHistory = () => {
    clearSavedHistory();
    setHistory([]);
  };

  const handlePickPreset = (preset: EconomicPreset) => {
    setSelectedPreset(preset);
    setActiveTab("scientific");
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-neo-bg border-x-2 border-neo-black shadow-neo-lg flex flex-col justify-between pb-24 relative">
      <header className="sticky top-0 z-30 bg-neo-surface border-b-2 border-neo-black px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-neo-yellow border-2 border-neo-black rounded-xl shadow-neo-sm flex items-center justify-center">
            <Calculator className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base sm:text-lg tracking-tight leading-none">
                ECONOBRUTAL
              </h1>
              <span className="bg-neo-mint border border-neo-black rounded px-1.5 py-0.5 text-[10px] font-mono font-bold">
                V2 RAMAH PEMULA
              </span>
            </div>
            <p className="text-[11px] font-medium text-neo-muted mt-0.5">
              Ketik 20jt, 10%, 10thn Langsung di Rumus
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="min-h-[40px] bg-neo-bg border-2 border-neo-black rounded-lg px-3 py-1.5 shadow-neo-sm font-mono text-xs font-bold flex items-center gap-1.5"
        >
          <History className="w-4 h-4" />
          <span>{history.length}</span>
        </button>
      </header>

      <main className="p-4 flex-1">
        {activeTab === "scientific" && (
          <ScientificSlotModule
            selectedPreset={selectedPreset}
            onSelectPreset={setSelectedPreset}
            onSaveHistory={handleSaveHistory}
          />
        )}
        {activeTab === "valuation" && (
          <PrivateValuationModule onSaveHistory={handleSaveHistory} />
        )}
        {activeTab === "capital" && (
          <SimpleCapitalCompoundModule onSaveHistory={handleSaveHistory} />
        )}
        {activeTab === "presets" && (
          <PresetExplorerModule onPickPreset={handlePickPreset} />
        )}
      </main>

      {showHistory && (
        <div className="fixed inset-0 z-50 bg-neo-black/50 flex items-end justify-center">
          <div className="w-full max-w-lg max-h-[80vh] bg-neo-bg border-t-2 border-x-2 border-neo-black rounded-t-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b-2 border-neo-black pb-2.5">
              <h2 className="font-bold text-sm uppercase">
                Riwayat Hitungan Tersimpan ({history.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="p-1.5 bg-neo-coral border-2 border-neo-black rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {history.length === 0 ? (
                <div className="bg-neo-surface border-2 border-neo-black rounded-xl p-6 text-center font-mono text-xs font-bold">
                  Belum ada riwayat perhitungan yang disimpan.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-neo-surface border-2 border-neo-black rounded-xl p-3 shadow-neo-sm space-y-1 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{item.title}</span>
                      <span className="text-[10px] bg-neo-yellow border border-neo-black rounded px-1.5 py-0.5">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-neo-muted break-all">
                      {item.substituted}
                    </p>
                    <p className="font-bold text-sm bg-neo-mint/60 border border-neo-black rounded px-2 py-1 inline-block">
                      {item.resultFormatted}
                    </p>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <NeoButton
                variant="coral"
                size="sm"
                fullWidth
                onClick={handleClearHistory}
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Semua Riwayat</span>
              </NeoButton>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto bg-neo-surface border-t-2 border-x-2 border-neo-black grid grid-cols-4">
        <button
          type="button"
          onClick={() => setActiveTab("scientific")}
          className={`min-h-[62px] flex flex-col items-center justify-center gap-1 border-r border-neo-black/20 font-bold text-[11px] transition-colors ${
            activeTab === "scientific" ? "bg-neo-yellow" : "bg-neo-surface"
          }`}
        >
          <Calculator className="w-5 h-5 stroke-[2.2]" />
          <span>Rumus Interaktif</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("valuation")}
          className={`min-h-[62px] flex flex-col items-center justify-center gap-1 border-r border-neo-black/20 font-bold text-[11px] transition-colors ${
            activeTab === "valuation" ? "bg-neo-sky" : "bg-neo-surface"
          }`}
        >
          <Building2 className="w-5 h-5 stroke-[2.2]" />
          <span>Valuasi P/E</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("capital")}
          className={`min-h-[62px] flex flex-col items-center justify-center gap-1 border-r border-neo-black/20 font-bold text-[11px] transition-colors ${
            activeTab === "capital" ? "bg-neo-mint" : "bg-neo-surface"
          }`}
        >
          <Coins className="w-5 h-5 stroke-[2.2]" />
          <span>Modal & Bunga</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`min-h-[62px] flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
            activeTab === "presets" ? "bg-neo-lilac" : "bg-neo-surface"
          }`}
        >
          <BookOpen className="w-5 h-5 stroke-[2.2]" />
          <span>18+ Preset</span>
        </button>
      </nav>
    </div>
  );
}
