import React from "react";
import { Tag, Package, Users, Activity, ExternalLink, ShieldCheck } from "lucide-react";

interface GitHubSidebarProps {
  totalCount: number;
  uniqueUsers: number;
}

export const GitHubSidebar: React.FC<GitHubSidebarProps> = ({ totalCount, uniqueUsers }) => {
  return (
    <div className="space-y-6 text-xs text-[#57606a]">
      {/* About Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-[#1f2328]">About</h3>
        <p className="text-[#1f2328] leading-relaxed">
          High-performance distributed database & inventory catalog with real-time Telegram integration and Neon PostgreSQL persistence.
        </p>

        <div className="flex items-center space-x-2 text-[#0969da] pt-1 font-semibold">
          <ExternalLink className="w-3.5 h-3.5" />
          <a href="https://t.me/biznesgo_bot" target="_blank" rel="noreferrer" className="hover:underline">
            https://t.me/biznesgo_bot
          </a>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2">
          <span className="bg-[#ddf4ff] text-[#0969da] hover:bg-[#b6e3ff] px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition">
            postgresql
          </span>
          <span className="bg-[#ddf4ff] text-[#0969da] hover:bg-[#b6e3ff] px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition">
            telegram-bot
          </span>
          <span className="bg-[#ddf4ff] text-[#0969da] hover:bg-[#b6e3ff] px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition">
            neon-db
          </span>
          <span className="bg-[#ddf4ff] text-[#0969da] hover:bg-[#b6e3ff] px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition">
            inventory
          </span>
        </div>

        <div className="space-y-2 pt-2 border-t border-[#d0d7de] text-[#1f2328]">
          <div className="flex items-center justify-between">
            <span className="text-[#57606a]">Total Records:</span>
            <span className="font-semibold font-mono">{totalCount} items</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#57606a]">Contributors (Authors):</span>
            <span className="font-semibold font-mono">{uniqueUsers} users</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#57606a]">Database Health:</span>
            <span className="text-[#1a7f37] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* Releases Section */}
      <div className="pt-4 border-t border-[#d0d7de] space-y-2">
        <h3 className="font-semibold text-sm text-[#1f2328] flex items-center justify-between">
          <span>Releases</span>
          <span className="bg-[#afb8c1]/20 text-[#24292f] text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
            1
          </span>
        </h3>
        <div className="flex items-center space-x-2 text-[#1f2328]">
          <Tag className="w-3.5 h-3.5 text-[#1a7f37]" />
          <span className="font-semibold hover:text-[#0969da] cursor-pointer">v1.2.0</span>
          <span className="bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/40 text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
            Latest
          </span>
        </div>
        <p className="text-[11px] text-[#57606a]">Production deployment on Render + Neon</p>
      </div>

      {/* Packages Section */}
      <div className="pt-4 border-t border-[#d0d7de] space-y-2">
        <h3 className="font-semibold text-sm text-[#1f2328]">Packages</h3>
        <p className="text-[11px] text-[#57606a]">No packages published</p>
      </div>

      {/* Languages Section */}
      <div className="pt-4 border-t border-[#d0d7de] space-y-2">
        <h3 className="font-semibold text-sm text-[#1f2328]">Languages</h3>
        <div className="h-2 rounded-full overflow-hidden flex w-full">
          <div className="bg-[#3178c6] w-[78%]" title="TypeScript 78.4%"></div>
          <div className="bg-[#336791] w-[14%]" title="PostgreSQL 14.2%"></div>
          <div className="bg-[#e34c26] w-[8%]" title="HTML/CSS 7.4%"></div>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3178c6]"></span>
            <span className="font-semibold text-[#1f2328]">TypeScript</span>
            <span className="text-[#57606a]">78.4%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#336791]"></span>
            <span className="font-semibold text-[#1f2328]">SQL</span>
            <span className="text-[#57606a]">14.2%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#e34c26]"></span>
            <span className="font-semibold text-[#1f2328]">HTML/CSS</span>
            <span className="text-[#57606a]">7.4%</span>
          </span>
        </div>
      </div>
    </div>
  );
};

