import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Sparkles,
  Link,
  ListPlus,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Key,
} from "lucide-react";

interface GitGoCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (repoName?: string) => void;
}

export const GitGoCloneModal: React.FC<GitGoCloneModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<"single" | "batch">("single");
  const [url, setUrl] = useState("");
  const [batchUrls, setBatchUrls] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [hasServerKey, setHasServerKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<any | null>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setThinkingSeconds(1);
      interval = setInterval(() => {
        setThinkingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setThinkingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (isOpen) {
      axios
        .get("/api/clone/status")
        .then((res) => {
          if (res.data.hasApiKey) {
            setHasServerKey(true);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartClone = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetUrls: string[] = [];
    if (tab === "single") {
      if (!url.trim()) return alert("Iltimos, sayt havolasini (URL) kiriting!");
      targetUrls = [url.trim()];
    } else {
      targetUrls = batchUrls
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.startsWith("http"));
      if (targetUrls.length === 0) {
        return alert("Iltimos, kamida bitta to'g'ri havolani kiriting (https://...)!");
      }
    }

    setLoading(true);
    setReport(null);
    setLogs([
      `$ gitgo clone --engine=gemini-3.8-flash`,
      `> Target URLs: ${targetUrls.length} ta havola`,
      `> Sayt sahifalari yuklab olinmoqda va tahlil qilinmoqda...`,
    ]);

    try {
      const res = await axios.post("/api/clone/scan", {
        urls: targetUrls,
        apiKey: apiKey.trim() || undefined,
      });

      if (res.data.success) {
        setReport(res.data);
        setLogs((prev) => [
          ...prev,
          `> Gemini 3.8 Flash dori vositalarini muvaffaqiyatli tahlil qildi.`,
          `> Neon PostgreSQL bazasiga tekshirish va dublikatlarni saralash yakunlandi.`,
          `======================================================`,
          `✅ Jami dori topildi: ${res.data.stats.totalFound} ta`,
          `📦 Yangi bazaga qo'shildi: ${res.data.stats.addedCount} ta`,
          `⏭️ Mavjud bo'lgani uchun o'tkazib yuborildi: ${res.data.stats.skippedCount} ta`,
        ]);
        const targetRepo = res.data.reports?.[0]?.repoName;
        onSuccess(targetRepo);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message;
      setLogs((prev) => [
        ...prev,
        `❌ Xatolik yuz berdi: ${errMsg}`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white border border-[#d0d7de] rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded bg-[#1f883d] text-white flex items-center justify-center text-xs font-bold font-mono">
              &lt;&gt;
            </span>
            <h3 className="font-semibold text-sm text-[#1f2328] flex items-center gap-1.5">
              <span>GitGo Clone & AI Web Scraper</span>
              <span className="bg-[#ddf4ff] text-[#0969da] border border-[#54aeff]/40 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                Gemini 3.8 Flash
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#57606a] hover:text-[#1f2328] p-1 rounded hover:bg-[#eaeef2] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-[#1f2328]">
          <p className="text-[#57606a] leading-relaxed">
            Vet va agro dori saytlarining havolasini (URL) bering. <b>Gemini 3.8 Flash</b> saytni skaner qilib,
            dorining <b>nomi, oʻlchov birligi (litr, kg, ml), rasmi va tavsifini</b> avtomatik ajratib oladi va
            Neon bazangizga qoʻshadi. Agar dori bazada allaqachon mavjud boʻlsa, oʻtkazib yuboriladi.
          </p>

          {/* URL Tab Switcher */}
          <div className="flex border-b border-[#d0d7de] space-x-4">
            <button
              onClick={() => setTab("single")}
              className={`pb-2 font-semibold flex items-center gap-1.5 border-b-2 transition ${
                tab === "single"
                  ? "border-[#fd8c73] text-[#1f2328]"
                  : "border-transparent text-[#57606a] hover:text-[#1f2328]"
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Bitta sayt havolasi (Single URL)</span>
            </button>

            <button
              onClick={() => setTab("batch")}
              className={`pb-2 font-semibold flex items-center gap-1.5 border-b-2 transition ${
                tab === "batch"
                  ? "border-[#fd8c73] text-[#1f2328]"
                  : "border-transparent text-[#57606a] hover:text-[#1f2328]"
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Bir nechta havolalar (Batch URLs)</span>
            </button>
          </div>

          <form onSubmit={handleStartClone} className="space-y-4">
            {tab === "single" ? (
              <div>
                <label className="block font-semibold mb-1 text-[#24292f]">
                  Mahsulotlar yoki dori katalogi sahifasi URL:
                </label>
                <input
                  type="url"
                  placeholder="https://example-agro-vet.uz/products"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da] text-xs font-mono"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold mb-1 text-[#24292f]">
                  Har bir qatorda bittadan sayt havolasini yozing:
                </label>
                <textarea
                  rows={4}
                  placeholder="https://site1.uz/catalog&#10;https://site2.com/vet-medicines&#10;https://site3.uz/agro-products"
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da] text-xs font-mono"
                  required
                />
              </div>
            )}

            {/* Optional Gemini API Key if not set in environment */}
            <div className="p-3 bg-[#f6f8fa] border border-[#d0d7de] rounded-md space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#24292f] flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-[#57606a]" />
                  <span>Gemini API Key:</span>
                </span>
                {hasServerKey ? (
                  <span className="text-[11px] text-[#1a7f37] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Serverda ulangan (.env)
                  </span>
                ) : (
                  <span className="text-[11px] text-[#9a6700] font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Kalit kiritilmagan
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder={hasServerKey ? "Serverdagi kalit ishlatiladi (almashtirish ixtiyoriy)" : "AIzaSy..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
                className="w-full px-2.5 py-1.5 border border-[#d0d7de] rounded text-xs font-mono bg-white focus:outline-none"
              />
            </div>

            {/* Active AI Thinking Banner */}
            {loading && (
              <div className="p-2.5 bg-[#f6f8fa] border border-[#8250df]/30 rounded-md flex items-center justify-between text-xs font-mono text-[#8250df] shadow-2xs animate-in fade-in">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-[#8250df]" />
                  <span className="font-semibold">Thinking for {thinkingSeconds}s...</span>
                  <span className="text-[11px] text-[#57606a] hidden sm:inline">
                    (Gemini AI sahifadagi dori preparatlarini tahlil qilmoqda)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#1f883d] animate-ping" />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] text-xs font-semibold text-[#24292f] transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold rounded-md shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? `Thinking for ${thinkingSeconds}s...` : "🚀 Clone & AI Import"}</span>
              </button>
            </div>
          </form>

          {/* Terminal Logs Output */}
          {logs.length > 0 && (
            <div className="mt-4 border border-[#30363d] rounded-md bg-[#161b22] text-[#e6edf3] p-3 font-mono text-[11px] space-y-1 max-h-56 overflow-y-auto">
              <div className="flex items-center space-x-1.5 text-[#7d8590] pb-1 border-b border-[#30363d] mb-1">
                <Terminal className="w-3 h-3" />
                <span>GitGo Clone Terminal Output</span>
              </div>
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes("✅")
                      ? "text-[#3fb950] font-bold"
                      : log.includes("❌")
                      ? "text-[#f85149] font-bold"
                      : log.includes("$")
                      ? "text-[#58a6ff] font-semibold"
                      : "text-[#c9d1d9]"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Results Summary and Cards if any */}
          {report && report.reports && (
            <div className="space-y-3 pt-2 border-t border-[#d0d7de]">
              <h4 className="font-semibold text-xs text-[#24292f]">
                Ajratib olingan dorilar ro'yxati:
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {report.reports.flatMap((r: any) => r.items).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md border border-[#d0d7de] bg-[#f6f8fa] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-8 h-8 rounded object-cover border border-[#d0d7de] bg-white shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-white border border-[#d0d7de] flex items-center justify-center text-xs shrink-0 font-bold text-[#57606a]">
                          💊
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-[#1f2328] truncate">{item.name}</p>
                        <p className="text-[11px] text-[#57606a]">
                          {item.quantity} {item.unit} · <span className="capitalize">{item.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {item.status === "added" ? (
                        <span className="bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/40 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          + Qo'shildi
                        </span>
                      ) : (
                        <span className="bg-[#fff8c5] text-[#9a6700] border border-[#d4a72c]/40 text-[10px] font-semibold px-2 py-0.5 rounded-full" title={item.reason}>
                          O'tkazildi (Bazada bor)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

