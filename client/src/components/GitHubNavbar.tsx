import React from "react";
import { Bell, Plus, Search, Terminal, Sparkles } from "lucide-react";

interface GitHubNavbarProps {
  onResetBot: () => void;
  resetting: boolean;
  onOpenClone: () => void;
}

export const GitHubNavbar: React.FC<GitHubNavbarProps> = ({
  onResetBot,
  resetting,
  onOpenClone,
}) => {
  return (
    <nav className="bg-[#24292f] text-white text-sm py-2.5 px-4 sm:px-6 flex items-center justify-between border-b border-[#30363d]">
      <div className="flex items-center space-x-4">
        {/* GitHub Official Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer">
          <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" className="fill-white">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
          <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
            GitHub
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1 text-xs text-[#7d8590] w-72 focus-within:w-84 focus-within:border-[#58a6ff] transition-all">
            <Search className="w-3.5 h-3.5 mr-2 text-[#7d8590]" />
            <input
              type="text"
              placeholder="Type / to search repositories"
              className="bg-transparent text-white placeholder-[#7d8590] focus:outline-none w-full text-xs"
            />
            <span className="border border-[#30363d] rounded px-1.5 py-0.2 text-[10px] font-mono bg-[#21262d] text-[#7d8590]">/</span>
          </div>
        </div>

        {/* GitHub Navigation Links */}
        <div className="hidden lg:flex items-center space-x-4 text-xs font-semibold text-white/90">
          <span className="hover:text-white cursor-pointer transition">Pull requests</span>
          <span className="hover:text-white cursor-pointer transition">Issues</span>
          <span className="hover:text-white cursor-pointer transition">Codespaces</span>
          <span className="hover:text-white cursor-pointer transition">Marketplace</span>
          <span className="hover:text-white cursor-pointer transition">Explore</span>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {/* Clone button styled as GitHub's green button */}
        <button
          onClick={onOpenClone}
          className="flex items-center space-x-1.5 bg-[#238636] hover:bg-[#2ea043] border border-[rgba(240,246,252,0.1)] text-white text-xs font-semibold px-2.5 py-1 rounded-md transition shadow-xs"
          title="Clone website inventory via Gemini AI"
        >
          <span className="font-mono text-[11px]">&lt;&gt;</span>
          <span>Code / Clone</span>
        </button>

        {/* Reset Bot Menu Button */}
        <button
          onClick={onResetBot}
          disabled={resetting}
          title="Botning eski 'Launch App' va menyusini tozalash"
          className="flex items-center space-x-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] text-xs font-semibold px-2 py-1 rounded-md transition shadow-xs disabled:opacity-50"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{resetting ? "Tozalanmoqda..." : "Reset Bot"}</span>
        </button>

        {/* Notifications */}
        <button className="text-[#e6edf3] hover:text-white p-1 rounded-md hover:bg-[#30363d] transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#1f6feb]"></span>
        </button>

        {/* New Item dropdown */}
        <button className="text-[#e6edf3] hover:text-white p-1 rounded-md hover:bg-[#30363d] transition">
          <Plus className="w-4 h-4" />
        </button>

        {/* User avatar */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-[#30363d] flex items-center justify-center text-[10px] font-bold text-white shadow-xs cursor-pointer">
          S
        </div>
      </div>
    </nav>
  );
};
