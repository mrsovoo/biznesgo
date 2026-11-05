import React, { useState } from "react";
import {
  BookMarked,
  Plus,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  LayoutList,
  LayoutGrid,
  Users,
  GitFork,
  Star,
  Settings as SettingsIcon,
  Lightbulb,
  Trash2,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { Repository } from "../types";

interface GitHubRepositoriesDashboardProps {
  repositories: Repository[];
  onSelectRepo: (repoName: string) => void;
  onOpenNewRepoModal: () => void;
  onDeleteRepo: (repoName: string) => void;
}

export const GitHubRepositoriesDashboard: React.FC<GitHubRepositoriesDashboardProps> = ({
  repositories,
  onSelectRepo,
  onOpenNewRepoModal,
  onDeleteRepo,
}) => {
  const [filterQuery, setFilterQuery] = useState("contributed-by:@me");
  const [activeLeftTab, setActiveLeftTab] = useState<"contributions" | "repositories" | "forks" | "admin">("contributions");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter repos by search input
  const cleanSearch = filterQuery.replace("contributed-by:@me", "").trim().toLowerCase();
  const filteredRepos = repositories.filter((r) => {
    if (!cleanSearch) return true;
    return (
      r.name.toLowerCase().includes(cleanSearch) ||
      (r.description && r.description.toLowerCase().includes(cleanSearch))
    );
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#ffffff] text-[#1f2328] min-h-[calc(100vh-60px)]">
      {/* 1. Left Sidebar (My contributions, My repositories, My forks, Admin access) */}
      {!sidebarCollapsed && (
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#d0d7de] bg-[#ffffff] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <nav className="space-y-0.5 text-xs font-semibold">
              <button
                onClick={() => setActiveLeftTab("contributions")}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md transition text-left ${
                  activeLeftTab === "contributions"
                    ? "bg-[#f6f8fa] text-[#1f2328] font-bold"
                    : "text-[#57606a] hover:bg-[#f6f8fa] hover:text-[#1f2328]"
                }`}
              >
                <Users className="w-4 h-4 text-[#57606a]" />
                <span>My contributions</span>
              </button>

              <button
                onClick={() => setActiveLeftTab("repositories")}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md transition text-left ${
                  activeLeftTab === "repositories"
                    ? "bg-[#f6f8fa] text-[#1f2328] font-bold"
                    : "text-[#57606a] hover:bg-[#f6f8fa] hover:text-[#1f2328]"
                }`}
              >
                <BookMarked className="w-4 h-4 text-[#57606a]" />
                <span>My repositories</span>
              </button>

              <button
                onClick={() => setActiveLeftTab("forks")}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md transition text-left ${
                  activeLeftTab === "forks"
                    ? "bg-[#f6f8fa] text-[#1f2328] font-bold"
                    : "text-[#57606a] hover:bg-[#f6f8fa] hover:text-[#1f2328]"
                }`}
              >
                <GitFork className="w-4 h-4 text-[#57606a]" />
                <span>My forks</span>
              </button>

              <button
                onClick={() => setActiveLeftTab("admin")}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md transition text-left ${
                  activeLeftTab === "admin"
                    ? "bg-[#f6f8fa] text-[#1f2328] font-bold"
                    : "text-[#57606a] hover:bg-[#f6f8fa] hover:text-[#1f2328]"
                }`}
              >
                <SettingsIcon className="w-4 h-4 text-[#57606a]" />
                <span>Admin access</span>
              </button>
            </nav>

            <div className="pt-4 border-t border-[#d0d7de] text-xs">
              <div className="flex items-center justify-between text-[#57606a] font-semibold px-2 mb-2">
                <span>Views</span>
                <button
                  onClick={onOpenNewRepoModal}
                  className="hover:text-[#1f2328] p-0.5 rounded transition"
                  title="Yangi ko'rinish / repo qo'shish"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-[#57606a] px-2 italic">No saved views</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#d0d7de]">
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="flex items-center space-x-2 text-xs text-[#57606a] hover:text-[#1f2328] transition px-2 py-1 w-full"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse sidebar</span>
            </button>
          </div>
        </aside>
      )}

      {sidebarCollapsed && (
        <div className="hidden md:flex border-r border-[#d0d7de] p-2 items-start">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="p-1.5 text-[#57606a] hover:text-[#1f2328] rounded hover:bg-[#f6f8fa] transition"
            title="Expand sidebar"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Main Center Section: Repositories List (1-to-1 match with GitHub screenshot) */}
      <main className="flex-1 p-5 md:p-8 max-w-5xl">
        {/* Header with New repository button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-[#1f2328]">
            {activeLeftTab === "contributions" ? "My contributions" : "My repositories"}
          </h1>

          <button
            onClick={onOpenNewRepoModal}
            className="bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center space-x-1.5 shadow-2xs transition"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>New repository</span>
          </button>
        </div>

        {/* Filter input with clear X button */}
        <div className="relative mb-5">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search repositories..."
            className="w-full pl-3 pr-8 py-1.5 bg-[#ffffff] border border-[#d0d7de] rounded-md text-xs font-mono text-[#1f2328] focus:outline-none focus:ring-2 focus:ring-[#0969da]/30 focus:border-[#0969da]"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="absolute right-2.5 top-2 text-[#57606a] hover:text-[#1f2328] transition"
              title="Clear filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Subheader: Repositories count & view sorting */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d0d7de] text-xs text-[#57606a]">
          <span className="font-semibold text-[#1f2328]">
            {filteredRepos.length} repositories
          </span>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1 hover:text-[#1f2328] transition">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Relevance</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <div className="flex items-center space-x-1 border border-[#d0d7de] rounded p-0.5">
              <button className="p-0.5 text-[#1f2328] bg-[#f6f8fa] rounded">
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button className="p-0.5 text-[#57606a] hover:text-[#1f2328]">
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Repository Items List */}
        <div className="divide-y divide-[#d0d7de]/70">
          {filteredRepos.map((repo) => {
            const isMaster = repo.name === "biznesgo" || repo.name === "tbovet" || repo.name === repositories[0]?.name;
            const repoTitle = `mrsovoo / ${repo.name}`;
            const desc =
              repo.description ||
              (repo.source_url
                ? `${repo.source_url.replace(/^https?:\/\//, "")} saytidan klonlangan katalog`
                : "Veterinariya va agrokimyoviy dori vositalari repozitoriyasi");

            return (
              <div
                key={repo.name}
                onClick={() => onSelectRepo(repo.name)}
                className="py-4 hover:bg-[#f6f8fa]/60 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 rounded-md"
              >
                {/* Left side: Book icon, Repo title, description */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <BookMarked className="w-4 h-4 text-[#57606a] shrink-0" />
                    <span className="font-semibold text-sm text-[#0969da] group-hover:underline truncate font-mono">
                      {repoTitle}
                    </span>
                    {isMaster ? (
                      <span className="text-[10px] bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/40 font-semibold px-2 py-0.2 rounded-full">
                        Master Catalog
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#57606a] border border-[#d0d7de] font-medium px-2 py-0.2 rounded-full bg-white">
                        Public
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#57606a] leading-relaxed line-clamp-1 pl-6">
                    {desc}
                  </p>
                </div>

                {/* Right side: Language, Stars, Forks, Action settings */}
                <div className="flex items-center space-x-4 text-xs text-[#57606a] shrink-0 pl-6 sm:pl-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3178c6]"></span>
                    <span className="font-mono text-[11px]">TypeScript</span>
                  </div>

                  <div className="flex items-center space-x-1 font-mono text-[11px]">
                    <GitFork className="w-3.5 h-3.5" />
                    <span>0</span>
                  </div>

                  <div className="flex items-center space-x-1 font-mono text-[11px]">
                    <Star className="w-3.5 h-3.5" />
                    <span>0</span>
                  </div>

                  {!isMaster && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Haqiqatan ham "${repo.name}" repozitoriyasini va barcha unga tegishli dorilarni o'chirmoqchimisiz?`)) {
                          onDeleteRepo(repo.name);
                        }
                      }}
                      className="p-1 hover:text-[#cf222e] hover:bg-[#ffebe9] rounded transition"
                      title="Repozitoriyni o'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#57606a] hover:text-[#cf222e]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredRepos.length === 0 && (
            <div className="py-12 text-center text-xs text-[#57606a]">
              <BookMarked className="w-8 h-8 mx-auto mb-2 text-[#afb8c1]" />
              <p className="font-semibold text-[#1f2328]">Hech qanday repozitoriy topilmadi</p>
              <p className="mt-1">
                Yuqoridagi <b>New repository</b> tugmasini bosib, sayt havolasini kiriting.
              </p>
            </div>
          )}
        </div>

        {/* Footer ProTip */}
        <div className="mt-8 pt-4 border-t border-[#d0d7de] flex items-start space-x-2 text-[11px] text-[#57606a] leading-relaxed">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            <b>ProTip!</b> Using a comma within certain filters will aggregate the results. For example:{" "}
            <code className="bg-[#f6f8fa] px-1 py-0.5 rounded border border-[#d0d7de]/60 font-mono text-[#0969da]">
              language:Go,Ruby
            </code>{" "}
            will show all repositories that have either Go or Ruby as their primary language.
          </p>
        </div>
      </main>
    </div>
  );
};

