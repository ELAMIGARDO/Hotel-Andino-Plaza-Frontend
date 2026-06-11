import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { parseISO, addDays, differenceInDays } from "date-fns";
import { useWebSocketAvailability } from "./useWebSocketAvailability";

export interface HabitacionReal {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
  disponible: boolean;
}

interface ReservaReal {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCliente: string;
  fechaIngreso: string;
  fechaSalida: string;
  estado: string;
  habitacion: {
    id: number;
    numero: string;
    tipo: string;
    precio: number;
    disponible: boolean;
  };
}

export function useAvailabilityView() {
  const [roomType, setRoomType] = useState("Todas");
  const [roomStatus, setRoomStatus] = useState("Todos");
  const [rooms, setRooms] = useState<HabitacionReal[]>([]);
  const [reservas, setReservas] = useState<ReservaReal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [days, setDays] = useState<string[]>([]);
  const [fechasObjetos, setFechasObjetos] = useState<Date[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<any>(null);

  // 1. 🔥 Función para consultar los datos del Backend (Spring Boot) - COMPLETAMENTE CORREGIDA EN BASE64
  const cargarDatosDelHotel = useCallback(async () => {
    // 🔑 RECUPERACIÓN DE LAS CREDENCIALES REALES EN FORMATO "usuario:password"
    const credentials = localStorage.getItem("auth_token");

    // Si no existen credenciales guardadas, evitamos disparar peticiones fallidas a ciegas
    if (!credentials) {
      console.warn("useAvailabilityView: No se encontraron credenciales válidas en localStorage.");
      setLoading(false);
      return;
    }

    try {
      // 🛠️ CORRECCIÓN CRÍTICA: Convertimos el string "usuario:password" a Base64 para tu Spring Security
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

      // Salvaguarda: Forzamos a que siempre se reciba un array válido de la API
      const dataRooms = Array.isArray(resRooms.data) ? resRooms.data : [];
      const dataReservas = Array.isArray(resReservas.data) ? resReservas.data : [];

      setRooms([...dataRooms]);
      setReservas([...dataReservas]);
    } catch (error) {
      console.error("Error al sincronizar datos del Hotel Plaza Andino en Vista Disponibilidad:", error);
      // En caso de error de red o de autenticación, vaciamos los estados de forma segura
      setRooms([]);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 📡 2. ¡TIEMPO REAL ACTIVO! Escucha el WebSocket y limpia el mapa instantáneamente
  useWebSocketAvailability({
    onUpdate: () => {
      const tokenActivo = localStorage.getItem("auth_token");
      if (tokenActivo) {
        cargarDatosDelHotel();
      }
    },
  });

  useEffect(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const listaFechas: Date[] = [];
    const listaHeaders: string[] = [];

    for (let i = 0; i < 10; i++) {
      const nuevaFecha = addDays(hoy, i);
      listaFechas.push(nuevaFecha);
      
      const nombreDia = nuevaFecha.toLocaleDateString("es-ES", { weekday: "short" });
      const numeroDia = nuevaFecha.getDate();
      const numeroFormateado = numeroDia < 10 ? `0${numeroDia}` : numeroDia;
      const nombreCapitalizado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1, 3);
      
      listaHeaders.push(`${nombreCapitalizado} ${numeroFormateado}`);
    }

    setFechasObjetos(listaFechas);
    setDays(listaHeaders);
    
    cargarDatosDelHotel();
  }, [cargarDatosDelHotel]);

  // 4. Lógica matemática de bloques flotantes del Gantt
  const calcularBloquesDeHabitacion = (habitacionId: number) => {
    if (fechasObjetos.length === 0) return [];
    const fechaInicioGantt = fechasObjetos[0];

    const seguroReservas = Array.isArray(reservas) ? reservas : [];

    const reservasHabitacion = seguroReservas.filter(
      (res) => res && res.habitacion && res.habitacion.id === habitacionId && res.estado !== "FINALIZADA" && res.estado !== "CANCELADA"
    );

    return reservasHabitacion
      .map((res) => {
        const inicioReserva = parseISO(res.fechaIngreso);
        const finReserva = parseISO(res.fechaSalida);
        
        let startIdx = differenceInDays(inicioReserva, fechaInicioGantt);
        let duracion = differenceInDays(finReserva, inicioReserva) + 1;
        
        const esBloqueoOperativo = res.estado === "MANTENIMIENTO" || res.estado === "LIMPIEZA";
        
        if (esBloqueoOperativo && res.fechaIngreso === res.fechaSalida) {
          duracion = 1;
        }
        
        if (startIdx < 0) {
          duracion += startIdx;
          startIdx = 0;
        }
        
        if (startIdx + duracion > 10) {
          duracion = 10 - startIdx;
        }

        let clasesColor = "bg-red-500 hover:bg-red-600"; // Rojo por defecto
        
        if (res.estado === "MANTENIMIENTO") {
          clasesColor = "bg-slate-500 hover:bg-slate-600"; // Gris Puro
        } else if (res.estado === "LIMPIEZA") {
          clasesColor = "bg-amber-500 hover:bg-amber-600"; // Amarillo / Ámbar
        }

        return {
          start: startIdx,
          duration: duracion,
          status: res.estado,
          colorTailwind: clasesColor,
          label: res.estado === "MANTENIMIENTO" ? "🛠️ MANTENIMIENTO" : res.estado === "LIMPIEZA" ? "🧹 LIMPIEZA" : res.nombreCliente ? res.nombreCliente.split(" ")[0] : "Ocupado",
          reservaOriginal: res,
        };
      })
      .filter((block) => block.duration > 0);
  };

  // 5. Filtrado reactivo de UI
  const seguroRooms = Array.isArray(rooms) ? rooms : [];
  const filteredRooms = seguroRooms.filter((room) => {
    if (!room) return false;
    if (roomType !== "Todas" && room.tipo !== roomType) return false;
    if (roomStatus !== "Todos") {
      const bloques = calcularBloquesDeHabitacion(room.id);
      if (roomStatus === "Disponible" && bloques.length > 0) return false;
      if (roomStatus === "Ocupado" && bloques.length === 0) return false;
    }
    return true;
  });

  return {
    roomType,
    setRoomType,
    roomStatus,
    setRoomStatus,
    loading,
    isModalOpen,
    setIsModalOpen,
    days,
    filteredRooms,
    calcularBloquesDeHabitacion,
    cargarDatosDelHotel,
    isDetailOpen,
    setIsDetailOpen,
    reservaSeleccionada,
    setReservaSeleccionada,
  };
}
