import React from "react";
import {
  Bookmark,
  Eye,
  GitFork,
  Star,
  Code,
  CircleDot,
  GitPullRequest,
  PlayCircle,
  ShieldAlert,
  BarChart2,
  Settings,
} from "lucide-react";

interface GitHubRepoHeaderProps {
  activeTab: "code" | "medicines" | "insights";
  setActiveTab: (tab: "code" | "medicines" | "insights") => void;
  medicineCount: number;
  onOpenClone: () => void;
  currentRepo?: string;
  onBackToDashboard?: () => void;
}

export const GitHubRepoHeader: React.FC<GitHubRepoHeaderProps> = ({
  activeTab,
  setActiveTab,
  medicineCount,
  onOpenClone,
  currentRepo = "biznesgo",
  onBackToDashboard,
}) => {
  return (
    <div className="bg-[#f6f8fa] border-b border-[#d0d7de] pt-5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Repo title & action buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2 text-xl">
            <Bookmark className="w-5 h-5 text-[#57606a]" />
            <button
              onClick={onBackToDashboard}
              className="text-[#0969da] hover:underline font-normal cursor-pointer"
              title="Barcha repozitoriyalarga qaytish"
            >
              mrsovoo
            </button>
            <span className="text-[#57606a]">/</span>
            <span className="text-[#0969da] font-bold font-mono">
              {currentRepo}
            </span>
            <span className="text-[11px] font-medium text-[#57606a] border border-[#d0d7de] rounded-full px-2 py-0.5 ml-2 bg-white">
              Public
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button className="flex items-center space-x-1.5 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] rounded-md px-2.5 py-1 font-semibold text-[#24292f] transition">
              <span>Pin</span>
            </button>

            <div className="inline-flex rounded-md shadow-xs">
              <button className="flex items-center space-x-1.5 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] rounded-l-md px-2.5 py-1 font-semibold text-[#24292f] transition">
                <Eye className="w-3.5 h-3.5 text-[#57606a]" />
                <span>Watch</span>
              </button>
              <span className="border-t border-b border-r border-[#d0d7de] bg-white rounded-r-md px-2 py-1 text-[#24292f] font-semibold text-[11px]">
                0
              </span>
            </div>

            <div className="inline-flex rounded-md shadow-xs">
              <button className="flex items-center space-x-1.5 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] rounded-l-md px-2.5 py-1 font-semibold text-[#24292f] transition">
                <GitFork className="w-3.5 h-3.5 text-[#57606a]" />
                <span>Fork</span>
              </button>
              <span className="border-t border-b border-r border-[#d0d7de] bg-white rounded-r-md px-2 py-1 text-[#24292f] font-semibold text-[11px]">
                0
              </span>
            </div>

            <div className="inline-flex rounded-md shadow-xs">
              <button className="flex items-center space-x-1.5 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] rounded-l-md px-2.5 py-1 font-semibold text-[#24292f] transition">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Star</span>
              </button>
              <span className="border-t border-b border-r border-[#d0d7de] bg-white rounded-r-md px-2 py-1 text-[#24292f] font-semibold text-[11px]">
                0
              </span>
            </div>
          </div>
        </div>

        {/* GitHub Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto text-xs font-medium text-[#24292f] scrollbar-none">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center space-x-2 py-3 px-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "code"
                ? "border-[#fd8c73] font-semibold text-[#1f2328]"
                : "border-transparent text-[#656d76] hover:text-[#1f2328] hover:border-[#d0d7de]"
            }`}
          >
            <Code className="w-4 h-4 text-[#656d76]" />
            <span>Code</span>
          </button>

          <button
            onClick={() => setActiveTab("medicines")}
            className={`flex items-center space-x-2 py-3 px-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "medicines"
                ? "border-[#fd8c73] font-semibold text-[#1f2328]"
                : "border-transparent text-[#656d76] hover:text-[#1f2328] hover:border-[#d0d7de]"
            }`}
          >
            <CircleDot className="w-4 h-4 text-[#1a7f37]" />
            <span>Issues (Dorilar)</span>
            <span className="bg-[#afb8c1]/20 text-[#24292f] text-[11px] font-semibold px-1.5 py-0.2 rounded-full">
              {medicineCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            className={`flex items-center space-x-2 py-3 px-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "insights"
                ? "border-[#fd8c73] font-semibold text-[#1f2328]"
                : "border-transparent text-[#656d76] hover:text-[#1f2328] hover:border-[#d0d7de]"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-[#656d76]" />
            <span>Insights</span>
          </button>

          <button className="flex items-center space-x-2 py-3 px-2 border-b-2 border-transparent text-[#656d76] hover:text-[#1f2328] transition whitespace-nowrap">
            <GitPullRequest className="w-4 h-4 text-[#656d76]" />
            <span>Pull requests</span>
            <span className="bg-[#afb8c1]/20 text-[#24292f] text-[11px] font-semibold px-1.5 py-0.2 rounded-full">
              0
            </span>
          </button>

          <button className="flex items-center space-x-2 py-3 px-2 border-b-2 border-transparent text-[#656d76] hover:text-[#1f2328] transition whitespace-nowrap">
            <PlayCircle className="w-4 h-4 text-[#656d76]" />
            <span>Actions</span>
          </button>

          <button className="flex items-center space-x-2 py-3 px-2 border-b-2 border-transparent text-[#656d76] hover:text-[#1f2328] transition whitespace-nowrap">
            <ShieldAlert className="w-4 h-4 text-[#656d76]" />
            <span>Security</span>
          </button>

          <button className="flex items-center space-x-2 py-3 px-2 border-b-2 border-transparent text-[#656d76] hover:text-[#1f2328] transition whitespace-nowrap">
            <Settings className="w-4 h-4 text-[#656d76]" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
