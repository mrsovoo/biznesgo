import React from "react";
import { Medicine } from "../types";
import {
  GitBranch,
  Search,
  Filter,
  Trash2,
  Eye,
  FileText,
  Image as ImageIcon,
  History,
  Send,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";

interface GitHubMedicineTableProps {
  medicines: Medicine[];
  loading: boolean;
  onDelete: (id: number) => void;
  onViewImage: (url: string, name: string) => void;
  onRefresh: () => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedUnit: string;
  setSelectedUnit: (u: string) => void;
}

export const GitHubMedicineTable: React.FC<GitHubMedicineTableProps> = ({
  medicines,
  loading,
  onDelete,
  onViewImage,
  onRefresh,
  searchTerm,
  setSearchTerm,
  selectedUnit,
  setSelectedUnit,
}) => {
  const getUnitPillStyle = (unit: string) => {
    const u = unit.toLowerCase();
    if (u.includes("litr") || u.includes("ml")) {
      return "bg-[#ddf4ff] text-[#0969da] border-[#54aeff]/40";
    }
    if (u.includes("kg") || u.includes("gramm")) {
      return "bg-[#fff8c5] text-[#9a6700] border-[#d4a72c]/40";
    }
    if (u.includes("dona")) {
      return "bg-[#dafbe1] text-[#1a7f37] border-[#4ac26b]/40";
    }
    return "bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]";
  };

  return (
    <div className="space-y-4">
      {/* GitHub Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Selector */}
          <div className="inline-flex items-center space-x-1.5 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] rounded-md px-3 py-1.5 text-xs font-semibold text-[#24292f] shadow-xs cursor-pointer">
            <GitBranch className="w-3.5 h-3.5 text-[#57606a]" />
            <span>main</span>
          </div>

          <span className="text-xs text-[#57606a] hidden sm:inline">
            <b>1</b> branch · <b>0</b> tags
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#57606a] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da] w-48 sm:w-60 text-[#24292f] shadow-xs"
            />
          </div>

          {/* Unit filter */}
          <div className="flex items-center space-x-1">
            <Filter className="w-3 h-3 text-[#57606a]" />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="text-xs bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] rounded-md px-2.5 py-1.5 font-semibold text-[#24292f] shadow-xs focus:outline-none"
            >
              <option value="all">All Units</option>
              <option value="litr">Litr</option>
              <option value="ml">ml</option>
              <option value="kg">kg</option>
              <option value="gramm">Gramm</option>
              <option value="dona">Dona</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-1.5 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] text-[#24292f] text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xs transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#57606a] ${loading ? "animate-spin text-[#0969da]" : ""}`} />
          </button>

          {/* Green GitHub action button */}
          <a
            href="https://t.me/biznesgo_bot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Botga o'tish</span>
          </a>
        </div>
      </div>

      {/* GitHub Repository Content Container */}
      <div className="border border-[#d0d7de] rounded-md overflow-hidden bg-white shadow-xs">
        {/* Latest Commit Strip */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#57606a] gap-2">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[9px]">
              S
            </div>
            <span className="font-semibold text-[#24292f]">sohibjonsulaymonov</span>
            <span className="text-[#24292f] truncate">
              feat: live medicines synced with Neon PostgreSQL
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] shrink-0 font-mono">
            <span className="text-[#0969da] hover:underline cursor-pointer">7b4d19e</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#57606a]" />
              <span>just now</span>
            </span>
            <div className="flex items-center space-x-1 font-semibold text-[#24292f] pl-2 border-l border-[#d0d7de]">
              <History className="w-3.5 h-3.5 text-[#57606a]" />
              <span>{medicines.length} items</span>
            </div>
          </div>
        </div>

        {/* Medicines Table / File List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-[#656d76] bg-[#ffffff] font-semibold text-[11px]">
                <th className="py-2.5 px-4 w-16">Preview</th>
                <th className="py-2.5 px-4">Medicine Name</th>
                <th className="py-2.5 px-4">Quantity & Unit</th>
                <th className="py-2.5 px-4">Author (Telegram ID)</th>
                <th className="py-2.5 px-4">Added Time</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#57606a]">
                    <div className="inline-block w-5 h-5 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading database records...</p>
                  </td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#57606a]">
                    <div className="w-10 h-10 rounded-full bg-[#f6f8fa] border border-[#d0d7de] text-[#57606a] flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-[#24292f]">No medicines found</p>
                    <p className="text-[11px] text-[#57606a] mt-1">
                      Telegram botingizga kirib (/start), birinchi dorini qo'shing.
                    </p>
                  </td>
                </tr>
              ) : (
                medicines.map((item) => {
                  const imageUrl = `/api/images/telegram/${item.photo_file_id}`;
                  const dateObj = new Date(item.created_at);
                  const formattedDate = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f6f8fa] transition-colors group"
                    >
                      {/* Image Thumbnail */}
                      <td className="py-2.5 px-4">
                        <div
                          onClick={() => onViewImage(imageUrl, item.name)}
                          className="w-9 h-9 rounded bg-[#f6f8fa] border border-[#d0d7de] overflow-hidden cursor-pointer relative group/img flex items-center justify-center"
                          title="Click to preview"
                        >
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </td>

                      {/* Name with GitHub Blue */}
                      <td className="py-2.5 px-4 font-semibold">
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="w-4 h-4 text-[#57606a] shrink-0" />
                          <span
                            onClick={() => onViewImage(imageUrl, item.name)}
                            className="text-[#0969da] hover:underline cursor-pointer font-medium"
                          >
                            {item.name}
                          </span>
                          <span className="text-[10px] text-[#57606a] font-mono">
                            #{item.id}
                          </span>
                        </div>
                      </td>

                      {/* Quantity & Unit Badge */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-[#24292f]">{item.quantity}</span>
                          <span
                            className={`border text-[11px] font-medium px-2 py-0.5 rounded-full ${getUnitPillStyle(
                              item.unit
                            )}`}
                          >
                            {item.unit}
                          </span>
                        </div>
                      </td>

                      {/* Telegram Author */}
                      <td className="py-2.5 px-4 font-mono text-[#57606a]">
                        <span className="hover:text-[#0969da] cursor-pointer">
                          @{item.telegram_username || item.telegram_user_id}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-4 text-[#57606a]">
                        <span>{formattedDate}</span>
                        <span className="text-[10px] text-[#8c959f] ml-1.5 font-mono">
                          {formattedTime}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Dorini o'chirmoqchimisiz: ${item.name}?`)) {
                              onDelete(item.id);
                            }
                          }}
                          className="text-[#57606a] hover:text-[#cf222e] p-1 rounded hover:bg-[#ffebe9] transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

