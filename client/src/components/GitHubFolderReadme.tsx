import React from "react";
import { List, Check, Copy, ExternalLink, ShieldAlert, Package, Layers } from "lucide-react";
import { Medicine } from "../types";

interface GitHubFolderReadmeProps {
  currentFolder: string | null;
  medicines: Medicine[];
  totalCount: number;
  uniqueUsers: number;
  byUnit: Record<string, number>;
}

export const GitHubFolderReadme: React.FC<GitHubFolderReadmeProps> = ({
  currentFolder,
  medicines,
  totalCount,
  uniqueUsers,
  byUnit,
}) => {
  const [copied, setCopied] = React.useState(false);

  const folderMedicines = currentFolder
    ? currentFolder === "all_medicines"
      ? medicines
      : medicines.filter(
          (m) => m.unit.toLowerCase().trim() === currentFolder.toLowerCase()
        )
    : medicines;

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFolderMeta = () => {
    switch (currentFolder) {
      case "litr":
        return {
          title: "🧴 Litr (Suyuqliklar, Emulsiyalar & Eritmalar) — Modul Hisoboti",
          description: "Katta hajmdagi veterinar eritmalar, dezinfektantlar, ichiriladigan va purkaladigan dori vositalari katalogi.",
          category: "Liquid Formulations & Soluble Concentrates",
          storage: "Quruq, yorug'likdan himoyalangan va 5°C - 25°C haroratda saqlansin.",
        };
      case "ml":
        return {
          title: "🧪 Millilitr (Inyeksiya & Tomchilar) — Modul Hisoboti",
          description: "Ampulalar, flakonlar, antibiotik suspenziyalari va inyeksiya vositalari zaxira katalogi.",
          category: "Parenteral & Injectable Suspensions",
          storage: "Steril sharoitda, bolalar qo'li yetmaydigan joyda saqlansin.",
        };
      case "kg":
        return {
          title: "⚖️ Kilogramm (Kukunlar, Ozuqa Qo'shimchalari & Premikslar)",
          description: "Katta hajmdagi antibakterial kukunlar, biologik ozuqalar, insektitsidlar va mineral qo'shimchalar.",
          category: "Soluble Powders & Nutritional Supplements",
          storage: "Zaxdan himoyalangan, zich yopilgan idishlarda saqlansin.",
        };
      case "gramm":
        return {
          title: "⚖️ Gramm (Mikro-kukunlar & Aniqlikdagi Dorilar)",
          description: "Kichik qadoqdagi vitaminlar, antibiotik kukunlari va suvda eruvchan preparatlar.",
          category: "Precision Micro-Powders & Water-Solubles",
          storage: "Germetik qadoqda, namlikdan saqlansin.",
        };
      case "dona":
        return {
          title: "💊 Dona (Tabletkalar, Boluslar & Kapsulalar)",
          description: "Qoramol, qo'y va uy hayvonlari uchun antiparazitar tabletkalar va boluslar.",
          category: "Solid Oral Dosage Forms (Tablets & Boluses)",
          storage: "Original blister va bankalarda saqlansin.",
        };
      case "all_medicines":
        return {
          title: "🗄️ Barcha Dorilar (Umumiy Master Katalog)",
          description: "Tizimdagi barcha veterinar va agronomik preparatlarning to'liq markaziy bazasi.",
          category: "Full Integrated Inventory Catalog",
          storage: "Farmakologik xalqaro GMP va ISO standartlariga muvofiq.",
        };
      default:
        return null;
    }
  };

  const meta = getFolderMeta();

  // If at root (no folder selected), show standard root README
  if (!currentFolder || !meta) {
    return (
      <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-xs mt-6">
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#24292f]">
          <div className="flex items-center space-x-2">
            <List className="w-4 h-4 text-[#57606a]" />
            <span>README.md</span>
          </div>
          <button
            onClick={handleCopy}
            className="hover:text-[#0969da] p-1 rounded hover:bg-[#eaeef2] transition text-[#57606a]"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="p-6 sm:p-8 text-sm text-[#1f2328] space-y-5 leading-relaxed font-sans">
          <div className="border-b border-[#d0d7de] pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-[#1f2328]">
              💊 biznesgo — Veterinary & Agro Pharmacy Distributed Data Service
            </h1>
            <p className="text-xs text-[#57606a] mt-1">
              Automated Inventory Catalog with Gemini 3.8 Flash AI Web Scraper, Telegram Bot & Neon PostgreSQL
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
              <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">service</span>
              <span className="bg-[#1f883d] text-white px-2 py-0.5 font-bold">active</span>
            </span>
            <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
              <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">engine</span>
              <span className="bg-[#0969da] text-white px-2 py-0.5 font-bold">Gemini 3.8 Flash</span>
            </span>
            <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
              <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">records</span>
              <span className="bg-[#8250df] text-white px-2 py-0.5 font-bold">{totalCount} items</span>
            </span>
            <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
              <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">database</span>
              <span className="bg-[#d4a72c] text-white px-2 py-0.5 font-bold">Neon Serverless</span>
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold border-b border-[#d0d7de] pb-1">
              📂 Katalog Bo'limlari (Birliklar):
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-1">
              {["litr", "ml", "kg", "gramm", "dona"].map((unit) => (
                <div key={unit} className="p-2.5 rounded-md border border-[#d0d7de] bg-[#f6f8fa]">
                  <p className="text-[#57606a] uppercase font-semibold text-[10px]">{unit}/</p>
                  <p className="text-lg font-bold text-[#1f2328] mt-0.5">
                    {byUnit[unit] || 0} <span className="text-xs font-normal text-[#57606a]">fayl</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FOLDER SPECIFIC README
  return (
    <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-xs mt-6">
      {/* Header bar showing exact folder README path e.g. litr/README.md */}
      <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#24292f]">
        <div className="flex items-center space-x-2">
          <List className="w-4 h-4 text-[#57606a]" />
          <span>{currentFolder}/README.md</span>
        </div>
        <button
          onClick={handleCopy}
          className="hover:text-[#0969da] p-1 rounded hover:bg-[#eaeef2] transition text-[#57606a]"
          title="Copy URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Rendered Markdown report */}
      <div className="p-6 sm:p-8 text-sm text-[#1f2328] space-y-5 leading-relaxed font-sans">
        <div className="border-b border-[#d0d7de] pb-4">
          <h1 className="text-xl font-bold tracking-tight text-[#1f2328]">
            {meta.title}
          </h1>
          <p className="text-xs text-[#57606a] mt-1">{meta.description}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
            <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">unit</span>
            <span className="bg-[#0969da] text-white px-2 py-0.5 font-bold uppercase">{currentFolder}</span>
          </span>
          <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
            <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">items_count</span>
            <span className="bg-[#1f883d] text-white px-2 py-0.5 font-bold">{folderMedicines.length} items</span>
          </span>
          <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
            <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">classification</span>
            <span className="bg-[#8250df] text-white px-2 py-0.5 font-bold">{meta.category}</span>
          </span>
        </div>

        {/* Summary Table of medicines in this folder */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold border-b border-[#d0d7de] pb-1">
            📋 Ushbu bo'limdagi mavjud preparatlar ({folderMedicines.length} ta):
          </h2>
          {folderMedicines.length === 0 ? (
            <p className="text-xs text-[#57606a] py-2">
              Hozircha ushbu bo'limda dori vositalari kiritilmagan. Yuqoridagi <b>&lt;&gt; Code</b> orqali sayt linkini bering yoki botdan yuboring.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#d0d7de] rounded-md overflow-hidden">
                <thead className="bg-[#f6f8fa] border-b border-[#d0d7de] text-[#57606a] font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Dori Nomi</th>
                    <th className="py-2 px-3">O'lchov & Miqdor</th>
                    <th className="py-2 px-3">Kategoriya</th>
                    <th className="py-2 px-3">Kiritilgan Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d0d7de]/50">
                  {folderMedicines.slice(0, 15).map((m, idx) => (
                    <tr key={m.id} className="hover:bg-[#f6f8fa]">
                      <td className="py-2 px-3 text-[#57606a] font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-[#0969da]">{m.name}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-[#24292f]">{m.quantity}</span> {m.unit}
                      </td>
                      <td className="py-2 px-3 text-[#57606a] capitalize">
                        {m.category || "Umumiy preparat"}
                      </td>
                      <td className="py-2 px-3 text-[#57606a]">
                        {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {folderMedicines.length > 15 && (
                <p className="text-[11px] text-[#57606a] mt-1 text-right">
                  ... va yana {folderMedicines.length - 15} ta preparat mavjud.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Storage and Pharma Guidelines Box */}
        <div className="border border-[#d0d7de] rounded-md p-3.5 bg-[#f6f8fa] text-xs space-y-1">
          <div className="flex items-center space-x-1.5 font-semibold text-[#1f2328]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#0969da]" />
            <span>Saqlash va veterinariya shartlari:</span>
          </div>
          <p className="text-[#57606a] leading-relaxed pl-5">
            {meta.storage} Barcha partiyalar Neon PostgreSQL ma'lumotlar bazasida doimiy audit va yozuv bilan kuzatib boriladi.
          </p>
        </div>
      </div>
    </div>
  );
};

