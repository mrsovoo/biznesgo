import React, { useState, useRef, useEffect } from "react";
import { Bell, Plus, Search, Terminal, Sparkles, Menu, BookMarked, LogOut, User } from "lucide-react";

interface GitHubNavbarProps {
  onResetBot?: () => void;
  resetting?: boolean;
  onOpenClone?: () => void;
  currentView: "dashboard" | "repo";
  onNavigateDashboard: () => void;
  currentRepo?: string;
  onSignOut?: () => void;
}

export const GitHubNavbar: React.FC<GitHubNavbarProps> = ({
  onResetBot,
  resetting,
  onOpenClone,
  currentView,
  onNavigateDashboard,
  currentRepo = "biznesgo",
  onSignOut,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <nav className="bg-[#24292f] text-white text-sm py-2 px-3 sm:px-5 flex items-center justify-between border-b border-[#30363d]">
      <div className="flex items-center space-x-3">
        {/* Hamburger Menu (matching screenshot) */}
        <button
          onClick={onNavigateDashboard}
          className="text-[#7d8590] hover:text-white p-1 rounded-md hover:bg-[#30363d] transition"
          title="Repositories ro'yxati"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* GitHub Official Logo */}
        <div
          onClick={onNavigateDashboard}
          className="flex items-center space-x-2 cursor-pointer group"
          title="Bosh sahifa / Repozitoriyalar"
        >
          <svg height="30" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="30" className="fill-white group-hover:fill-[#58a6ff] transition">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
        </div>

        {/* Repositories Breadcrumb / Switcher */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={onNavigateDashboard}
            className={`font-semibold hover:text-white transition px-2 py-1 rounded ${
              currentView === "dashboard"
                ? "bg-[#30363d] text-white"
                : "text-[#7d8590]"
            }`}
          >
            Repositories
          </button>

          {currentView === "repo" && (
            <>
              <span className="text-[#7d8590]">/</span>
              <span className="font-semibold text-white font-mono flex items-center gap-1 bg-[#161b22] px-2 py-0.5 rounded border border-[#30363d]">
                <BookMarked className="w-3 h-3 text-[#58a6ff]" />
                <span>mrsovoo / {currentRepo}</span>
              </span>
            </>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1 text-xs text-[#7d8590] w-64 focus-within:w-76 focus-within:border-[#58a6ff] transition-all">
            <Search className="w-3.5 h-3.5 mr-1.5 text-[#7d8590]" />
            <input
              type="text"
              placeholder="Type / to search"
              className="bg-transparent text-white placeholder-[#7d8590] focus:outline-none w-full text-xs"
            />
            <span className="border border-[#30363d] rounded px-1.5 py-0.2 text-[10px] font-mono bg-[#21262d] text-[#7d8590]">/</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <button className="text-[#e6edf3] hover:text-white p-1 rounded-md hover:bg-[#30363d] transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#1f6feb]"></span>
        </button>

        {/* User avatar & Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setProfileOpen((prev) => !prev)}
            className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-[#30363d] flex items-center justify-center text-[10px] font-bold text-white shadow-xs cursor-pointer hover:ring-2 hover:ring-[#58a6ff]/50 transition"
            title="mrsovoo profili & menyu"
          >
            M
          </div>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white text-[#1f2328] border border-[#d0d7de] rounded-md shadow-lg py-1.5 z-50 text-xs animate-fadeIn">
              <div className="px-3 py-2 border-b border-[#d0d7de]">
                <p className="text-[11px] text-[#57606a]">Signed in as</p>
                <p className="font-bold text-[#1f2328] font-mono">mrsovoo</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigateDashboard();
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#f6f8fa] flex items-center space-x-2 text-[#1f2328]"
                >
                  <BookMarked className="w-3.5 h-3.5 text-[#57606a]" />
                  <span>Your repositories</span>
                </button>
              </div>

              {onSignOut && (
                <div className="pt-1 border-t border-[#d0d7de]">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#ffebe9] text-[#cf222e] flex items-center space-x-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#cf222e]" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
