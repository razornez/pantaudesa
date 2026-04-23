"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { SummaryStats } from "@/lib/types";

interface Props {
  stats: SummaryStats;
}

export default function SerapanDonut({ stats }: Props) {
  const data = [
    { name: "Baik (≥85%)", value: stats.desaSerapanBaik, fill: "#34D399" },
    { name: "Sedang (60–84%)", value: stats.desaSerapanSedang, fill: "#FBBF24" },
    { name: "Rendah (<60%)", value: stats.desaSerapanRendah, fill: "#FB7185" },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="mb-2">
        <h2 className="text-base font-semibold text-slate-800">Distribusi Status Serapan</h2>
        <p className="text-xs text-slate-500 mt-0.5">Proporsi desa berdasarkan kategori serapan</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          />
          <Tooltip
            formatter={(value, name) => [String(value) + " desa", name]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
