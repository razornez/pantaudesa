"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  TrendingUp, MessageSquare, CheckCircle2, Clock, AlertCircle, Trophy,
} from "lucide-react";
import {
  getVoiceStats, getDesaRanking, getCategoryStats,
  VOICE_CATEGORIES, STATUS_CONFIG, VoiceCategory,
} from "@/lib/citizen-voice";
import { mockDesa } from "@/lib/mock-data";

// ─── Desa lookup ──────────────────────────────────────────────────────────────

const desaMap = Object.fromEntries(mockDesa.map(d => [d.id, d.nama]));

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, bg, text,
}: {
  icon: React.ElementType; label: string; value: number | string;
  sub?: string; bg: string; text: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${bg} border border-current/10`}>
      <div className={`w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center mb-3 ${text}`}>
        <Icon size={18} />
      </div>
      <p className={`text-2xl font-black ${text}`}>{value}</p>
      <p className={`text-xs font-semibold mt-0.5 ${text} opacity-80`}>{label}</p>
      {sub && <p className={`text-[11px] mt-1 ${text} opacity-60`}>{sub}</p>}
    </div>
  );
}

// ─── Custom tooltip untuk BarChart ────────────────────────────────────────────

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-indigo-600">{payload[0].value} suara total</p>
      {payload[1] && <p className="text-emerald-600">{payload[1].value} diselesaikan</p>}
    </div>
  );
}

// ─── Desa ranking row ─────────────────────────────────────────────────────────

function DesaRankRow({
  rank, desaId, total, open, resolved,
}: {
  rank: number; desaId: string; total: number; open: number; resolved: number;
}) {
  const nama = desaMap[desaId] ?? `Desa ${desaId}`;
  const pct  = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-7 text-center">
        {medal
          ? <span className="text-base">{medal}</span>
          : <span className="text-xs font-bold text-slate-400">#{rank}</span>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{nama}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 flex-shrink-0">{pct}% selesai</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-black text-slate-800">{total}</p>
        <p className="text-[10px] text-slate-400">suara</p>
      </div>

      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <span className="text-[10px] text-rose-600 font-medium">{open} belum</span>
        <span className="text-[10px] text-emerald-600 font-medium">{resolved} selesai</span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function VoiceStats() {
  const stats    = getVoiceStats();
  const ranking  = getDesaRanking();
  const catStats = getCategoryStats();

  // Bar chart data
  const barData = catStats.map(cs => ({
    name: VOICE_CATEGORIES[cs.category as VoiceCategory].label,
    emoji: VOICE_CATEGORIES[cs.category as VoiceCategory].emoji,
    total: cs.total,
    resolved: cs.resolved,
  }));

  // Pie chart data
  const pieData = [
    { name: STATUS_CONFIG.open.label,        value: stats.open,        fill: "#f43f5e" },
    { name: STATUS_CONFIG.in_progress.label, value: stats.inProgress,  fill: "#f59e0b" },
    { name: STATUS_CONFIG.resolved.label,    value: stats.resolved,     fill: "#10b981" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={MessageSquare} label="Total Suara" value={stats.total}
          sub={`dari ${stats.desaCount} desa`}
          bg="bg-indigo-50" text="text-indigo-700"
        />
        <StatCard
          icon={AlertCircle} label="Belum Ditangani" value={stats.open}
          bg="bg-rose-50" text="text-rose-700"
        />
        <StatCard
          icon={Clock} label="Sedang Diproses" value={stats.inProgress}
          bg="bg-amber-50" text="text-amber-700"
        />
        <StatCard
          icon={CheckCircle2} label="Sudah Selesai" value={stats.resolved}
          sub={stats.avgResolutionDays ? `avg. ${stats.avgResolutionDays} hari` : undefined}
          bg="bg-emerald-50" text="text-emerald-700"
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">

        {/* Bar chart – by category */}
        <div className="sm:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-indigo-500" />
            <p className="text-sm font-bold text-slate-800">Suara per Kategori</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={16} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={36}
              />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Total">
                {barData.map((_, i) => (
                  <Cell key={i} fill={["#6366f1","#10b981","#0ea5e9","#f59e0b","#14b8a6","#94a3b8"][i % 6]} />
                ))}
              </Bar>
              <Bar dataKey="resolved" radius={[4, 4, 0, 0]} fill="#d1fae5" name="Selesai" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart – by status */}
        <div className="sm:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={15} className="text-emerald-500" />
            <p className="text-sm font-bold text-slate-800">Status Penanganan</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={65}
                paddingAngle={3}
              >
                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ fontSize: 10, color: "#64748b" }}>{value}</span>}
              />
              <Tooltip formatter={(v) => [`${v} suara`, ""]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Desa ranking ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={15} className="text-amber-500" />
          <p className="text-sm font-bold text-slate-800">Desa Paling Aktif Bersuara</p>
        </div>
        <div>
          {ranking.map((r, i) => (
            <DesaRankRow
              key={r.desaId}
              rank={i + 1}
              desaId={r.desaId}
              total={r.total}
              open={r.open}
              resolved={r.resolved}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
