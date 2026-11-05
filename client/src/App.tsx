import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { GitHubNavbar } from "./components/GitHubNavbar";
import { GitHubRepoHeader } from "./components/GitHubRepoHeader";
import { GitHubMedicineTable } from "./components/GitHubMedicineTable";
import { GitHubReadme } from "./components/GitHubReadme";
import { ImageModal } from "./components/ImageModal";
import { Medicine, Stats } from "./types";

export function App() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    uniqueUsers: 0,
    byUnit: {},
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [resetting, setResetting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"code" | "medicines" | "insights">("code");

  // Image modal state
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [medRes, statsRes] = await Promise.all([
        axios.get("/api/medicines", {
          params: {
            search: searchTerm || undefined,
            unit: selectedUnit !== "all" ? selectedUnit : undefined,
          },
        }),
        axios.get("/api/stats"),
      ]);

      if (medRes.data.success) {
        setMedicines(medRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedUnit]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 12 seconds so new medicines appear automatically
    const interval = setInterval(fetchData, 12000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    try {
      const res = await axios.delete(`/api/medicines/${id}`);
      if (res.data.success) {
        setMedicines((prev) => prev.filter((m) => m.id !== id));
        fetchData();
      }
    } catch (err) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  const handleResetBot = async () => {
    if (
      !confirm(
        "Botning eski xotirasi, 'Launch App' menyusi va keraksiz buyruqlarini butunlay tozalab, botni toza holatga qaytarasizmi?"
      )
    ) {
      return;
    }

    try {
      setResetting(true);
      const res = await axios.post("/api/bot/reset-menu");
      if (res.data.success) {
        alert("✅ " + res.data.message);
      }
    } catch (err: any) {
      alert("❌ Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    } finally {
      setResetting(false);
    }
  };

  const handleViewImage = (url: string, name: string) => {
    setModalImage(url);
    setModalTitle(name);
  };

  return (
    <div className="min-h-screen bg-white text-[#1f2328] font-sans flex flex-col">
      {/* 1. GitHub Top Navbar */}
      <GitHubNavbar onResetBot={handleResetBot} resetting={resetting} />

      {/* 2. GitHub Repo Header with Breadcrumb and Tabs */}
      <GitHubRepoHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        medicineCount={medicines.length}
      />

      {/* 3. Main Repo Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        <GitHubMedicineTable
          medicines={medicines}
          loading={loading}
          onDelete={handleDelete}
          onViewImage={handleViewImage}
          onRefresh={fetchData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
        />

        {/* GitHub README.md Box */}
        <GitHubReadme
          totalCount={stats.total}
          uniqueUsers={stats.uniqueUsers}
          byUnit={stats.byUnit}
        />
      </main>

      {/* 4. GitHub Footer */}
      <footer className="border-t border-[#d0d7de] py-8 px-4 text-xs text-[#57606a] mt-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" className="fill-[#57606a]">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span>© 2026 BiznesGo · GitHub Primer UI Dashboard</span>
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

      {/* Image Preview Modal */}
      <ImageModal
        isOpen={Boolean(modalImage)}
        onClose={() => setModalImage(null)}
        imageUrl={modalImage}
        title={modalTitle}
      />
    </div>
  );
}

export default App;
