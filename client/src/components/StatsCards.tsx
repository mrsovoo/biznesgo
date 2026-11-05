import React from "react";
import { Stats } from "../types";
import { Package, Users, Layers, Activity } from "lucide-react";

interface StatsCardsProps {
  stats: Stats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const unitList = Object.entries(stats.byUnit || {});

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jami Dorilar</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <Activity className="w-3 h-3" />
            Bazada saqlangan
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Foydalanuvchilar</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.uniqueUsers}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Kiritgan Telegram ID lar</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between col-span-1 sm:col-span-2">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Birliklar bo'yicha taqsimot</p>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {unitList.length > 0 ? (
              unitList.map(([unit, count]) => (
                <span
                  key={unit}
                  className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200"
                >
                  <span className="capitalize">{unit}:</span>
                  <span className="font-bold text-indigo-600">{count} ta</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Hozircha ma'lumot yo'q</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

