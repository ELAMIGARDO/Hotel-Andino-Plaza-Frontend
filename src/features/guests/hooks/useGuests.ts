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
    // 🔑 RECUPERACIÓN DE LAS CREDENCIALES REALES EN FORMATO "usuario:password"
    const credentials = localStorage.getItem("auth_token");

    if (!credentials) {
      console.warn("useGuests: No se encontraron credenciales válidas en localStorage.");
      setLoading(false);
      return;
    }

    try {
      // 🛠️ CORRECCIÓN CRÍTICA: Convertimos el string "usuario:password" a Base64 para HTTP Basic
      const tokenBase64 = btoa(credentials);

      const configHeaders = {
        headers: {
          "Authorization": `Basic ${tokenBase64}`,
          "Content-Type": "application/json"
        }
      };

      const res = await axios.get("http://localhost:8080/api/reservas", configHeaders);

      // 🛡️ SALVAGUARDA: Forzamos la validación de un array para el forEach
      const todasLasReservas = Array.isArray(res.data) ? res.data : [];
      const mapaHuespedes = new Map<string, HuespedExtraido>();

      todasLasReservas.forEach((reserva: any) => {
        // 🔒 1. Ignoramos bloqueos de mantenimiento o registros sin cliente asignado
        if (!reserva || !reserva.nombreCliente || reserva.nombreCliente.includes("INTERNO:")) return;
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
      setGuests([]); // En caso de fallo de autenticación o red, vaciamos de forma segura
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
      const tokenActivo = localStorage.getItem("auth_token");
      if (tokenActivo) {
        cargarHuespedesDesdeReservas();
      }
    },
  });

  // Filtrado reactivo por la barra de búsqueda superior
  const seguroGuests = Array.isArray(guests) ? guests : [];
  const filteredGuests = seguroGuests.filter((g) => {
    if (!g) return false;
    const termino = terminoBusqueda.toLowerCase().trim();
    if (termino === "") return true;
    return (
      g.nombreCompleto.toLowerCase().includes(termino) || g.numeroDocumento.includes(termino)
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
