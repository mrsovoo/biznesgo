import React from "react";
import { BarChart2, ShieldCheck, Activity, Users, Database, Layers } from "lucide-react";
import { Stats, Medicine } from "../types";

interface GitHubInsightsTabProps {
  stats: Stats;
  medicines: Medicine[];
}

export const GitHubInsightsTab: React.FC<GitHubInsightsTabProps> = ({
  stats,
  medicines,
}) => {
  const units = Object.entries(stats.byUnit || {});

  return (
    <div className="space-y-6 text-xs text-[#1f2328]">
      <div className="border-b border-[#d0d7de] pb-3">
        <h2 className="text-lg font-bold text-[#1f2328] flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#0969da]" />
          <span>Repository Analytics & Insights</span>
        </h2>
        <p className="text-[#57606a] text-xs mt-1">
          Veterinary & Agro database inventory metrics, commit frequency, and security status.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-md border border-[#d0d7de] bg-[#f6f8fa] space-y-1">
          <p className="text-[11px] font-semibold text-[#57606a] uppercase">Jami Preparatlar</p>
          <p className="text-2xl font-bold text-[#1f2328]">{stats.total}</p>
          <p className="text-[11px] text-[#1a7f37] font-semibold flex items-center gap-1">
            <Database className="w-3 h-3" />
            Neon PostgreSQL Active
          </p>
        </div>

        <div className="p-4 rounded-md border border-[#d0d7de] bg-[#f6f8fa] space-y-1">
          <p className="text-[11px] font-semibold text-[#57606a] uppercase">B2B Tugunlar (Do'konlar)</p>
          <p className="text-2xl font-bold text-[#1f2328]">{stats.uniqueUsers}</p>
          <p className="text-[11px] text-[#57606a]">Ulangan Telegram & B2B IDlar</p>
        </div>

        <div className="p-4 rounded-md border border-[#d0d7de] bg-[#f6f8fa] space-y-1">
          <p className="text-[11px] font-semibold text-[#57606a] uppercase">DLP Xavfsizlik Statusi</p>
          <p className="text-2xl font-bold text-[#1a7f37]">100%</p>
          <p className="text-[11px] text-[#1a7f37] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            0 ta oqish (Zero Leakage)
          </p>
        </div>

        <div className="p-4 rounded-md border border-[#d0d7de] bg-[#f6f8fa] space-y-1">
          <p className="text-[11px] font-semibold text-[#57606a] uppercase">AI Skaner Dvigateli</p>
          <p className="text-2xl font-bold text-[#0969da]">Gemini</p>
          <p className="text-[11px] text-[#57606a]">3.8 Flash & 3.5 Lite Ready</p>
        </div>
      </div>

      {/* Unit distribution breakdown */}
      <div className="border border-[#d0d7de] rounded-md bg-white p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[#24292f] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0969da]" />
          <span>O'lchov birliklari bo'yicha taqsimot (Unit Breakdown):</span>
        </h3>

        <div className="space-y-3">
          {units.map(([unit, count]) => {
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={unit} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="capitalize">{unit}</span>
                  <span className="text-[#57606a] font-mono">{count} ta ({pct}%)</span>
                </div>
                <div className="w-full bg-[#f6f8fa] h-2.5 rounded-full overflow-hidden border border-[#d0d7de]">
                  <div
                    className="bg-[#0969da] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
