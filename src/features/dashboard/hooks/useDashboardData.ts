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
  const [filtroGlobal, setFiltroGlobal] = useState("");
  const refrescarTimelineRef = useRef<() => void>(() => {});

  const cargarMetricas = useCallback(async () => {
    // 🔑 RECUPERACIÓN DE LAS CREDENCIALES REALES EN FORMATO "usuario:password"
    const credentials = localStorage.getItem("auth_token");

    // Si no existen credenciales guardadas, evitamos disparar peticiones fallidas a ciegas
    if (!credentials) {
      console.warn("useDashboardData: No se encontraron credenciales válidas en localStorage.");
      setLoading(false);
      return;
    }

    try {
      // 2. Creamos de forma segura la cadena Base64 requerida por el estándar HTTP Basic
      const tokenBase64 = btoa(credentials);

      const configHeaders = {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      };

      const [resRooms, resReservas] = await Promise.all([
        axios.get("http://localhost:8080/api/habitaciones", configHeaders),
        axios.get("http://localhost:8080/api/reservas", configHeaders),
      ]);

      const roomsData = Array.isArray(resRooms.data) ? resRooms.data : [];
      const reservasData = Array.isArray(resReservas.data) ? resReservas.data : [];

      const totalHabitaciones = roomsData.length;

      // 🛠️ MODIFICACIÓN PREVENTIVA EXCLUSIVA: Descontamos huéspedes, mantenimiento y limpieza de la disponibilidad física
      const habitacionesFisicamenteBloqueadas = reservasData.filter((res: any) => {
        return res && (res.estado === "ACTIVA" || res.estado === "MANTENIMIENTO" || res.estado === "LIMPIEZA");
      }).length;

      const disponibles = totalHabitaciones - habitacionesFisicamenteBloqueadas;

      // 💰 SEPARACIÓN COMERCIAL: El conteo activo y el porcentaje de ocupación solo toman huéspedes "ACTIVA" (dinero neto)
      const activosComerciales = reservasData.filter((res: any) => res && res.estado === "ACTIVA").length;
      const porcentaje = totalHabitaciones > 0 ? Math.round((activosComerciales / totalHabitaciones) * 100) : 0;

      setMetrics({
        habitacionesDisponibles: disponibles < 0 ? 0 : disponibles,
        habitacionesTotales: totalHabitaciones,
        reservasActivas: activosComerciales, // Sigue marcando solo los que pagan
        porcentajeOcupacion: porcentaje,     // El porcentaje no se altera por reparaciones
      });
    } catch (error) {
      console.error("Error al conectar con el backend Auth Basic:", error);
      // 🛠️ CORRECCIÓN: Reseteo preventivo seguro (Se cambia totalHabitaciones por 0 para evitar el error de variable no encontrada)
      setMetrics({
        habitacionesDisponibles: 0,
        habitacionesTotales: 0,
        reservasActivas: 0,
        porcentajeOcupacion: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas]);

  // 🔌 Sincronización WebSocket controlada para evitar inundación de ciclos por errores
  useWebSocketAvailability({
    onUpdate: () => {
      const tokenActivo = localStorage.getItem("auth_token");
      if (tokenActivo) {
        cargarMetricas();
        if (refrescarTimelineRef.current) {
          refrescarTimelineRef.current();
        }
      }
    },
  });

  return {
    metrics,
    loading,
    filtroGlobal,
    setFiltroGlobal,
    refrescarTimelineRef,
    refetch: cargarMetricas,
  };
}
