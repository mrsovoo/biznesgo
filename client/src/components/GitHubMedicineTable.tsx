import React from "react";
import { Medicine } from "../types";
import {
  GitBranch,
  Folder,
  FileText,
  FileCode,
  Image as ImageIcon,
  History,
  Send,
  RefreshCw,
  Clock,
  ArrowLeft,
  Table as TableIcon,
  Trash2,
} from "lucide-react";

interface GitHubMedicineTableProps {
  medicines: Medicine[];
  loading: boolean;
  onDelete: (id: number) => void;
  onViewImage: (url: string, name: string) => void;
  onSelectMedicine: (m: Medicine) => void;
  onRefresh: () => void;
  currentFolder: string | null;
  setCurrentFolder: (folder: string | null) => void;
}

export const GitHubMedicineTable: React.FC<GitHubMedicineTableProps> = ({
  medicines,
  loading,
  onDelete,
  onViewImage,
  onSelectMedicine,
  onRefresh,
  currentFolder,
  setCurrentFolder,
}) => {
  const [viewMode, setViewMode] = React.useState<"files" | "table">("files");

  // Units breakdown
  const unitCounts: Record<string, number> = {};
  medicines.forEach((m) => {
    const u = m.unit.toLowerCase().trim();
    unitCounts[u] = (unitCounts[u] || 0) + 1;
  });

  const availableFolders = [
    { name: "litr", count: unitCounts["litr"] || 0 },
    { name: "ml", count: unitCounts["ml"] || 0 },
    { name: "kg", count: unitCounts["kg"] || 0 },
    { name: "gramm", count: unitCounts["gramm"] || 0 },
    { name: "dona", count: unitCounts["dona"] || 0 },
    { name: "all_medicines", count: medicines.length },
  ];

  // Filter medicines if folder is selected
  const folderMedicines = currentFolder
    ? currentFolder === "all_medicines"
      ? medicines
      : medicines.filter(
          (m) => m.unit.toLowerCase().trim() === currentFolder.toLowerCase()
        )
    : [];

  return (
    <div className="space-y-4">
      {/* GitHub Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch dropdown */}
          <div className="inline-flex items-center space-x-1.5 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] rounded-md px-3 py-1.5 text-xs font-semibold text-[#24292f] shadow-xs cursor-pointer">
            <GitBranch className="w-3.5 h-3.5 text-[#57606a]" />
            <span>main</span>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1 text-xs font-semibold">
            <button
              onClick={() => setCurrentFolder(null)}
              className="text-[#0969da] hover:underline"
            >
              biznesgo
            </button>
            {currentFolder && (
              <>
                <span className="text-[#57606a]">/</span>
                <span className="text-[#24292f] font-bold">{currentFolder}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle when inside a folder */}
          {currentFolder && (
            <div className="inline-flex rounded-md shadow-xs bg-[#f6f8fa] border border-[#d0d7de] p-0.5 text-xs">
              <button
                onClick={() => setViewMode("files")}
                className={`px-2.5 py-1 font-semibold rounded transition flex items-center gap-1 ${
                  viewMode === "files"
                    ? "bg-white text-[#24292f] shadow-xs"
                    : "text-[#57606a] hover:text-[#24292f]"
                }`}
                title="GitHub Files View (Stealth)"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Files</span>
              </button>

              <button
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 font-semibold rounded transition flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-white text-[#24292f] shadow-xs"
                    : "text-[#57606a] hover:text-[#24292f]"
                }`}
                title="Database Inspector View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Inspector</span>
              </button>
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-1 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] text-[#24292f] text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xs transition"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#57606a] ${loading ? "animate-spin text-[#0969da]" : ""}`} />
          </button>

          {/* Bot link */}
          <a
            href="https://t.me/biznesgo_bot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bot</span>
          </a>
        </div>
      </div>

      {/* GitHub Repository Content Box */}
      <div className="border border-[#d0d7de] rounded-md overflow-hidden bg-white shadow-xs">
        {/* Latest Commit Strip */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#57606a] gap-2">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[9px]">
              S
            </div>
            <span className="font-semibold text-[#24292f]">sohibjonsulaymonov</span>
            <span className="text-[#24292f] truncate">
              {currentFolder
                ? `inventory: catalog sync in ${currentFolder}/ (${folderMedicines.length} entries)`
                : "chore: update Neon PostgreSQL inventory schemas"}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] shrink-0 font-mono">
            <span className="text-[#0969da] hover:underline cursor-pointer">8b2f91a</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#57606a]" />
              <span>just now</span>
            </span>
            <div className="flex items-center space-x-1 font-semibold text-[#24292f] pl-2 border-l border-[#d0d7de]">
              <History className="w-3.5 h-3.5 text-[#57606a]" />
              <span>History</span>
            </div>
          </div>
        </div>

        {/* Directory / File Tree */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <tbody className="divide-y divide-[#d0d7de]/50">
              {/* Back to parent folder if inside a folder */}
              {currentFolder && (
                <tr
                  onClick={() => setCurrentFolder(null)}
                  className="hover:bg-[#f6f8fa] transition-colors cursor-pointer text-[#0969da] font-semibold"
                >
                  <td className="py-2.5 px-4 w-12 text-[#57606a]">
                    <ArrowLeft className="w-4 h-4 text-[#57606a]" />
                  </td>
                  <td colSpan={3} className="py-2.5 px-4">
                    .. (Go back to root)
                  </td>
                </tr>
              )}

              {/* ROOT VIEW: Folder List (litr, ml, kg, gramm, dona, all) */}
              {!currentFolder && (
                <>
                  {availableFolders.map((f) => (
                    <tr
                      key={f.name}
                      onClick={() => setCurrentFolder(f.name)}
                      className="hover:bg-[#f6f8fa] transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-4 w-12 text-[#54aeff]">
                        <Folder className="w-4 h-4 fill-[#54aeff] text-[#0969da]" />
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#0969da] group-hover:underline w-1/3">
                        {f.name}
                      </td>
                      <td className="py-2.5 px-4 text-[#57606a] truncate">
                        inventory: {f.count} items recorded in Neon PostgreSQL
                      </td>
                      <td className="py-2.5 px-4 text-right text-[11px] text-[#57606a] whitespace-nowrap">
                        just now
                      </td>
                    </tr>
                  ))}

                  {/* Simulated config and schema files for 100% authentic GitHub appearance */}
                  <tr className="hover:bg-[#f6f8fa] transition-colors text-[#57606a]">
                    <td className="py-2.5 px-4 w-12">
                      <FileCode className="w-4 h-4 text-[#57606a]" />
                    </td>
                    <td className="py-2.5 px-4 font-medium text-[#24292f] w-1/3">
                      database.schema.sql
                    </td>
                    <td className="py-2.5 px-4 text-[#57606a]">
                      CREATE TABLE medicines (id, name, unit, quantity, photo_file_id)
                    </td>
                    <td className="py-2.5 px-4 text-right text-[11px] text-[#57606a]">
                      yesterday
                    </td>
                  </tr>

                  <tr className="hover:bg-[#f6f8fa] transition-colors text-[#57606a]">
                    <td className="py-2.5 px-4 w-12">
                      <FileText className="w-4 h-4 text-[#57606a]" />
                    </td>
                    <td className="py-2.5 px-4 font-medium text-[#24292f] w-1/3">
                      package.json
                    </td>
                    <td className="py-2.5 px-4 text-[#57606a]">
                      feat: production setup with Neon & Grammy bot
                    </td>
                    <td className="py-2.5 px-4 text-right text-[11px] text-[#57606a]">
                      yesterday
                    </td>
                  </tr>

                  <tr className="hover:bg-[#f6f8fa] transition-colors text-[#57606a]">
                    <td className="py-2.5 px-4 w-12">
                      <FileText className="w-4 h-4 text-[#57606a]" />
                    </td>
                    <td className="py-2.5 px-4 font-medium text-[#24292f] w-1/3">
                      README.md
                    </td>
                    <td className="py-2.5 px-4 text-[#57606a]">
                      docs: update system architecture and API specs
                    </td>
                    <td className="py-2.5 px-4 text-right text-[11px] text-[#57606a]">
                      yesterday
                    </td>
                  </tr>
                </>
              )}

              {/* INSIDE A FOLDER: File Mode or Table Mode */}
              {currentFolder && (
                <>
                  {folderMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#57606a]">
                        <Folder className="w-8 h-8 text-[#afb8c1] mx-auto mb-2" />
                        <p className="font-semibold text-[#24292f]">Ushbu bo'limda hozircha dori yo'q</p>
                        <p className="text-[11px] text-[#57606a] mt-0.5">
                          Bot orqali yangi {currentFolder} dorisini qo'shing.
                        </p>
                      </td>
                    </tr>
                  ) : viewMode === "files" ? (
                    /* Files view: looks like code files in GitHub */
                    folderMedicines.map((item) => {
                      const fileName = `${item.name.toLowerCase().replace(/\s+/g, "_")}_${item.quantity}${item.unit}.json`;
                      const dateObj = new Date(item.created_at);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => onSelectMedicine(item)}
                          className="hover:bg-[#f6f8fa] transition-colors cursor-pointer group"
                        >
                          <td className="py-2.5 px-4 w-12 text-[#57606a]">
                            <FileCode className="w-4 h-4 text-[#0969da]" />
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-[#0969da] group-hover:underline w-1/3">
                            {fileName}
                          </td>
                          <td className="py-2.5 px-4 text-[#57606a] truncate">
                            <span className="text-[#24292f] font-medium mr-2">{item.name}</span>
                            <span className="bg-[#ddf4ff] text-[#0969da] text-[10px] px-1.5 py-0.2 rounded font-semibold mr-2">
                              {item.quantity} {item.unit}
                            </span>
                            <span className="text-[11px] text-[#8c959f]">
                              Author: @{item.telegram_username || item.telegram_user_id}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right text-[11px] text-[#57606a] whitespace-nowrap">
                            {dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    /* Inspector Table Mode with thumbnails */
                    folderMedicines.map((item) => {
                      const imageUrl = `/api/images/telegram/${item.photo_file_id}`;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#f6f8fa] transition-colors"
                        >
                          <td className="py-2 px-4 w-12">
                            <div
                              onClick={() => onViewImage(imageUrl, item.name)}
                              className="w-8 h-8 rounded bg-[#f6f8fa] border border-[#d0d7de] overflow-hidden cursor-pointer flex items-center justify-center"
                            >
                              <img
                                src={imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td
                            onClick={() => onSelectMedicine(item)}
                            className="py-2.5 px-4 font-semibold text-[#0969da] hover:underline cursor-pointer"
                          >
                            {item.name}
                            <span className="text-[10px] text-[#8c959f] ml-1.5 font-mono">#{item.id}</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-[#24292f] mr-1.5">{item.quantity}</span>
                            <span className="text-[10px] bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/40 px-1.5 py-0.5 rounded font-semibold">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Dorini o'chirmoqchimisiz: ${item.name}?`)) {
                                  onDelete(item.id);
                                }
                              }}
                              className="text-[#57606a] hover:text-[#cf222e] p-1 rounded hover:bg-[#ffebe9] transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
