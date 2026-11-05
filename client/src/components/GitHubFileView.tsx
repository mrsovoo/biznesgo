import React, { useState } from "react";
import { Medicine } from "../types";
import {
  FileCode,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

interface GitHubFileViewProps {
  medicine: Medicine;
  onBack: () => void;
  onDelete: (id: number) => void;
  onViewImage: (url: string, name: string) => void;
}

export const GitHubFileView: React.FC<GitHubFileViewProps> = ({
  medicine,
  onBack,
  onDelete,
  onViewImage,
}) => {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);

  const imageUrl = `/api/images/telegram/${medicine.photo_file_id}`;
  const fileName = `${medicine.name.toLowerCase().replace(/\s+/g, "_")}_${medicine.quantity}${medicine.unit}.json`;

  const jsonContent = JSON.stringify(
    {
      schema_version: "2.1.0",
      id: medicine.id,
      name: medicine.name,
      measurement: {
        unit: medicine.unit,
        quantity: medicine.quantity,
      },
      metadata: {
        storage_engine: "neon_serverless_postgresql",
        author_telegram_id: String(medicine.telegram_user_id),
        author_username: medicine.telegram_username ? `@${medicine.telegram_username}` : null,
        created_at: medicine.created_at,
        photo_file_id: medicine.photo_file_id,
        status: "active_stock",
      },
    },
    null,
    2
  );

  const lines = jsonContent.split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* File Breadcrumb & Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-semibold">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 text-[#0969da] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>biznesgo</span>
          </button>
          <span className="text-[#57606a]">/</span>
          <span className="text-[#0969da] cursor-pointer" onClick={onBack}>
            {medicine.unit}
          </span>
          <span className="text-[#57606a]">/</span>
          <span className="text-[#24292f]">{fileName}</span>
        </div>

        {/* Tab switch: Code vs Live Preview */}
        <div className="inline-flex rounded-md shadow-xs bg-[#f6f8fa] border border-[#d0d7de] p-0.5 text-xs">
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1 font-semibold rounded-md transition flex items-center gap-1.5 ${
              activeTab === "code"
                ? "bg-white text-[#24292f] shadow-xs"
                : "text-[#57606a] hover:text-[#24292f]"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Code (JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 font-semibold rounded-md transition flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-white text-[#24292f] shadow-xs"
                : "text-[#57606a] hover:text-[#24292f]"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Preview & Photo</span>
          </button>
        </div>
      </div>

      {/* GitHub File Container */}
      <div className="border border-[#d0d7de] rounded-md overflow-hidden bg-white shadow-xs">
        {/* Top File Meta Bar */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2 flex items-center justify-between text-xs text-[#57606a]">
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>{lines.length} lines ({lines.length} sloc)</span>
            <span>·</span>
            <span>{(jsonContent.length / 1024).toFixed(2)} KB</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 text-[#57606a] hover:text-[#0969da] hover:bg-[#eaeef2] rounded transition"
              title="Copy raw contents"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                const blob = new Blob([jsonContent], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
              }}
              className="p-1.5 text-[#57606a] hover:text-[#0969da] hover:bg-[#eaeef2] rounded transition"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (confirm(`Haqiqatan ham '${medicine.name}' dorisini o'chirmoqchimisiz?`)) {
                  onDelete(medicine.id);
                  onBack();
                }
              }}
              className="p-1.5 text-[#57606a] hover:text-[#cf222e] hover:bg-[#ffebe9] rounded transition"
              title="Delete file"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content View */}
        {activeTab === "code" ? (
          /* GitHub Code Lines View */
          <div className="overflow-x-auto p-4 font-mono text-xs leading-relaxed bg-white">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-[#f6f8fa]">
                    <td className="w-10 pr-4 text-right select-none text-[#8c959f] text-[11px] font-mono border-r border-[#d0d7de] mr-4">
                      {idx + 1}
                    </td>
                    <td className="pl-4 whitespace-pre text-[#24292f]">
                      {line.replace(
                        /"([^"]+)":/g,
                        '<span class="text-[#0550ae] font-semibold">"$1"</span>:'
                      ).replace(
                        /: "([^"]+)"/g,
                        ': <span class="text-[#0a3069]">"$1"</span>'
                      ).replace(
                        /: ([0-9]+)/g,
                        ': <span class="text-[#0550ae]">$1</span>'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Photo & Live Inspector View */
          <div className="p-6 bg-[#f6f8fa] flex flex-col md:flex-row gap-6 items-start">
            <div
              onClick={() => onViewImage(imageUrl, medicine.name)}
              className="w-full md:w-80 h-72 rounded-lg bg-black/5 border border-[#d0d7de] overflow-hidden flex items-center justify-center cursor-pointer group relative shadow-xs"
            >
              <img
                src={imageUrl}
                alt={medicine.name}
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition">
                <span>Katta hajmda ko'rish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 space-y-4 text-xs">
              <div>
                <h3 className="text-xl font-bold text-[#1f2328]">💊 {medicine.name}</h3>
                <p className="text-[#57606a] mt-0.5 font-mono">ID: #{medicine.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-md bg-white border border-[#d0d7de]">
                  <p className="text-[#57606a] uppercase font-semibold text-[10px]">Miqdori & Turi</p>
                  <p className="text-lg font-bold text-[#1f2328] mt-0.5">
                    {medicine.quantity} <span className="text-sm font-semibold text-[#0969da]">{medicine.unit}</span>
                  </p>
                </div>

                <div className="p-3 rounded-md bg-white border border-[#d0d7de]">
                  <p className="text-[#57606a] uppercase font-semibold text-[10px]">Kiritgan Shaxs</p>
                  <p className="text-sm font-bold text-[#1f2328] mt-1 font-mono">
                    {medicine.telegram_username ? `@${medicine.telegram_username}` : medicine.telegram_user_id}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-md bg-white border border-[#d0d7de] space-y-1">
                <p className="text-[#57606a] text-[11px]">
                  <b>Sana:</b> {new Date(medicine.created_at).toLocaleString("uz-UZ")}
                </p>
                <p className="text-[#57606a] text-[11px] truncate">
                  <b>Telegram File ID:</b> <code className="text-[#0550ae]">{medicine.photo_file_id}</code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

