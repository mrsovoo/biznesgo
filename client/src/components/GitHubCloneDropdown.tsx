import React, { useState } from "react";
import {
  Copy,
  Check,
  Sparkles,
  Download,
  Terminal,
  FolderGit2,
  ExternalLink,
} from "lucide-react";

interface GitHubCloneDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiClone: () => void;
  medicinesCount: number;
}

export const GitHubCloneDropdown: React.FC<GitHubCloneDropdownProps> = ({
  isOpen,
  onClose,
  onOpenAiClone,
  medicinesCount,
}) => {
  const [tab, setTab] = useState<"https" | "ai">("https");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const repoUrl = "https://github.com/sohibjonsulaymonov/biznesgo.git";

  const handleCopy = () => {
    navigator.clipboard.writeText(repoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="absolute right-0 top-10 z-50 w-80 sm:w-96 bg-white border border-[#d0d7de] rounded-md shadow-xl text-xs text-[#1f2328] animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Clone Dropdown Header */}
      <div className="p-3 border-b border-[#d0d7de] bg-[#f6f8fa] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderGit2 className="w-4 h-4 text-[#57606a]" />
          <span className="font-semibold text-[#24292f]">Clone repository</span>
        </div>
        <span className="text-[11px] text-[#57606a] font-mono">{medicinesCount} files</span>
      </div>

      {/* Tabs: HTTPS vs GitGo AI Clone */}
      <div className="flex border-b border-[#d0d7de] px-3 pt-2 bg-[#f6f8fa] space-x-4">
        <button
          onClick={() => setTab("https")}
          className={`pb-1.5 font-semibold transition border-b-2 ${
            tab === "https"
              ? "border-[#fd8c73] text-[#1f2328]"
              : "border-transparent text-[#57606a] hover:text-[#1f2328]"
          }`}
        >
          HTTPS
        </button>

        <button
          onClick={() => setTab("ai")}
          className={`pb-1.5 font-semibold transition border-b-2 flex items-center gap-1 ${
            tab === "ai"
              ? "border-[#fd8c73] text-[#1f2328]"
              : "border-transparent text-[#57606a] hover:text-[#1f2328]"
          }`}
        >
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>AI Web Clone</span>
        </button>
      </div>

      {/* Tab content */}
      <div className="p-3 space-y-3">
        {tab === "https" ? (
          <div className="space-y-3">
            <p className="text-[#57606a] text-[11px]">
              Use Git or checkout with SVN using the web URL.
            </p>

            <div className="flex items-center border border-[#d0d7de] rounded-md bg-[#f6f8fa] overflow-hidden">
              <input
                type="text"
                readOnly
                value={repoUrl}
                className="flex-1 px-2.5 py-1.5 text-xs bg-transparent font-mono text-[#24292f] focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 border-l border-[#d0d7de] hover:bg-white text-[#57606a] transition"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="pt-2 border-t border-[#d0d7de] space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenAiClone();
                }}
                className="w-full text-left py-1.5 px-2 hover:bg-[#f6f8fa] rounded flex items-center justify-between text-[#0969da] font-semibold"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Clone from Vet/Agro Website (Gemini AI)</span>
                </span>
                <span className="text-[10px] bg-[#dafbe1] text-[#1a7f37] px-1.5 py-0.2 rounded-full border border-[#4ac26b]/40">
                  Automated
                </span>
              </button>

              <a
                href="/api/medicines"
                target="_blank"
                rel="noreferrer"
                className="w-full text-left py-1.5 px-2 hover:bg-[#f6f8fa] rounded flex items-center justify-between text-[#24292f]"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#57606a]" />
                  <span>Download JSON Database Dump</span>
                </span>
                <ExternalLink className="w-3 h-3 text-[#57606a]" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[#57606a] text-[11px] leading-relaxed">
              Tashqi veterinariya va agronomik dori saytlari havolasini bering. <b>Gemini 3.8 Flash</b> saytni tahlil qilib, dori nomi, oʻlchovi, rasmlarini ajratib toʻgʻridan-toʻgʻri ushbu repositoryga commit qilib qoʻshadi.
            </p>

            <button
              onClick={() => {
                onClose();
                onOpenAiClone();
              }}
              className="w-full py-2 bg-[#1f883d] hover:bg-[#1a7f37] text-white font-semibold rounded-md shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Web Scraper oynasini ochish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
