"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Desa } from "@/lib/types";

interface Props {
  desa: Desa;
}

const fmt = (v: number) =>
  v >= 1_000_000_000 ? `Rp ${(v / 1_000_000_000).toFixed(1)} M` : `Rp ${(v / 1_000_000).toFixed(0)} Jt`;

export default function BudgetBarChart({ desa }: Props) {
  const data = [
    {
      name: "Anggaran",
      anggaran: desa.totalAnggaran,
      realisasi: 0,
      selisih: 0,
    },
    {
      name: "Realisasi",
      anggaran: 0,
      realisasi: desa.terealisasi,
      selisih: 0,
    },
    {
      name: "Selisih",
      anggaran: 0,
      realisasi: 0,
      selisih: desa.totalAnggaran - desa.terealisasi,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <h2 className="text-base font-semibold text-slate-800 mb-1">Perbandingan Anggaran & Realisasi</h2>
      <p className="text-xs text-slate-500 mb-4">Tahun Anggaran {desa.tahun}</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}M`}
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value, name) => [fmt(Number(value)), name === "anggaran" ? "Anggaran" : name === "realisasi" ? "Realisasi" : "Selisih"]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: 12 }}
          />
          <Bar dataKey="anggaran" fill="#818CF8" radius={[6, 6, 0, 0]} maxBarSize={60} />
          <Bar dataKey="realisasi" fill="#34D399" radius={[6, 6, 0, 0]} maxBarSize={60} />
          <Bar dataKey="selisih" fill="#FB7185" radius={[6, 6, 0, 0]} maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
