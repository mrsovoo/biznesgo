import React from "react";
import { Medicine, Commit } from "../types";
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
  onOpenClone: () => void;
  latestCommit?: Commit | null;
  folderCommits?: Record<string, Commit>;
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
  onOpenClone,
  latestCommit,
  folderCommits = {},
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

  const displayCommitMessage =
    latestCommit?.message ||
    (currentFolder
      ? `inventory: catalog sync in ${currentFolder}/ (${folderMedicines.length} entries)`
      : "feat: sync veterinary & agro inventory with Neon PostgreSQL");

  const displaySha = latestCommit?.sha || "7b4e19a";
  const displayAuthor = latestCommit?.author || "sohibjonsulaymonov";

  const getRelativeTime = (iso?: string) => {
    if (!iso) return "just now";
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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

          {/* GitHub Code / Clone Button */}
          <button
            onClick={onOpenClone}
            className="flex items-center space-x-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xs transition"
            title="Import medications from websites with Gemini AI"
          >
            <span className="font-mono text-[11px]">&lt;&gt;</span>
            <span>Code</span>
          </button>

          {/* Bot link */}
          <a
            href="https://t.me/biznesgo_bot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] text-[#24292f] text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5 text-[#57606a]" />
            <span className="hidden sm:inline">Bot</span>
          </a>
        </div>
      </div>

      {/* GitHub Repository Content Box */}
      <div className="border border-[#d0d7de] rounded-md overflow-hidden bg-white shadow-xs">
        {/* Latest Commit Strip (Live GitHub commit header) */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#57606a] gap-2">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0">
              {displayAuthor[0].toUpperCase()}
            </div>
            <span className="font-semibold text-[#24292f] shrink-0">{displayAuthor}</span>
            <span className="text-[#24292f] truncate">
              {displayCommitMessage}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] shrink-0 font-mono">
            <span className="text-[#0969da] hover:underline cursor-pointer">{displaySha.slice(0, 7)}</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#57606a]" />
              <span>{getRelativeTime(latestCommit?.created_at)}</span>
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
                  {availableFolders.map((f) => {
                    const fCommit = folderCommits[f.name.toLowerCase()];
                    const fCommitMsg = fCommit?.message || `inventory: ${f.count} items stored in Neon DB`;
                    const fTime = getRelativeTime(fCommit?.created_at);

                    return (
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
                          {fCommitMsg}
                        </td>
                        <td className="py-2.5 px-4 text-right text-[11px] text-[#57606a] whitespace-nowrap">
                          {fTime}
                        </td>
                      </tr>
                    );
                  })}

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
                          Yuqoridagi <b>&lt;&gt; Code</b> tugmasi orqali sayt linkini bering yoki botdan yuboring.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    /* Medicine List with Real Photo, Name, and Unit */
                    folderMedicines.map((item) => {
                      const fileName = `${item.name.toLowerCase().replace(/\s+/g, "_")}_${item.quantity}${item.unit}.json`;
                      const dateObj = new Date(item.created_at);
                      const imageUrl = item.photo_url || `/api/images/telegram/${item.photo_file_id}`;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#f6f8fa] transition-colors group"
                        >
                          {/* Photo Thumbnail */}
                          <td className="py-2 px-3 w-12">
                            <div
                              onClick={() => onViewImage(imageUrl, item.name)}
                              className="w-10 h-10 rounded-md bg-[#f6f8fa] border border-[#d0d7de] overflow-hidden cursor-pointer flex items-center justify-center shrink-0 hover:ring-2 hover:ring-[#0969da]/40 transition shadow-2xs"
                              title="Rasmni kattalashtirish"
                            >
                              <img
                                src={imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          </td>

                          {/* Name & File tag */}
                          <td
                            onClick={() => onSelectMedicine(item)}
                            className="py-2.5 px-3 font-semibold text-[#0969da] group-hover:underline cursor-pointer"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                              <span className="text-xs text-[#1f2328] font-bold">{item.name}</span>
                              <span className="text-[10px] text-[#57606a] font-mono bg-[#f6f8fa] px-1.5 py-0.2 rounded border border-[#d0d7de]/60 w-fit mt-0.5 sm:mt-0">
                                {fileName}
                              </span>
                            </div>
                          </td>

                          {/* Unit & Quantity Badge */}
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ddf4ff] text-[#0969da] border border-[#54aeff]/30">
                              {item.quantity} {item.unit}
                            </span>
                          </td>

                          {/* Time & Delete */}
                          <td className="py-2.5 px-4 text-right text-[11px] text-[#57606a] whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <span>{dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                              <button
                                onClick={() => {
                                  if (confirm(`Dorini o'chirmoqchimisiz: ${item.name}?`)) {
                                    onDelete(item.id);
                                  }
                                }}
                                className="text-[#57606a] hover:text-[#cf222e] p-1 rounded hover:bg-[#ffebe9] transition"
                                title="O'chirish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
