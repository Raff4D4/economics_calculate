"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCompactIDR } from "@/lib/formatters";

export interface GrowthChartPoint {
  yearLabel: string;
  principal: number;
  interest: number;
  total: number;
}

interface NeoChartProps {
  data: GrowthChartPoint[];
}

export function NeoChart({ data }: NeoChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 w-full bg-neo-bg border-3 border-neo-black flex items-center justify-center font-mono text-xs font-bold">
        MEMUAT GRAFIK PERTUMBUHAN...
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-neo-surface border-3 border-neo-black shadow-neo-sm p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(18, 18, 18)" strokeOpacity={0.2} />
          <XAxis
            dataKey="yearLabel"
            tick={{ fill: "rgb(18, 18, 18)", fontSize: 11, fontWeight: 700 }}
            stroke="rgb(18, 18, 18)"
          />
          <YAxis
            tickFormatter={(val) => formatCompactIDR(Number(val))}
            tick={{ fill: "rgb(18, 18, 18)", fontSize: 10, fontWeight: 700 }}
            stroke="rgb(18, 18, 18)"
            width={68}
          />
          <Tooltip
            formatter={(value: unknown) => formatCompactIDR(Number(value))}
            contentStyle={{
              backgroundColor: "rgb(255, 255, 255)",
              border: "3px solid rgb(18, 18, 18)",
              boxShadow: "4px 4px 0px 0px rgb(18, 18, 18)",
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "11px",
              fontWeight: 700,
              paddingTop: "4px",
            }}
          />
          <Bar
            dataKey="principal"
            name="Total Pokok"
            stackId="a"
            fill="rgb(125, 249, 255)"
            stroke="rgb(18, 18, 18)"
            strokeWidth={2}
          />
          <Bar
            dataKey="interest"
            name="Akumulasi Bunga"
            stackId="a"
            fill="rgb(0, 240, 168)"
            stroke="rgb(18, 18, 18)"
            strokeWidth={2}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

