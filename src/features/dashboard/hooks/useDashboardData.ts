import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useWebSocketAvailability } from "../../availability/hooks/useWebSocketAvailability";

export interface DashboardMetrics {
  habitacionesDisponibles: number;
  habitacionesTotales: number;
  reservasActivas: number;
  porcentajeOcupacion: number;
}

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    habitacionesDisponibles: 0,
    habitacionesTotales: 0,
    reservasActivas: 0,
    porcentajeOcupacion: 0,
  });
  const [loading, setLoading] = useState(true);

  // 🔍 Estado para cumplir con el filtro global que exige el Timeline
  const [filtroGlobal, setFiltroGlobal] = useState("");

  // 📡 Referencia para enganchar el refresco del Timeline secundario con el WebSocket
  const refrescarTimelineRef = useRef<() => void>(() => {});

  const cargarMetricas = useCallback(async () => {
    try {
      const [resRooms, resReservas] = await Promise.all([
        axios.get("http://localhost:8080/api/habitaciones"),
        axios.get("http://localhost:8080/api/reservas"),
      ]);

      const totalHabitaciones = resRooms.data.length;
      const activas = resReservas.data.filter((res: any) => res.estado === "ACTIVA").length;
      const disponibles = totalHabitaciones - activas;
      const porcentaje = totalHabitaciones > 0 ? Math.round((activas / totalHabitaciones) * 100) : 0;

      setMetrics({
        habitacionesDisponibles: disponibles < 0 ? 0 : disponibles,
        habitacionesTotales: totalHabitaciones,
        reservasActivas: activas,
        porcentajeOcupacion: porcentaje,
      });
    } catch (error) {
      console.error("Error al calcular las métricas en el Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas]);

  // 🔌 Sincronización WebSocket dual: Actualiza las tarjetas superiores y la grilla de abajo en vivo
  useWebSocketAvailability({
    onUpdate: () => {
      cargarMetricas();
      if (refrescarTimelineRef.current) {
        refrescarTimelineRef.current(); // Ejecuta el refresco de la grilla inferior
      }
    },
  });

  return { 
    metrics, 
    loading, 
    filtroGlobal, 
    setFiltroGlobal, 
    refrescarTimelineRef,
    refetch: cargarMetricas 
  };
}
