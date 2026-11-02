"use client";

import React from "react";
import { NeoColor } from "@/lib/types";

interface NeoButtonProps {
  variant?: NeoColor;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const VARIANT_CLASSES: Record<NeoColor, string> = {
  yellow: "bg-neo-yellow text-neo-black",
  mint: "bg-neo-mint text-neo-black",
  coral: "bg-neo-coral text-neo-black",
  lilac: "bg-neo-lilac text-neo-black",
  sky: "bg-neo-sky text-neo-black",
  orange: "bg-neo-orange text-neo-black",
  white: "bg-neo-surface text-neo-black",
};

const SIZE_CLASSES = {
  sm: "min-h-[42px] px-3 py-1.5 text-xs",
  md: "min-h-[48px] px-4 py-2.5 text-sm",
  lg: "min-h-[54px] px-5 py-3 text-base",
};

export function NeoButton({
  variant = "yellow",
  size = "md",
  fullWidth = false,
  onClick,
  children,
  disabled = false,
  type = "button",
  className = "",
}: NeoButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${
        fullWidth ? "w-full" : ""
      } font-bold border-3 border-neo-black shadow-neo transition-all duration-75 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 select-none ${className}`}
    >
      {children}
    </button>
  );
}

