import React, { useState } from "react";
import { Medicine } from "../types";
import { Search, Filter, Trash2, Eye, Calendar, User, Package } from "lucide-react";

interface MedicineTableProps {
  medicines: Medicine[];
  loading: boolean;
  onDelete: (id: number) => void;
  onViewImage: (url: string, name: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedUnit: string;
  setSelectedUnit: (u: string) => void;
}

export const MedicineTable: React.FC<MedicineTableProps> = ({
  medicines,
  loading,
  onDelete,
  onViewImage,
  searchTerm,
  setSearchTerm,
  selectedUnit,
  setSelectedUnit,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    if (confirm("Haqiqatan ham bu dorini o'chirmoqchimisiz?")) {
      setDeletingId(id);
      onDelete(id);
    }
  };

  const getUnitBadgeColor = (unit: string) => {
    const lower = unit.toLowerCase();
    if (lower.includes("litr") || lower.includes("ml")) return "bg-sky-50 text-sky-700 border-sky-200";
    if (lower.includes("kg") || lower.includes("gramm")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (lower.includes("dona")) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search and Filters toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50/50">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Dori nomi yoki birligi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtr:</span>
          </div>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          >
            <option value="all">Barcha turlar</option>
            <option value="litr">Litr</option>
            <option value="ml">ml</option>
            <option value="kg">kg</option>
            <option value="gramm">Gramm</option>
            <option value="dona">Dona</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-20">Rasm</th>
              <th className="py-3 px-4">Dori Nomi</th>
              <th className="py-3 px-4">Miqdori & Turi</th>
              <th className="py-3 px-4">Kiritgan Foydalanuvchi</th>
              <th className="py-3 px-4">Kiritilgan Sana</th>
              <th className="py-3 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p>Yuklanmoqda...</p>
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-slate-700 text-sm">Hozircha dorilar yo'q</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Telegram botga o'tib (/start), dori rasmini va ma'lumotlarini kiritishingiz mumkin.
                  </p>
                </td>
              </tr>
            ) : (
              medicines.map((item) => {
                const imageUrl = `/api/images/telegram/${item.photo_file_id}`;
                const dateObj = new Date(item.created_at);
                const formattedDate = dateObj.toLocaleDateString("uz-UZ", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("uz-UZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Image Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => onViewImage(imageUrl, item.name)}
                        className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative cursor-pointer group/img flex items-center justify-center shadow-xs"
                      >
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition group-hover/img:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span>{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{item.id}</span>
                      </div>
                    </td>

                    {/* Quantity & Unit */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-800">{item.quantity}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium border ${getUnitBadgeColor(
                            item.unit
                          )}`}
                        >
                          {item.unit}
                        </span>
                      </div>
                    </td>

                    {/* User ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-medium text-slate-700">
                            {item.telegram_user_id}
                          </div>
                          {item.telegram_username && (
                            <div className="text-[11px] text-blue-600 font-medium">
                              @{item.telegram_username}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      <div className="flex items-center space-x-1 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 ml-4.5">{formattedTime}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        disabled={deletingId === item.id}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count summary */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Jami ko'rsatilmoqda: <b>{medicines.length}</b> ta yozuv</span>
      </div>
    </div>
  );
};

