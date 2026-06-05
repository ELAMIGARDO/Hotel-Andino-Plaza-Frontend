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

  // 1. 🔥 CORRECCIÓN 1: Envolvemos en useCallback y forzamos la clonación de arrays [...data]
  // Esto obliga de forma estricta a React a borrar los bloques de la pantalla al cambiar los datos
  const cargarDatosDelHotel = useCallback(async () => {
    try {
      const [resRooms, resReservas] = await Promise.all([
        axios.get("http://localhost:8080/api/habitaciones"),
        axios.get("http://localhost:8080/api/reservas"),
      ]);
      setRooms([...resRooms.data]);
      setReservas([...resReservas.data]);
    } catch (error) {
      console.error("Error al sincronizar datos del Hotel Plaza Andino:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 📡 2. ¡TIEMPO REAL ACTIVO! Escucha el WebSocket y limpia el mapa instantáneamente
  useWebSocketAvailability({
    onUpdate: () => {
      cargarDatosDelHotel();
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
    // 4. Lógica matemática de bloques flotantes del Gantt (CON CANDADO DE HISTORIAL)
  const calcularBloquesDeHabitacion = (habitacionId: number) => {
    if (fechasObjetos.length === 0) return [];
    const fechaInicioGantt = fechasObjetos[0];
    
    // 🎯 FILTRO DE EXCLUSIÓN CRÍTICO:
    // Filtramos las reservas de la habitación, pero IGNORAMOS por completo las que ya estén FINALIZADAS o CANCELADAS.
    // De esta forma, en cuanto el registro pase al historial histórico de MySQL, se borrará visualmente de la grilla.
    const reservasHabitacion = reservas.filter(
      (res) => res.habitacion.id === habitacionId && 
               res.estado !== "FINALIZADA" && 
               res.estado !== "CANCELADA"
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
          label: res.estado === "MANTENIMIENTO" 
            ? "🛠️ MANTENIMIENTO" 
            : res.estado === "LIMPIEZA" 
              ? "🧹 LIMPIEZA" 
              : res.nombreCliente ? res.nombreCliente.split(" ")[0] : "Ocupado",
          reservaOriginal: res,
        };
      })
      .filter((block) => block.duration > 0);
  };


  // 5. Filtrado reactivo de UI
  const filteredRooms = rooms.filter((room) => {
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
    cargarDatosDelHotel, // 🎯 Aseguramos la exportación correcta de la función real
    isDetailOpen,
    setIsDetailOpen,
    reservaSeleccionada,
    setReservaSeleccionada,
  };
}
