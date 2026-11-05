import React, { useState } from "react";
import { BookMarked, Plus, Search, ExternalLink, Trash2, Globe } from "lucide-react";
import { Repository } from "../types";

interface GitHubRepoSidebarProps {
  repositories: Repository[];
  currentRepo: string;
  onSelectRepo: (repoName: string) => void;
  onOpenNewRepoModal: () => void;
  onDeleteRepo?: (repoName: string) => void;
}

export const GitHubRepoSidebar: React.FC<GitHubRepoSidebarProps> = ({
  repositories,
  currentRepo,
  onSelectRepo,
  onOpenNewRepoModal,
  onDeleteRepo,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRepos = repositories.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-[#d0d7de] p-3.5 flex flex-col space-y-3 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <h3 className="font-semibold text-xs text-[#1f2328] uppercase tracking-wide">
            Repositories
          </h3>
          <span className="bg-[#afb8c1]/20 text-[#24292f] text-[10px] font-semibold px-1.5 py-0.2 rounded-full font-mono">
            {repositories.length}
          </span>
        </div>

        <button
          onClick={onOpenNewRepoModal}
          className="bg-[#1f883d] hover:bg-[#1a7f37] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-2xs transition"
          title="Yangi sayt nomi bilan repo ochish va dori klonlash"
        >
          <Plus className="w-3 h-3" />
          <span>New</span>
        </button>
      </div>

      {/* Search repository */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#57606a]" />
        <input
          type="text"
          placeholder="Find a repository..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-2.5 py-1.5 bg-[#f6f8fa] border border-[#d0d7de] rounded-md text-xs text-[#1f2328] placeholder-[#57606a] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0969da] focus:border-[#0969da]"
        />
      </div>

      {/* Repositories list */}
      <div className="space-y-1 overflow-y-auto max-h-[360px] lg:max-h-[calc(100vh-280px)] scrollbar-thin">
        {filteredRepos.map((repo) => {
          const isActive = currentRepo === repo.name;
          const isMaster = repo.name === "biznesgo";

          return (
            <div
              key={repo.name}
              onClick={() => onSelectRepo(repo.name)}
              className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition text-xs ${
                isActive
                  ? "bg-[#ddf4ff] text-[#0969da] font-semibold border border-[#54aeff]/40"
                  : "hover:bg-[#f6f8fa] text-[#1f2328]"
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <BookMarked
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-[#0969da]" : "text-[#57606a]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="truncate font-mono">{repo.name}</span>
                    {isMaster && (
                      <span className="text-[9px] bg-[#afb8c1]/20 text-[#57606a] px-1 py-0.2 rounded shrink-0">
                        master
                      </span>
                    )}
                  </div>
                  {repo.source_url && (
                    <div className="text-[10px] text-[#57606a] truncate flex items-center gap-1 mt-0.5">
                      <Globe className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{repo.source_url.replace(/^https?:\/\//, "")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                <span className="text-[10px] bg-[#afb8c1]/20 text-[#57606a] px-1.5 py-0.2 rounded-full font-mono">
                  {repo.count || 0}
                </span>

                {!isMaster && onDeleteRepo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Haqiqatan ham "${repo.name}" repozitoriyasini o'chirmoqchimisiz?`)) {
                        onDeleteRepo(repo.name);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#cf222e] rounded transition"
                    title="Reponi o'chirish"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredRepos.length === 0 && (
          <div className="py-6 text-center text-xs text-[#57606a]">
            Repozitoriy topilmadi.
          </div>
        )}
      </div>

      {/* Quick link button */}
      <div className="pt-2 border-t border-[#d0d7de] text-[11px] text-[#57606a]">
        <button
          onClick={onOpenNewRepoModal}
          className="w-full py-1.5 text-center text-[#0969da] hover:underline flex items-center justify-center gap-1 font-medium"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Sayt linki orqali repo ochish</span>
        </button>
      </div>
    </aside>
  );
};

