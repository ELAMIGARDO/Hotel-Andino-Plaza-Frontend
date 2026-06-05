import { useState } from "react";
import axios from "axios";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { toast } from "sonner";

interface UseReservationDetailProps {
  reserva: any;
  onSuccessRefrescar?: () => void;
  onClose: () => void;
}

export function useReservationDetail({ reserva, onSuccessRefrescar, onClose }: UseReservationDetailProps) {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // 1. Cálculo exacto del modelo hotelero por NOCHES de estadía (Eliminado el "+ 1")
  const totalNoches = reserva
    ? differenceInCalendarDays(parseISO(reserva.fechaSalida), parseISO(reserva.fechaIngreso))
    : 0;

  // 2. Multiplicación correcta del total a pagar en base a las noches calculadas
  const totalPagar = totalNoches * (reserva?.habitacion?.precio || 0);

  // 3. Petición HTTP PUT para liberar la habitación y archivar en reportes
  const gestionarLiberacion = async () => {
    if (!reserva) return;
    try {
      await axios.put(`http://localhost:8080/api/reservas/${reserva.id}/finalizar`);
      toast.success("Habitación liberada correctamente", {
        style: { background: "#059669", color: "white", border: "none" },
      });
      
      if (onSuccessRefrescar) onSuccessRefrescar();
      
      setMostrarConfirmacion(false);
      onClose();
    } catch (error) {
      console.error("Error al liberar habitación:", error);
      toast.error("No se pudo liberar la habitación. Inténtalo de nuevo.");
    }
  };

  return {
    mostrarConfirmacion,
    setMostrarConfirmacion,
    totalNoches,
    totalPagar,
    gestionarLiberacion,
  };
}
