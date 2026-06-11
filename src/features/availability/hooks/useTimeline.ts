import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { addDays } from "date-fns";

// Interfaces de tipado estricto para las respuestas de Spring Boot
export interface HabitacionReal {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
  disponible: boolean;
}

export interface ReservaReal {
  id: number;
  nombreCliente: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaIngreso: string; // "YYYY-MM-DD"
  fechaSalida: string;   // "YYYY-MM-DD"
  estado: string;        // "ACTIVA", "FINALIZADA", "CANCELADA"
  habitacion: {
    id: number;
  };
}

interface UseTimelineProps {
  onSuccessRefrescar?: (refrescarFn: () => void) => void;
  filtroGlobal: string;
}

export function useTimeline({ onSuccessRefrescar, filtroGlobal }: UseTimelineProps) {
  const [filterType, setFilterType] = useState("all");
  const [buscarNumero, setBuscarNumero] = useState("");
  
  // Estados de datos sincronizados con MySQL
  const [rooms, setRooms] = useState<HabitacionReal[]>([]);
  const [reservas, setReservas] = useState<ReservaReal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para la cabecera dinámica de días
  const [fechasSemana, setFechasSemana] = useState<Date[]>([]);
  const [days, setDays] = useState<string[]>([]);
  
  // Estados para el manejo de modales
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaReal | null>(null);

  // 1. Función para consultar los datos del Backend (Spring Boot) - COMPLETAMENTE CORREGIDA
  const consultarBackend = useCallback(async () => {
    // Recuperamos las credenciales almacenadas del login activo en formato "usuario:password"
    const credentials = localStorage.getItem("auth_token");

    if (!credentials) {
      console.warn("useTimeline: No se encontraron credenciales en localStorage.");
      setLoading(false);
      return;
    }

    try {
      // 🛠️ CORRECCIÓN CRÍTICA: Convertimos el string "usuario:password" a Base64 para HTTP Basic [1]
      const tokenBase64 = btoa(credentials);

      const configHeaders = {
        headers: {
          "Authorization": `Basic ${tokenBase64}`,
          "Content-Type": "application/json"
        }
      };

      const [resRooms, resReservas] = await Promise.all([
        axios.get("http://localhost:8080/api/habitaciones", configHeaders),
        axios.get("http://localhost:8080/api/reservas", configHeaders),
      ]);

      // Aseguramos que la respuesta contenga arreglos para evitar bugs si la API cambia
      setRooms(Array.isArray(resRooms.data) ? resRooms.data : []);
      setReservas(Array.isArray(resReservas.data) ? resReservas.data : []);
    } catch (error) {
      console.error("Error al conectar con la API de Spring Boot en Timeline:", error);
      // En caso de error, vaciamos de forma segura para evitar crashes de renderizado
      setRooms([]);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 2. Forzar que la lista de días empiece exactamente HOY
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Generamos 7 días correlativos empezando desde HOY
    const listaFechas = Array.from({ length: 7 }).map((_, idx) => addDays(hoy, idx));
    const listaHeaders = listaFechas.map((fecha) => {
      const nombreDia = fecha.toLocaleDateString("es-ES", { weekday: "short" });
      const numeroDia = fecha.getDate();
      const nombreCapitalizado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
      return `${nombreCapitalizado} ${numeroDia < 10 ? `0${numeroDia}` : numeroDia}`;
    });

    setFechasSemana(listaFechas);
    setDays(listaHeaders);

    // Carga inicial del backend
    consultarBackend();

    if (onSuccessRefrescar) {
      onSuccessRefrescar(consultarBackend);
    }
  }, [consultarBackend, onSuccessRefrescar]);

  // 3. Verificación de ocupación basada en Strings planos
  const verificarOcupacion = (habitacionId: number, fechaColumna: Date): ReservaReal | undefined => {
    const seguroReservas = Array.isArray(reservas) ? reservas : [];
    const anoCol = fechaColumna.getFullYear();
    const mesCol = fechaColumna.getMonth();
    const diaCol = fechaColumna.getDate();
    const timeColumna = new Date(anoCol, mesCol, diaCol, 0, 0, 0, 0).getTime();

    return seguroReservas.find((reserva) => {
      if (!reserva || !reserva.habitacion || reserva.habitacion.id !== habitacionId) return false;
      if (reserva.estado === "FINALIZADA" || reserva.estado === "CANCELADA") return false;

      const [anoI, mesI, diaI] = reserva.fechaIngreso.split("-").map(Number);
      const [anoS, mesS, diaS] = reserva.fechaSalida.split("-").map(Number);

      const timeInicio = new Date(anoI, mesI - 1, diaI, 0, 0, 0, 0).getTime();
      const timeFin = new Date(anoS, mesS - 1, diaS, 0, 0, 0, 0).getTime();

      return timeColumna >= timeInicio && timeColumna <= timeFin;
    });
  };

  // 4. Filtrado combinado (Por select de tipo, barra local y barra global)
  const seguroRooms = Array.isArray(rooms) ? rooms : [];
  const seguroReservas = Array.isArray(reservas) ? reservas : [];

  const filteredRooms = seguroRooms.filter((room) => {
    if (!room) return false;
    const cumpleFiltroTipo = filterType === "all" || room.tipo.toLowerCase() === filterType.toLowerCase();
    const cumpleBusquedaInferior = room.numero.includes(buscarNumero);
    const terminoGlobal = filtroGlobal.toLowerCase().trim();

    if (terminoGlobal === "") {
      return cumpleFiltroTipo && cumpleBusquedaInferior;
    }

    const coincideHabitacion = room.numero.toLowerCase().includes(terminoGlobal) || room.tipo.toLowerCase().includes(terminoGlobal);
    
    const coincideConReservaOCliente = seguroReservas.some((reserva) => {
      if (!reserva || !reserva.habitacion || reserva.habitacion.id !== room.id) return false;
      const coincideIdReserva = reserva.id.toString().includes(terminoGlobal);
      const coincideNombreCliente = reserva.nombreCliente && reserva.nombreCliente.toLowerCase().includes(terminoGlobal);
      const coincideDocumento = reserva.numeroDocumento && reserva.numeroDocumento.includes(terminoGlobal);
      return coincideIdReserva || coincideNombreCliente || coincideDocumento;
    });

    return cumpleFiltroTipo && cumpleBusquedaInferior && (coincideHabitacion || coincideConReservaOCliente);
  });

  return {
    filterType,
    setFilterType,
    buscarNumero,
    setBuscarNumero,
    loading,
    days,
    fechasSemana,
    filteredRooms,
    isDetailOpen,
    setIsDetailOpen,
    reservaSeleccionada,
    setReservaSeleccionada,
    verificarOcupacion,
    consultarBackend
  };
}
