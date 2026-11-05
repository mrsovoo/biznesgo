import React from "react";
import { GitPullRequest, CheckCircle2, MessageSquare, Plus, GitMerge } from "lucide-react";

export const GitHubPullRequestsTab: React.FC = () => {
  const prs = [
    {
      id: 12,
      title: "sync(catalog): Gemini 3.8 Flash orqali vet-pharma.uz dori vositalarini master bazaga qo'shish",
      author: "ai-clone[bot]",
      branch: "clone-pipeline",
      into: "main",
      status: "open",
      comments: 2,
      time: "1 hour ago",
      labels: [{ name: "automated", color: "bg-[#ddf4ff] text-[#0969da] border-[#54aeff]/40" }, { name: "neon-db", color: "bg-[#dafbe1] text-[#1a7f37] border-[#4ac26b]/40" }],
    },
    {
      id: 11,
      title: "feat(b2b): ombor qoldig'i va kelish/sotish narxlari modullarini ulash",
      author: "sohibjonsulaymonov",
      branch: "b2b-integration",
      into: "main",
      status: "merged",
      comments: 4,
      time: "yesterday",
      labels: [{ name: "b2b-saas", color: "bg-[#fbefff] text-[#8250df] border-[#d8b9ff]/40" }],
    },
    {
      id: 10,
      title: "security(dlp): zero-leakage ma'lumotlar to'sig'i va audit jurnallari",
      author: "sohibjonsulaymonov",
      branch: "security-gate",
      into: "main",
      status: "merged",
      comments: 1,
      time: "2 days ago",
      labels: [{ name: "security", color: "bg-[#ffebe9] text-[#cf222e] border-[#ff8182]/40" }],
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <p className="text-[#57606a]">
          Data synchronization and catalog integration Pull Requests.
        </p>

        <button
          onClick={() => alert("Yangi sinxronizatsiya PR yaratildi")}
          className="flex items-center space-x-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New pull request</span>
        </button>
      </div>

      {/* PR Table Container */}
      <div className="border border-[#d0d7de] rounded-md overflow-hidden bg-white shadow-xs">
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] p-3 flex items-center justify-between text-xs text-[#57606a]">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 font-semibold text-[#24292f]">
              <GitPullRequest className="w-4 h-4 text-[#1a7f37]" />
              <span>1 Open</span>
            </span>

            <span className="flex items-center space-x-1 text-[#57606a]">
              <CheckCircle2 className="w-4 h-4 text-[#8250df]" />
              <span>2 Merged</span>
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#d0d7de]/60">
          {prs.map((pr) => (
            <div key={pr.id} className="p-3.5 flex items-start justify-between hover:bg-[#f6f8fa]">
              <div className="flex items-start space-x-2.5">
                {pr.status === "open" ? (
                  <GitPullRequest className="w-4 h-4 text-[#1a7f37] mt-0.5 shrink-0" />
                ) : (
                  <GitMerge className="w-4 h-4 text-[#8250df] mt-0.5 shrink-0" />
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-sm text-[#24292f] hover:text-[#0969da] cursor-pointer">
                      {pr.title}
                    </span>
                    {pr.labels.map((l, i) => (
                      <span
                        key={i}
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${l.color}`}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#57606a]">
                    #{pr.id} by {pr.author} · {pr.time} · <code>{pr.branch}</code> into <code>{pr.into}</code>
                  </p>
                </div>
              </div>

              {pr.comments > 0 && (
                <div className="flex items-center space-x-1 text-[#57606a] text-[11px] shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{pr.comments}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
