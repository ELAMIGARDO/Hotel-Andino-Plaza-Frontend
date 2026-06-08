import { useState } from "react";
import axios from "axios";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { toast } from "sonner";

interface UseReservationDetailProps {
  reserva: any;
  onSuccessRefrescar?: () => void;
  onClose: () => void;
}

export function useReservationDetail({
  reserva,
  onSuccessRefrescar,
  onClose,
}: UseReservationDetailProps) {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // 🚀 ESTADOS PARA LA INTERFAZ DE CANCELACIÓN EN EL MODAL
  const [mostrarCampoCancelar, setMostrarCampoCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  // 1. Cálculo exacto del modelo hotelero por NOCHES de estadía
  const totalNoches = reserva
    ? differenceInCalendarDays(
        parseISO(reserva.fechaSalida),
        parseISO(reserva.fechaIngreso),
      )
    : 0;

  // 2. Multiplicación correcta del total a pagar en base a las noches calculadas
  const totalPagar = totalNoches * (reserva?.habitacion?.precio || 0);

  // 3. Petición HTTP PUT para liberar la habitación y archivar en reportes
  const gestionarLiberacion = async () => {
    if (!reserva) return;
    try {
      await axios.put(
        `http://localhost:8080/api/reservas/${reserva.id}/finalizar`,
      );
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

  // 🚀 4. NUEVA PETICIÓN HTTP PUT: Para cancelar la reserva enviando el motivo
  const gestionarCancelacion = async () => {
    if (!reserva) return;

    const motivoLimpio = motivoCancelacion.trim();

    if (!motivoLimpio) {
      toast.error(
        "Por favor, escribe un motivo para proceder con la cancelación.",
      );
      return;
    }

    // 💡 VALIDACIÓN DE 10 PALABRAS MÁXIMO
    // Filtramos elementos vacíos para evitar que los espacios dobles cuenten como palabras
    const cantidadPalabras = motivoLimpio.split(/\s+/).filter(Boolean).length;

    if (cantidadPalabras > 10) {
      toast.error(
        `El motivo es demasiado largo (${cantidadPalabras} palabras). Por favor, escribe un resumen breve de máximo 10 palabras.`,
      );
      return; // Frena el envío por completo
    }

    try {
      await axios.put(
        `http://localhost:8080/api/reservas/${reserva.id}/cancelar`,
        motivoLimpio,
        {
          headers: { "Content-Type": "text/plain" },
        },
      );
      toast.success("Reserva cancelada y registrada correctamente", {
        style: { background: "#dc2626", color: "white", border: "none" },
      });
      if (onSuccessRefrescar) onSuccessRefrescar();
      setMostrarCampoCancelar(false);
      setMotivoCancelacion("");
      onClose();
    } catch (error) {
      console.error("Error al cancelar la reserva desde React:", error);
      toast.error("No se pudo registrar la cancelación. Inténtalo de nuevo.");
    }
  };

  return {
    mostrarConfirmacion,
    setMostrarConfirmacion,
    mostrarCampoCancelar, // 🚀 Expuesto para la vista HTML del modal
    setMostrarCampoCancelar, // 🚀 Expuesto para la vista HTML del modal
    motivoCancelacion, // 🚀 Expuesto para la vista HTML del modal
    setMotivoCancelacion, // 🚀 Expuesto para la vista HTML del modal
    totalNoches,
    totalPagar,
    gestionarLiberacion,
    gestionarCancelacion, // 🚀 Expuesto para ejecutar en la vista
  };
}
