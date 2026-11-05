import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { GitHubNavbar } from "./components/GitHubNavbar";
import { GitHubRepoHeader } from "./components/GitHubRepoHeader";
import { GitHubRepositoriesDashboard } from "./components/GitHubRepositoriesDashboard";
import { GitHubMedicineTable } from "./components/GitHubMedicineTable";
import { GitHubFileView } from "./components/GitHubFileView";
import { GitHubSidebar } from "./components/GitHubSidebar";
import { GitHubFolderReadme } from "./components/GitHubFolderReadme";
import { GitGoCloneModal } from "./components/GitGoCloneModal";
import { GitHubCopilotWidget } from "./components/GitHubCopilotWidget";
import { ImageModal } from "./components/ImageModal";
import { Medicine, Stats, Commit, Repository } from "./types";

export function App() {
  const [view, setView] = useState<"dashboard" | "repo">("dashboard");
  const [repositories, setRepositories] = useState<Repository[]>([
    { name: "biznesgo", description: "Markaziy master katalog", count: 0 },
  ]);
  const [currentRepo, setCurrentRepo] = useState<string>("biznesgo");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    uniqueUsers: 0,
    byUnit: {},
  });
  const [latestCommit, setLatestCommit] = useState<Commit | null>(null);
  const [folderCommits, setFolderCommits] = useState<Record<string, Commit>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [resetting, setResetting] = useState<boolean>(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "medicines" | "insights">("code");
  const [isCloneModalOpen, setIsCloneModalOpen] = useState<boolean>(false);

  // Image modal state
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");

  const fetchRepositories = useCallback(async () => {
    try {
      const res = await axios.get("/api/repositories");
      if (res.data.success) {
        setRepositories(res.data.data);
      }
    } catch (err) {
      console.error("Repozitoriyalarni yuklashda xato:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [medRes, statsRes, commitsRes] = await Promise.all([
        axios.get("/api/medicines", {
          params: { repository: currentRepo },
        }),
        axios.get("/api/stats", {
          params: { repository: currentRepo },
        }),
        axios.get("/api/commits", {
          params: { folder: currentFolder || undefined },
        }),
      ]);

      if (medRes.data.success) {
        setMedicines(medRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (commitsRes.data.success) {
        setLatestCommit(commitsRes.data.latest);
        setFolderCommits(commitsRes.data.folders || {});
      }
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, currentRepo]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 12000);
    const handleRefresh = () => {
      fetchRepositories();
      fetchData();
    };
    window.addEventListener("gitgo:refresh_medicines", handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("gitgo:refresh_medicines", handleRefresh);
    };
  }, [fetchData, fetchRepositories]);

  const handleDelete = async (id: number) => {
    try {
      const res = await axios.delete(`/api/medicines/${id}`);
      if (res.data.success) {
        setMedicines((prev) => prev.filter((m) => m.id !== id));
        fetchRepositories();
        if (selectedMedicine?.id === id) {
          setSelectedMedicine(null);
        }
      }
    } catch (err) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  const handleDeleteRepo = async (name: string) => {
    try {
      const res = await axios.delete(`/api/repositories/${name}`);
      if (res.data.success) {
        setCurrentRepo("biznesgo");
        fetchRepositories();
        fetchData();
      }
    } catch (err) {
      alert("Repozitoriyni o'chirishda xatolik yuz berdi");
    }
  };

  const handleSelectRepo = (repoName: string) => {
    setCurrentRepo(repoName);
    setCurrentFolder(null);
    setSelectedMedicine(null);
    setView("repo");
  };

  const handleResetBot = async () => {
    if (!confirm("Telegram botning eski buyruqlarini tozalashni xohlaysizmi?")) return;
    try {
      setResetting(true);
      const res = await axios.post("/api/bot/reset");
      if (res.data.success) {
        alert("✅ Telegram bot menyusi va eski xotirasi muvaffaqiyatli tozalandi!");
      }
    } catch (err: any) {
      alert("Xatolik: " + (err.response?.data?.message || err.message));
    } finally {
      setResetting(false);
    }
  };

  const handleViewImage = (url: string, title: string) => {
    setModalImage(url);
    setModalTitle(title);
  };

  const handleTabChange = (tab: "code" | "medicines" | "insights") => {
    setActiveTab(tab);
    if (tab === "medicines") {
      setCurrentFolder("all_medicines");
      setSelectedMedicine(null);
    } else if (tab === "code") {
      setCurrentFolder(null);
      setSelectedMedicine(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1f2328] font-sans flex flex-col">
      {/* 1. GitHub Top Navbar */}
      <GitHubNavbar
        onResetBot={handleResetBot}
        resetting={resetting}
        onOpenClone={() => setIsCloneModalOpen(true)}
        currentView={view}
        onNavigateDashboard={() => setView("dashboard")}
        currentRepo={currentRepo}
      />

      {/* VIEW 1: Main Repositories List Dashboard (Screenshot 1) */}
      {view === "dashboard" ? (
        <GitHubRepositoriesDashboard
          repositories={repositories}
          onSelectRepo={handleSelectRepo}
          onOpenNewRepoModal={() => setIsCloneModalOpen(true)}
          onDeleteRepo={handleDeleteRepo}
        />
      ) : (
        /* VIEW 2: Inside Selected Repository (Screenshot 2) */
        <div className="flex-1 flex flex-col">
          {/* GitHub Repo Header with Breadcrumb and Tabs */}
          <GitHubRepoHeader
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            medicineCount={medicines.length}
            onOpenClone={() => setIsCloneModalOpen(true)}
            currentRepo={currentRepo}
            onBackToDashboard={() => setView("dashboard")}
          />

          {/* Repo Body: Code / Folders / Files View */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
            {selectedMedicine ? (
              /* File Detail View (Code JSON + Image Inspector) */
              <GitHubFileView
                medicine={selectedMedicine}
                onBack={() => setSelectedMedicine(null)}
                onDelete={handleDelete}
                onViewImage={handleViewImage}
              />
            ) : (
              /* Repository Directory View + Right Sidebar */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-9 space-y-6 min-w-0">
                  <GitHubMedicineTable
                    medicines={medicines}
                    loading={loading}
                    onDelete={handleDelete}
                    onViewImage={handleViewImage}
                    onSelectMedicine={(m) => setSelectedMedicine(m)}
                    onRefresh={fetchData}
                    currentFolder={currentFolder}
                    setCurrentFolder={setCurrentFolder}
                    onOpenClone={() => setIsCloneModalOpen(true)}
                    latestCommit={latestCommit}
                    folderCommits={folderCommits}
                  />

                  {/* Folder-specific or Root README.md box below */}
                  <GitHubFolderReadme
                    currentFolder={currentFolder}
                    medicines={medicines}
                    totalCount={stats.total}
                    uniqueUsers={stats.uniqueUsers}
                    byUnit={stats.byUnit}
                  />
                </div>

                {/* GitHub Right Sidebar (About, Releases, Packages, Languages) */}
                <div className="lg:col-span-3">
                  <GitHubSidebar
                    totalCount={stats.total}
                    uniqueUsers={stats.uniqueUsers}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* GitHub Footer */}
      <footer className="border-t border-[#d0d7de] py-8 px-4 text-xs text-[#57606a] mt-auto bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" className="fill-[#57606a]">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span>© 2026 GitHub, Inc.</span>
          </div>

          <div className="flex flex-wrap gap-4 text-[#0969da]">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Security</a>
            <a href="#" className="hover:underline">Status</a>
            <a href="#" className="hover:underline">Docs</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>

      {/* GitGo Clone AI Modal */}
      <GitGoCloneModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onSuccess={(repoName?: string) => {
          if (repoName) {
            setCurrentRepo(repoName);
            setView("repo");
          }
          fetchRepositories();
          fetchData();
        }}
      />

      {/* Floating Copilot Widget */}
      <GitHubCopilotWidget />

      {/* Big Image Preview Modal */}
      <ImageModal
        isOpen={!!modalImage}
        onClose={() => setModalImage(null)}
        imageUrl={modalImage || ""}
        title={modalTitle}
      />
    </div>
  );
}

export default App;
