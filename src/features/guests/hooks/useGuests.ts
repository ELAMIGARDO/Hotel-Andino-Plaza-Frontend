import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
// 📥 Importamos el hook del WebSocket que creamos para el hotel
import { useWebSocketAvailability } from "../../availability/hooks/useWebSocketAvailability";

export interface HuespedExtraido {
  id: number;
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correoElectronico: string;
  telefono: string;
  reservaId: number;
  estadoOperativo: "ACTIVO" | "INACTIVO"; // 🎯 Nueva propiedad tipada para el indicador visual
}

export function useGuests() {
  const [guests, setGuests] = useState<HuespedExtraido[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  // Consulta a la API de reservas y armado dinámico del padrón único
  const cargarHuespedesDesdeReservas = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/reservas");
      const todasLasReservas = res.data;

      const mapaHuespedes = new Map<string, HuespedExtraido>();

      todasLasReservas.forEach((reserva: any) => {
        // 🔒 1. Ignoramos bloqueos de mantenimiento o registros sin cliente asignado
        if (!reserva.nombreCliente || reserva.nombreCliente.includes("INTERNO:")) return;
        if (!reserva.numeroDocumento || reserva.numeroDocumento === "00000000") return;

        // Limpiamos espacios en blanco del DNI para asegurar que la llave sea exacta
        const dniLimpio = reserva.numeroDocumento.trim();

        // 🟢 Evalúa el estatus individual de este registro en MySQL
        const estadoActual = reserva.estado === "ACTIVA" ? "ACTIVO" : "INACTIVO";

        if (!mapaHuespedes.has(dniLimpio)) {
          const nombreLimpio = reserva.nombreCliente.toLowerCase().replace(/[^a-z0-9]/g, "");
          
          mapaHuespedes.set(dniLimpio, {
            id: reserva.id,
            nombreCompleto: reserva.nombreCliente,
            tipoDocumento: reserva.tipoDocumento || "DNI",
            numeroDocumento: dniLimpio,
            correoElectronico: `${nombreLimpio || "cliente"}@gmail.com`,
            telefono: "+51 9" + dniLimpio.slice(-8),
            reservaId: reserva.id,
            estadoOperativo: estadoActual // 🔥 Guardamos el estado operativo inicial
          });
        } else {
          // 🧠 LÓGICA DE PRIORIDAD: Si el cliente ya existía en el mapa pero este renglón
          // del historial viene en estado 'ACTIVA', forzamos al indicador global a volverse
          // verde (ACTIVO), ya que el cliente se encuentra físicamente hospedado hoy.
          if (reserva.estado === "ACTIVA") {
            const registroExistente = mapaHuespedes.get(dniLimpio)!;
            registroExistente.estadoOperativo = "ACTIVO";
            mapaHuespedes.set(dniLimpio, registroExistente);
          }
        }
      });

      setGuests(Array.from(mapaHuespedes.values()));
    } catch (error) {
      console.error("Error al extraer huéspedes:", error);
      toast.error("No se pudo sincronizar el directorio de huéspedes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial al montar la pestaña
  useEffect(() => {
    cargarHuespedesDesdeReservas();
  }, [cargarHuespedesDesdeReservas]);

  // 📡 ¡TIEMPO REAL ACTIVO EN HUÉSPEDES!
  // En cuanto Spring Boot grite "UPDATE_RESERVA", esta tabla se sincroniza sola al instante
  useWebSocketAvailability({
    onUpdate: () => {
      cargarHuespedesDesdeReservas();
    },
  });

  // Filtrado reactivo por la barra de búsqueda superior
  const filteredGuests = guests.filter((g) => {
    const termino = terminoBusqueda.toLowerCase().trim();
    if (termino === "") return true;

    return (
      g.nombreCompleto.toLowerCase().includes(termino) ||
      g.numeroDocumento.includes(termino)
    );
  });

  return {
    loading,
    terminoBusqueda,
    setTerminoBusqueda,
    filteredGuests,
    recargarLista: cargarHuespedesDesdeReservas,
  };
}