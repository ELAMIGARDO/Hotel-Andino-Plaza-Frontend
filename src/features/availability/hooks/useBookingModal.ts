import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export interface Habitacion {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
  disponible: boolean;
}

interface UseBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function useBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: UseBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [isNombreBloqueado, setIsNombreBloqueado] = useState(false);

  const [formData, setFormData] = useState({
    nombreCliente: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaIngreso: "",
    fechaSalida: "",
    habitacionId: "",
    estado: "ACTIVA", // 🔥 1. CAMBIO: Inicializamos el estado operativo del registro
  });

  const hoyLocal = new Date();
  const anio = hoyLocal.getFullYear();
  const mes = String(hoyLocal.getMonth() + 1).padStart(2, "0");
  const dia = String(hoyLocal.getDate()).padStart(2, "0");
  const hoyString = `${anio}-${mes}-${dia}`; // Dará "2026-06-07" exactamente

  const [allReservas, setAllReservas] = useState<any[]>([]);
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        axios.get("http://localhost:8080/api/habitaciones"),
        axios.get("http://localhost:8080/api/reservas"),
      ])
        .then(([resRooms, resReservas]) => {
          setHabitaciones(resRooms.data);
          setAllReservas(resReservas.data);
        })
        .catch((err) =>
          console.error("Error al sincronizar datos en el modal:", err),
        );
    }
  }, [isOpen]);

  const habitacionesDisponibles = habitaciones.filter((room) => {
    // Si el recepcionista no ha completado ambas fechas, mostramos todas las habitaciones por defecto
    if (!formData.fechaIngreso || !formData.fechaSalida) return true;

    const inicioForm = formData.fechaIngreso;
    const finForm = formData.fechaSalida;

    // Buscamos si esta habitación tiene algún bloqueo activo que choque con el rango del formulario
    const tieneChoque = allReservas.some((res) => {
      if (res.habitacion.id !== room.id) return false;

      // Ignoramos el historial viejo (Finalizadas o Canceladas)
      if (res.estado === "FINALIZADA" || res.estado === "CANCELADA")
        return false;

      // Fórmula matemática estricta de cruce de rangos: (Inicio1 <= Fin2) Y (Fin1 >= Inicio2)
      return inicioForm <= res.fechaSalida && finForm >= res.fechaIngreso;
    });

    // Si tiene choque, retorna false (se oculta de la lista); si está libre, retorna true
    return !tieneChoque;
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nuevoEstado = { ...prev, [name]: value };

      // 🎯 NUEVA REGLA OPERATIVA INDEPENDIENTE
      const esReservaNormal = nuevoEstado.estado === "ACTIVA";

      if (name === "fechaIngreso" && nuevoEstado.fechaSalida) {
        if (esReservaNormal) {
          // 🔒 Si es reserva de cliente, la salida DEBE ser posterior (No el mismo día)
          if (nuevoEstado.fechaSalida < value) {
            nuevoEstado.fechaSalida = "";
            toast.info(
              "Para reservas, la fecha de salida debe ser posterior al ingreso.",
            );
          }
        } else {
          // 🛠️ Si es Mantenimiento/Limpieza, se permite el mismo día, pero NO días anteriores
          if (nuevoEstado.fechaSalida < value) {
            nuevoEstado.fechaSalida = "";
            toast.error(
              "La fecha de fin no puede ser anterior a la de inicio.",
            );
          }
        }
      }

      return nuevoEstado;
    });
  };

  const handleDocumentoChange = (valor: string) => {
    let filtrado = valor;
    if (formData.tipoDocumento === "DNI") {
      filtrado = valor.replace(/\D/g, "").slice(0, 8);
    } else if (formData.tipoDocumento === "RUC") {
      filtrado = valor.replace(/\D/g, "").slice(0, 11);
    } else if (formData.tipoDocumento === "PASAPORTE") {
      filtrado = valor.replace(/[^A-Za-z0-9]/g, "").slice(0, 9);
    }

    setFormData((prev) => {
      const nuevoEstado = { ...prev, numeroDocumento: filtrado };

      if (filtrado.length === reglasDocumento[prev.tipoDocumento]?.max) {
        const clienteEncontrado = allReservas.find(
          (res) =>
            res.numeroDocumento &&
            res.numeroDocumento.trim() === filtrado.trim(),
        );

        if (clienteEncontrado) {
          nuevoEstado.nombreCliente = clienteEncontrado.nombreCliente;
          // 🔥 ACTIVAMOS EL BLOQUEO: Encontró al cliente, bloqueamos el input para que no lo alteren
          setIsNombreBloqueado(true);

          toast.success(`Huésped frecuente: Nombre fijado automáticamente.`, {
            style: { background: "#1E3A8A", color: "white", border: "none" },
            duration: 3000,
          });
        } else {
          // Si borra el número o pone uno nuevo que no existe, liberamos el campo
          setIsNombreBloqueado(false);
        }
      } else {
        // Si el número está incompleto, mantenemos el campo desbloqueado
        setIsNombreBloqueado(false);
      }

      return nuevoEstado;
    });
  };

  const cambiarTipoDocumento = (tipo: string) => {
    setFormData((prev) => ({
      ...prev,
      tipoDocumento: tipo,
      numeroDocumento: "",
    }));
  };

  const reglasDocumento: Record<
    string,
    { min: number; max: number; pattern: string; placeholder: string }
  > = {
    DNI: { min: 8, max: 8, pattern: "[0-9]{8}", placeholder: "Ej. 12345678" },
    RUC: {
      min: 11,
      max: 11,
      pattern: "[0-9]{11}",
      placeholder: "Ej. 20123456789",
    },
    PASAPORTE: {
      min: 6,
      max: 9,
      pattern: "[A-Za-z0-9]{6,9}",
      placeholder: "Ej. E123456",
    },
  };

  const reglaActual =
    reglasDocumento[formData.tipoDocumento] || reglasDocumento.DNI;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.habitacionId) {
      toast.error("Por favor, selecciona una habitación.");
      return;
    }

    const esReservaNormal = formData.estado === "ACTIVA";

    if (esReservaNormal) {
      if (formData.fechaSalida <= formData.fechaIngreso) {
        toast.error("La fecha de salida debe ser posterior a la de ingreso.");
        return;
      }

      // 🛑 CANDADO DE SEGURIDAD ABSOLUTO: Evita duplicar personas HOSPEDADAS HOY (Activas)
      const clienteActivoHoy = allReservas.find((res) => {
        return (
          res.estado === "ACTIVA" &&
          res.numeroDocumento &&
          res.numeroDocumento.trim() === formData.numeroDocumento.trim()
        );
      });

      if (clienteActivoHoy) {
        toast.error(
          `Denegado: El DNI ${formData.numeroDocumento} ya se encuentra hospedado en este momento en la Habitación ${clienteActivoHoy.habitacion?.numero} a nombre de ${clienteActivoHoy.nombreCliente}.`,
          {
            style: { background: "#DC2626", color: "white", border: "none" },
            duration: 6000,
          },
        );
        return; // Frena el envío por completo
      }
    } else {
      if (formData.fechaSalida < formData.fechaIngreso) {
        toast.error(
          "La fecha de finalización no puede ser anterior a la de inicio.",
        );
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      nombreCliente: esReservaNormal
        ? formData.nombreCliente
        : `🛠️ INTERNO: ${formData.estado}`,
      tipoDocumento: esReservaNormal ? formData.tipoDocumento : "DNI",
      numeroDocumento: esReservaNormal ? formData.numeroDocumento : "00000000",
      fechaIngreso: formData.fechaIngreso,
      fechaSalida: formData.fechaSalida,
      estado: formData.estado,
      habitacion: { id: parseInt(formData.habitacionId, 10) },
    };

    try {
      await axios.post("http://localhost:8080/api/reservas", payload);
      toast.success("Operación realizada con éxito", {
        style: { background: "#059669", color: "white", border: "none" },
      });

      setFormData({
        nombreCliente: "",
        numeroDocumento: "",
        tipoDocumento: "DNI",
        fechaIngreso: "",
        fechaSalida: "",
        habitacionId: "",
        estado: "ACTIVA",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data);
      } else {
        toast.error("Error al procesar la solicitud.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    habitaciones: habitacionesDisponibles,
    reglaActual,
    hoyString,
    isNombreBloqueado,
    handleChange,
    handleDocumentoChange,
    cambiarTipoDocumento,
    handleSubmit,
  };
}
