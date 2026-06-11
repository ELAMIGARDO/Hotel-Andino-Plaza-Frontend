import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { addDays } from "date-fns";
// 🛠️ CORRECCIÓN CRÍTICA: Importamos el escuchador nativo de WebSockets de tu hotel
import { useWebSocketAvailability } from "../../availability/hooks/useWebSocketAvailability";

export function useClientTimeline() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<string[]>([]);
  const [fechasSemana, setFechasSemana] = useState<Date[]>([]);
  
  // 📅 Estados para el flujo de reserva del cliente (Apertura del modal flotante)
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // 🌐 Petición pública al backend (Sin cabeceras de autorización Basic de Spring Security)
  const cargarDatosPublicos = useCallback(async () => {
    try {
      const [resRooms, resReservas] = await Promise.all([
        axios.get("http://localhost:8080/api/habitaciones"),
        axios.get("http://localhost:8080/api/reservas"),
      ]);
      setRooms(Array.isArray(resRooms.data) ? resRooms.data : []);
      setReservas(Array.isArray(resReservas.data) ? resReservas.data : []);
    } catch (error) {
      console.error("Error en la carga pública del cliente:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔌 TIEMPO REAL ACTIVO: En cuanto Spring Boot grite un cambio, actualizamos al cliente de inmediato
  useWebSocketAvailability({
    onUpdate: () => {
      if (cargarDatosPublicos) {
        cargarDatosPublicos(); 
      }
    },
  });

  useEffect(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Generamos los 7 días correlativos a partir de HOY para el Gantt del cliente
    const listaFechas = Array.from({ length: 7 }).map((_, idx) => addDays(hoy, idx));
    const listaHeaders = listaFechas.map((fecha) => {
      const nombreDia = fecha.toLocaleDateString("es-ES", { weekday: "short" });
      const numeroDia = fecha.getDate();
      const nombreCapitalizado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1, 3);
      return `${nombreCapitalizado} ${numeroDia < 10 ? `0${numeroDia}` : numeroDia}`;
    });

    setFechasSemana(listaFechas);
    setDays(listaHeaders);
    cargarDatosPublicos();
  }, [cargarDatosPublicos]);

  // 🔍 Verifica celda por celda si el rango de fechas está libre u ocupado por MySQL
  const obtenerEstadoCelda = (habitacionId: number, fechaColumna: Date) => {
    const timeColumna = new Date(fechaColumna.getFullYear(), fechaColumna.getMonth(), fechaColumna.getDate(), 0, 0, 0, 0).getTime();

    const choque = reservas.find((res) => {
      if (!res || !res.habitacion || res.habitacion.id !== habitacionId) return false;
      if (res.estado === "FINALIZADA" || res.estado === "CANCELADA") return false;

      const [anoI, mesI, diaI] = res.fechaIngreso.split("-").map(Number);
      const [anoS, mesS, diaS] = res.fechaSalida.split("-").map(Number);
      const timeInicio = new Date(anoI, mesI - 1, diaI, 0, 0, 0, 0).getTime();
      const timeFin = new Date(anoS, mesS - 1, diaS, 0, 0, 0, 0).getTime();

      return timeColumna >= timeInicio && timeColumna <= timeFin;
    });

    return choque ? { ocupado: true, estado: choque.estado } : { ocupado: false };
  };

  // 🟢 Ejecuta la apertura y configura qué celda de habitación-fecha fue clickeada
  const seleccionarCeldaLibre = (room: any, fecha: Date) => {
    const celda = obtenerEstadoCelda(room.id, fecha);
    if (celda.ocupado) return; // Si la celda está ocupada, congelamos el evento por privacidad del hotel
    
    setSelectedRoom(room);
    setSelectedDate(fecha);
    setIsBookingModalOpen(true); // Abre el ClientBookingModal flotante
  };

  return {
    rooms,
    loading,
    days,
    fechasSemana,
    obtenerEstadoCelda,
    seleccionarCeldaLibre,
    selectedRoom,
    selectedDate,
    isBookingModalOpen,
    setIsBookingModalOpen,
    cargarDatosPublicos
  };
}
