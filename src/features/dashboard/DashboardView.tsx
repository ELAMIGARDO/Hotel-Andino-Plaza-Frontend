import { useState } from "react";
import { Search } from "lucide-react";
import { MetricsCards } from "./components/MetricsCards";
import { useDashboardData } from "./hooks/useDashboardData";
// 📅 Importamos la grilla reutilizable que acabamos de limpiar en los pasos anteriores
import { AvailabilityTimeline } from "../availability/components/AvailabilityTimeline";
import { BookingModal } from "../availability/components/BookingModal";

export function DashboardView() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Consumimos los estados globales de control y las referencias mutables del hook
  const { 
    metrics, 
    loading, 
    filtroGlobal, 
    setFiltroGlobal, 
    refrescarTimelineRef,
    refetch 
  } = useDashboardData();

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Calculando métricas del hotel en tiempo real...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      
      {/* Encabezado y Barra de Búsqueda Global */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Panel de Control Principal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Resumen operativo y monitoreo del Hotel Plaza Andino.
          </p>
        </div>

        {/* 🔍 Buscador Global conectado al Timeline inferior */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Búsqueda global (Cliente, Hab)..."
            value={filtroGlobal}
            onChange={(e) => setFiltroGlobal(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 shadow-sm"
          />
        </div>
      </div>

      {/* 📊 Sección de Tarjetas de Métricas Sincronizadas */}
      <MetricsCards data={metrics} />

      {/* 📅 ¡EL RECUADRO RESTAURADO! Línea de tiempo incrustada en el Dashboard */}
      <div className="mt-4">
        <AvailabilityTimeline 
          filtroGlobal={filtroGlobal}
          onOpenModal={() => setIsModalOpen(true)}
          onSuccessRefrescar={(refrescarFn) => {
            // Guardamos la función de refresco del Timeline en el hook del Dashboard
            refrescarTimelineRef.current = refrescarFn;
          }}
        />
      </div>

      {/* Modal de Reserva por si dan clic en una celda libre desde el Dashboard */}
      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refetch(); // Actualiza las tarjetas superiores
          if (refrescarTimelineRef.current) refrescarTimelineRef.current(); // Actualiza la grilla
        }}
      />
    </div>
  );
}
