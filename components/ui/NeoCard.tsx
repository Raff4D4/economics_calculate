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
      className={`bg-neo-surface border-3 border-neo-black shadow-neo overflow-hidden ${className}`}
    >
      {title && (
        <header
          className={`${ACCENT_MAP[accent]} border-b-3 border-neo-black px-4 py-3 flex items-center justify-between gap-2`}
        >
          <div>
            <h2 className="font-bold text-base tracking-tight leading-snug text-neo-black uppercase">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs font-medium text-neo-black/80 mt-0.5">{subtitle}</p>
            )}
          </div>
          {badge && (
            <span className="bg-neo-surface border-2 border-neo-black px-2.5 py-1 text-xs font-mono font-bold shadow-neo-sm shrink-0">
              {badge}
            </span>
          )}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

