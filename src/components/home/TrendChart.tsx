"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendData } from "@/lib/types";
import { SECTION } from "@/lib/copy";

interface Props {
  data: TrendData[];
}

function formatTooltipValue(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  return `Rp ${(value / 1_000_000).toFixed(0)} Jt`;
}

export default function TrendChart({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">{SECTION.tren}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{SECTION.trenSub}</p>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAnggaran" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#818CF8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRealisasi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#34D399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(0)}M`}
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip
            formatter={(value, name) => [
              formatTooltipValue(Number(value)),
              name === "anggaran" ? "Total Anggaran" : "Sudah Dipakai",
            ]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: 12 }}
          />
          <Legend
            formatter={(v) => (v === "anggaran" ? "Total Anggaran" : "Sudah Dipakai")}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Area type="monotone" dataKey="anggaran"   stroke="#818CF8" strokeWidth={2} fill="url(#colorAnggaran)"  dot={false} />
          <Area type="monotone" dataKey="realisasi"  stroke="#34D399" strokeWidth={2} fill="url(#colorRealisasi)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
