import { useState, useEffect } from "react";
import axios from "axios";
import { format, addDays, startOfWeek } from "date-fns";

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
  fechaSalida: string;  // "YYYY-MM-DD"
  estado: string;       // "ACTIVA", "FINALIZADA", "CANCELADA"
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

  // 1. Función para consultar los datos del Backend (Spring Boot)
  const consultarBackend = async () => {
    try {
      const [resRooms, resReservas] = await Promise.all([
        axios.get("http://localhost:8080/api/habitaciones"),
        axios.get("http://localhost:8080/api/reservas"),
      ]);
      setRooms(resRooms.data);
      setReservas(resReservas.data);
    } catch (error) {
      console.error("Error al conectar con la API de Spring Boot:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
  // 2. CORREGIDO: Forzar que la lista de días empiece exactamente HOY y no el lunes pasado
  const hoy = new Date(); 
  hoy.setHours(0, 0, 0, 0); // Limpiamos horas para evitar errores de zona horaria

  // Generamos 7 días correlativos empezando desde HOY (Día 7, Día 8, Día 9...)
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
}, []); 

  // 3. Verificación de ocupación basada en Strings planos para destruir el bug de Timezone (un día menos)
  const verificarOcupacion = (habitacionId: number, fechaColumna: Date): ReservaReal | undefined => {
    const anoCol = fechaColumna.getFullYear();
    const mesCol = fechaColumna.getMonth();
    const diaCol = fechaColumna.getDate();
    const timeColumna = new Date(anoCol, mesCol, diaCol, 0, 0, 0, 0).getTime();

    return reservas.find((reserva) => {
      if (reserva.habitacion.id !== habitacionId) return false;
      
      // 🛑 REMOVIDO: Ya no filtramos por r.estado === 'ACTIVA'. Queremos leer MANTENIMIENTO y LIMPIEZA.
      // Solo ignoramos las reservas viejas archivadas
      if (reserva.estado === "FINALIZADA" || reserva.estado === "CANCELADA") return false;

      const [anoI, mesI, diaI] = reserva.fechaIngreso.split("-").map(Number);
      const [anoS, mesS, diaS] = reserva.fechaSalida.split("-").map(Number);

      const timeInicio = new Date(anoI, mesI - 1, diaI, 0, 0, 0, 0).getTime();
      const timeFin = new Date(anoS, mesS - 1, diaS, 0, 0, 0, 0).getTime();

      return timeColumna >= timeInicio && timeColumna <= timeFin;
    });
  };

  // 4. Filtrado combinado (Por select de tipo, barra local y barra global del dashboard)
  const filteredRooms = rooms.filter((room) => {
    const cumpleFiltroTipo = filterType === "all" || room.tipo.toLowerCase() === filterType.toLowerCase();
    const cumpleBusquedaInferior = room.numero.includes(buscarNumero);
    const terminoGlobal = filtroGlobal.toLowerCase().trim();

    if (terminoGlobal === "") {
      return cumpleFiltroTipo && cumpleBusquedaInferior;
    }

    const coincideHabitacion = room.numero.toLowerCase().includes(terminoGlobal) || room.tipo.toLowerCase().includes(terminoGlobal);
    
    const coincideConReservaOCliente = reservas.some((reserva) => {
      if (reserva.habitacion.id !== room.id) return false;
      const coincideIdReserva = reserva.id.toString().includes(terminoGlobal);
      const coincideNombreCliente = reserva.nombreCliente && reserva.nombreCliente.toLowerCase().includes(terminoGlobal);
      const coincideDocumento = reserva.numeroDocumento && reserva.numeroDocumento.includes(terminoGlobal);
      return coincideIdReserva || coincideNombreCliente || coincideDocumento;
    });

    return cumpleFiltroTipo && cumpleBusquedaInferior && (coincideHabitacion || coincideConReservaOCliente);
  });

  // Retornamos todos los estados y funciones que necesita AvailabilityTimeline.tsx
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
