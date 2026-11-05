import React from "react";
import { Pill, RefreshCw, Database } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, loading, totalCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">BiznesGo</h1>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Faol
              </span>
            </div>
            <p className="text-xs text-slate-500">Dori hisobi va nazorati paneli</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Neon PostgreSQL</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-800">{totalCount} ta dori</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm transition disabled:opacity-50"
            title="Yangilash"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>
    </header>
  );
};

