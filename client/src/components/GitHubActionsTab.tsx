import React from "react";
import { PlayCircle, CheckCircle2, Clock, GitBranch, Terminal } from "lucide-react";

export const GitHubActionsTab: React.FC = () => {
  const workflows = [
    {
      id: 42,
      name: "Gemini 3.8 Flash Scraper & Neon DB Ingestion Pipeline",
      trigger: "workflow_dispatch (AI Clone)",
      commit: "feat(clone): import 18 medications from vetpharma.uz",
      branch: "main",
      status: "success",
      duration: "14s",
      time: "2 hours ago",
    },
    {
      id: 41,
      name: "Telegram Bot Gateway & Webhook Sync",
      trigger: "push",
      commit: "fix(bot): enable express webhook with automatic drop_pending_updates",
      branch: "main",
      status: "success",
      duration: "4s",
      time: "5 hours ago",
    },
    {
      id: 40,
      name: "Zero-Leakage Security Shield & DLP Audit Verification",
      trigger: "schedule (hourly)",
      commit: "security: verify strict node A to node B perimeter",
      branch: "main",
      status: "success",
      duration: "2s",
      time: "6 hours ago",
    },
    {
      id: 39,
      name: "PostgreSQL Database Health Check & Schema Migration",
      trigger: "push",
      commit: "feat: initialize security_audit_logs and commits table",
      branch: "main",
      status: "success",
      duration: "3s",
      time: "yesterday",
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="p-3 bg-[#f6f8fa] border border-[#d0d7de] rounded-md flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PlayCircle className="w-4 h-4 text-[#0969da]" />
          <span className="font-semibold text-[#24292f]">Continuous Integration & Deployment (CI/CD)</span>
        </div>
        <span className="text-[11px] text-[#1a7f37] font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          All workflows passing
        </span>
      </div>

      <div className="border border-[#d0d7de] rounded-md overflow-hidden bg-white shadow-xs divide-y divide-[#d0d7de]/60">
        {workflows.map((wf) => (
          <div key={wf.id} className="p-3.5 flex items-center justify-between hover:bg-[#f6f8fa]">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-[#1a7f37] shrink-0" />
              <div>
                <p className="font-semibold text-sm text-[#24292f] hover:text-[#0969da] cursor-pointer">
                  {wf.name}
                </p>
                <p className="text-[11px] text-[#57606a] mt-0.5 flex items-center gap-2">
                  <span>{wf.commit}</span>
                  <span>·</span>
                  <span className="font-mono">{wf.trigger}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <GitBranch className="w-3 h-3" />
                    {wf.branch}
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-[#57606a] font-mono shrink-0">
              <p className="font-semibold text-[#24292f]">{wf.duration}</p>
              <p>{wf.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

