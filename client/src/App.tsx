import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Header } from "./components/Header";
import { StatsCards } from "./components/StatsCards";
import { MedicineTable } from "./components/MedicineTable";
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

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

  const handleViewImage = (url: string, name: string) => {
    setModalImage(url);
    setModalTitle(name);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        onRefresh={fetchData}
        loading={loading}
        totalCount={stats.total}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards stats={stats} />

        <MedicineTable
          medicines={medicines}
          loading={loading}
          onDelete={handleDelete}
          onViewImage={handleViewImage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
        />
      </main>

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

