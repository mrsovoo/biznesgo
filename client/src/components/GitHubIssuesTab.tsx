import React, { useState } from "react";
import { CircleDot, CheckCircle2, Search, Filter, Tag, MessageSquare, Plus } from "lucide-react";
import { Medicine } from "../types";

interface GitHubIssuesTabProps {
  medicines: Medicine[];
  onSelectMedicine: (m: Medicine) => void;
}

export const GitHubIssuesTab: React.FC<GitHubIssuesTabProps> = ({
  medicines,
  onSelectMedicine,
}) => {
  const [filter, setFilter] = useState<"open" | "closed">("open");
  const [searchTerm, setSearchTerm] = useState("");

  const simulatedIssues = [
    {
      id: 101,
      title: "Audit: Veterinar preparatlar tarkibiy xalqaro kodlarini tekshirish",
      author: "sohibjonsulaymonov",
      labels: [{ name: "audit", color: "bg-[#ddf4ff] text-[#0969da] border-[#54aeff]/40" }, { name: "vet-med", color: "bg-[#dafbe1] text-[#1a7f37] border-[#4ac26b]/40" }],
      comments: 3,
      time: "2 hours ago",
      status: "open",
    },
    {
      id: 102,
      title: "Agro o'g'itlar va fungitsidlar uchun yangi kg/litr ombor me'yorlarini belgilash",
      author: "ai-clone[bot]",
      labels: [{ name: "agro-catalog", color: "bg-[#fff8c5] text-[#9a6700] border-[#d4a72c]/40" }],
      comments: 1,
      time: "5 hours ago",
      status: "open",
    },
    {
      id: 103,
      title: "B2B dorixonalar integratsiyasi: avtomatik narx sinxronizatsiyasi",
      author: "sohibjonsulaymonov",
      labels: [{ name: "feature", color: "bg-[#fbefff] text-[#8250df] border-[#d8b9ff]/40" }, { name: "b2b-saas", color: "bg-[#ddf4ff] text-[#0969da] border-[#54aeff]/40" }],
      comments: 6,
      time: "yesterday",
      status: "open",
    },
    {
      id: 104,
      title: "Inyeksiya flakonlari (ml) uchun saqlash harorati me'yori (5°C - 20°C)",
      author: "vet-specialist",
      labels: [{ name: "pharma-rules", color: "bg-[#ffebe9] text-[#cf222e] border-[#ff8182]/40" }],
      comments: 2,
      time: "2 days ago",
      status: "closed",
    },
  ];

  // Convert some active medicines into trackable item issues
  const medicineIssues = medicines.slice(0, 10).map((m, i) => ({
    id: 200 + m.id,
    title: `Katalog nazorati: ${m.name} (${m.quantity} ${m.unit}) — ombor zaxirasini tekshirish`,
    author: m.telegram_username ? `@${m.telegram_username}` : `user_${m.telegram_user_id}`,
    labels: [
      { name: m.unit, color: "bg-[#ddf4ff] text-[#0969da] border-[#54aeff]/40" },
      { name: m.category || "preparat", color: "bg-[#dafbe1] text-[#1a7f37] border-[#4ac26b]/40" },
    ],
    comments: 0,
    time: "recently",
    status: "open",
    medicine: m,
  }));

  const allIssues = [...simulatedIssues, ...medicineIssues].filter(
    (issue) =>
      issue.status === filter &&
      (searchTerm ? issue.title.toLowerCase().includes(searchTerm.toLowerCase()) : true)
  );

  return (
    <div className="space-y-4">
      {/* Issues Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#57606a] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da] w-64 text-[#24292f] shadow-xs"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert("Yangi vazifa / dori tekshiruvi ochildi")}
            className="flex items-center space-x-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New issue</span>
          </button>
        </div>
      </div>

      {/* GitHub Issues Container */}
      <div className="border border-[#d0d7de] rounded-md overflow-hidden bg-white shadow-xs">
        {/* Issues Header */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] p-3 flex items-center justify-between text-xs text-[#57606a]">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFilter("open")}
              className={`flex items-center space-x-1.5 font-semibold transition ${
                filter === "open" ? "text-[#24292f]" : "text-[#57606a] hover:text-[#24292f]"
              }`}
            >
              <CircleDot className="w-4 h-4 text-[#1a7f37]" />
              <span>{allIssues.length} Open</span>
            </button>

            <button
              onClick={() => setFilter("closed")}
              className={`flex items-center space-x-1.5 transition ${
                filter === "closed" ? "font-semibold text-[#24292f]" : "text-[#57606a] hover:text-[#24292f]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#8250df]" />
              <span>1 Closed</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4 text-xs text-[#57606a]">
            <span className="hover:text-[#0969da] cursor-pointer">Author</span>
            <span className="hover:text-[#0969da] cursor-pointer">Label</span>
            <span className="hover:text-[#0969da] cursor-pointer">Projects</span>
            <span className="hover:text-[#0969da] cursor-pointer">Sort</span>
          </div>
        </div>

        {/* Issues Rows */}
        <div className="divide-y divide-[#d0d7de]/60 text-xs">
          {allIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-3.5 flex items-start justify-between hover:bg-[#f6f8fa] transition-colors"
            >
              <div className="flex items-start space-x-2.5">
                <CircleDot className="w-4 h-4 text-[#1a7f37] mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      onClick={() => {
                        if ((issue as any).medicine) {
                          onSelectMedicine((issue as any).medicine);
                        }
                      }}
                      className="font-semibold text-sm text-[#24292f] hover:text-[#0969da] cursor-pointer"
                    >
                      {issue.title}
                    </span>
                    {issue.labels.map((l, i) => (
                      <span
                        key={i}
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${l.color}`}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#57606a]">
                    #{issue.id} opened {issue.time} by {issue.author}
                  </p>
                </div>
              </div>

              {issue.comments > 0 && (
                <div className="flex items-center space-x-1 text-[#57606a] text-[11px] shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{issue.comments}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

