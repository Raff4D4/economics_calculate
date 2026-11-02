"use client";

import React from "react";
import { NeoColor } from "@/lib/types";

interface NeoCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  accent?: NeoColor;
  children: React.ReactNode;
  className?: string;
}

const ACCENT_MAP: Record<NeoColor, string> = {
  yellow: "bg-neo-yellow",
  mint: "bg-neo-mint",
  coral: "bg-neo-coral",
  lilac: "bg-neo-lilac",
  sky: "bg-neo-sky",
  orange: "bg-neo-orange",
  white: "bg-neo-surface",
};

export function NeoCard({
  title,
  subtitle,
  badge,
  accent = "yellow",
  children,
  className = "",
}: NeoCardProps) {
  return (
    <section
      className={`bg-neo-surface border-2 border-neo-black rounded-xl shadow-neo overflow-hidden ${className}`}
    >
      {title && (
        <header
          className={`${ACCENT_MAP[accent]} border-b-2 border-neo-black px-4 py-3 flex items-center justify-between gap-2`}
        >
          <div>
            <h2 className="font-bold text-sm sm:text-base tracking-tight leading-snug text-neo-black">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs font-medium text-neo-black/75 mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {badge && (
            <span className="bg-neo-surface border-2 border-neo-black rounded-md px-2.5 py-1 text-[11px] font-mono font-bold shadow-neo-sm shrink-0">
              {badge}
            </span>
          )}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
