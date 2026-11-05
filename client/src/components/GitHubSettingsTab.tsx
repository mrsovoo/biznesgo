import React, { useState } from "react";
import { Settings, Key, ShieldCheck, Database, Trash2, Check, Lock } from "lucide-react";

export const GitHubSettingsTab: React.FC = () => {
  const [dlpStrict, setDlpStrict] = useState(true);
  const [autoDeduplicate, setAutoDeduplicate] = useState(true);

  return (
    <div className="space-y-6 text-xs text-[#1f2328] max-w-4xl">
      <div className="border-b border-[#d0d7de] pb-3">
        <h2 className="text-lg font-bold text-[#1f2328] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#57606a]" />
          <span>Repository Settings</span>
        </h2>
        <p className="text-[#57606a] text-xs mt-1">
          Manage database connectors, AI scraping keys, and Zero-Leakage security parameters.
        </p>
      </div>

      {/* General Settings */}
      <div className="border border-[#d0d7de] rounded-md bg-white p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[#24292f]">Repository details</h3>
        <div>
          <label className="block font-semibold mb-1 text-[#24292f]">Repository name</label>
          <input
            type="text"
            readOnly
            value="biznesgo"
            className="w-72 px-3 py-1.5 border border-[#d0d7de] rounded-md text-xs font-mono bg-[#f6f8fa]"
          />
        </div>
      </div>

      {/* Secrets & Environment Variables */}
      <div className="border border-[#d0d7de] rounded-md bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-[#24292f] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#0969da]" />
              <span>Repository Secrets & Variables</span>
            </h3>
            <p className="text-[#57606a] text-[11px] mt-0.5">
              Securely stored in .env and Render deployment environment.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#d0d7de]/60 border border-[#d0d7de] rounded-md overflow-hidden text-xs">
          <div className="p-3 flex items-center justify-between bg-[#f6f8fa]">
            <div>
              <p className="font-semibold font-mono text-[#24292f]">GEMINI_API_KEY</p>
              <p className="text-[11px] text-[#57606a]">Gemini 3.8 Flash & 3.5 Lite AI Scraper Engine</p>
            </div>
            <span className="text-[11px] bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/40 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
              Ulangan & Tasdiqlangan
            </span>
          </div>

          <div className="p-3 flex items-center justify-between bg-[#f6f8fa]">
            <div>
              <p className="font-semibold font-mono text-[#24292f]">DATABASE_URL</p>
              <p className="text-[11px] text-[#57606a]">Neon Serverless PostgreSQL connection string</p>
            </div>
            <span className="text-[11px] bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/40 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
              Connected
            </span>
          </div>

          <div className="p-3 flex items-center justify-between bg-[#f6f8fa]">
            <div>
              <p className="font-semibold font-mono text-[#24292f]">BOT_TOKEN</p>
              <p className="text-[11px] text-[#57606a]">Telegram Bot @biznesgo_bot API Token</p>
            </div>
            <span className="text-[11px] bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/40 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Security & Zero-Leakage DLP Policy */}
      <div className="border border-[#d0d7de] rounded-md bg-white p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[#24292f] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1a7f37]" />
          <span>Zero-Leakage Data Protection (DLP) Policies</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-md border border-[#d0d7de] bg-[#f6f8fa]">
            <div>
              <p className="font-semibold text-[#24292f]">Strict Internal Boundary (Tizim A ➡️ Tizim B)</p>
              <p className="text-[11px] text-[#57606a]">Maʼlumotlar faqat ichki tasdiqlangan tugunlar oʻrtasida aylanadi. 3-tomonlarga chiqish bloklanadi.</p>
            </div>
            <button
              onClick={() => setDlpStrict(!dlpStrict)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                dlpStrict ? "bg-[#1f883d] justify-end" : "bg-[#d0d7de] justify-start"
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md border border-[#d0d7de] bg-[#f6f8fa]">
            <div>
              <p className="font-semibold text-[#24292f]">Smart Deduplication on Ingestion</p>
              <p className="text-[11px] text-[#57606a]">Tashqi saytlardan klonlanganda bazada bor dorilarni avtomatik oʻtkazib yuborish.</p>
            </div>
            <button
              onClick={() => setAutoDeduplicate(!autoDeduplicate)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                autoDeduplicate ? "bg-[#1f883d] justify-end" : "bg-[#d0d7de] justify-start"
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-[#ff8182]/50 rounded-md bg-white p-5 space-y-3">
        <h3 className="font-semibold text-sm text-[#cf222e]">Danger Zone</h3>
        <p className="text-[#57606a] text-xs">
          Maʼlumotlar bazasini tozalash yoki keraksiz partiyalarni butunlay oʻchirish.
        </p>
        <button
          onClick={() => {
            if (confirm("DIQQAT: Hamma dorilarni o'chirib, bazani bo'shatmoqchimisiz?")) {
              alert("Xavfsizlik maqsadida ushbu buyruq uchun Neon konsoli talab qilinadi.");
            }
          }}
          className="border border-[#ff8182] text-[#cf222e] hover:bg-[#ffebe9] font-semibold px-3 py-1.5 rounded-md transition"
        >
          Reset entire catalog data
        </button>
      </div>
    </div>
  );
};
