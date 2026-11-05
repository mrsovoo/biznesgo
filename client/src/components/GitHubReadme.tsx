import React from "react";
import { BookOpen, List, Pencil, Copy, Check, Terminal, ExternalLink } from "lucide-react";

interface GitHubReadmeProps {
  totalCount: number;
  uniqueUsers: number;
  byUnit: Record<string, number>;
}

export const GitHubReadme: React.FC<GitHubReadmeProps> = ({
  totalCount,
  uniqueUsers,
  byUnit,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://biznesgo.onrender.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-xs mt-6">
      {/* README Header Bar */}
      <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#24292f]">
        <div className="flex items-center space-x-2">
          <List className="w-4 h-4 text-[#57606a]" />
          <span>README.md</span>
        </div>

        <div className="flex items-center space-x-2 text-[#57606a]">
          <button
            onClick={handleCopy}
            className="hover:text-[#0969da] p-1 rounded hover:bg-[#eaeef2] transition"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href="https://github.com/sohibjonsulaymonov/biznesgo"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#0969da] p-1 rounded hover:bg-[#eaeef2] transition"
          >
            <Pencil className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* README Markdown Content */}
      <div className="p-6 sm:p-8 text-sm text-[#1f2328] space-y-5 leading-relaxed font-sans">
        <div className="border-b border-[#d0d7de] pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#1f2328] flex items-center gap-2">
            <span>💊 BiznesGo — Dori Hisobi va Nazorati Boshqaruvi</span>
          </h1>
          <p className="text-xs text-[#57606a] mt-1">
            Telegram Bot (@biznesgo_bot) + Neon PostgreSQL Database + GitHub-style Admin Panel
          </p>
        </div>

        {/* GitHub Status Badges */}
        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
            <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">service</span>
            <span className="bg-[#1f883d] text-white px-2 py-0.5 font-bold">online</span>
          </span>

          <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
            <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">database</span>
            <span className="bg-[#0969da] text-white px-2 py-0.5 font-bold">Neon Serverless</span>
          </span>

          <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
            <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">medicines</span>
            <span className="bg-[#8250df] text-white px-2 py-0.5 font-bold">{totalCount} items</span>
          </span>

          <span className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden">
            <span className="bg-[#24292f] text-white px-2 py-0.5 font-semibold">authors</span>
            <span className="bg-[#d4a72c] text-white px-2 py-0.5 font-bold">{uniqueUsers} users</span>
          </span>
        </div>

        {/* Summary Table */}
        <div className="space-y-2">
          <h2 className="text-base font-semibold border-b border-[#d0d7de] pb-1">
            📦 Birliklar bo'yicha joriy zaxira:
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            {Object.entries(byUnit).length > 0 ? (
              Object.entries(byUnit).map(([unit, count]) => (
                <div key={unit} className="p-2.5 rounded-md border border-[#d0d7de] bg-[#f6f8fa]">
                  <p className="text-[#57606a] uppercase font-semibold text-[10px]">{unit}</p>
                  <p className="text-lg font-bold text-[#1f2328] mt-0.5">{count} ta</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#57606a] col-span-4">Hozircha dorilar kiritilmagan.</p>
            )}
          </div>
        </div>

        {/* Quick Links & Diagnostics */}
        <div className="border border-[#d0d7de] rounded-md p-4 bg-[#f6f8fa] text-xs space-y-2">
          <div className="flex items-center space-x-2 font-semibold text-[#1f2328]">
            <Terminal className="w-4 h-4 text-[#0969da]" />
            <span>Foydali havolalar va diagnostika:</span>
          </div>
          <div className="flex flex-wrap gap-4 text-[#0969da] pt-1">
            <a
              href="https://t.me/biznesgo_bot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline font-semibold"
            >
              <span>Telegram Bot: @biznesgo_bot</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/api/test-bot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline font-semibold"
            >
              <span>Bot Webhook Diagnostikasi (/api/test-bot)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/api/medicines"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline font-semibold"
            >
              <span>REST API JSON (/api/medicines)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

