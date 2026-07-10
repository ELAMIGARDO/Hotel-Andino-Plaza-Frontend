import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

interface UseClientBookingModalProps {
  isOpen: boolean;
  room: any;
  selectedDate: Date | string | null;
  onClose: () => void;
  onSuccess?: () => void;
  isEditing?: boolean;      
  bookingId?: string;       
  currentBooking?: {        
    fechaIngreso: string;
    fechaSalida: string;
  };
}

export function useClientBookingModal({
  isOpen,
  room,
  selectedDate,
  onClose,
  onSuccess,
  isEditing = false,        
  bookingId,                
  currentBooking,           
}: UseClientBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fechaIngreso: "",
    fechaSalida: "",
  });

  const tokenPlano = localStorage.getItem("auth_token") || "";

  // 1. Cargar las fechas iniciales dinámicamente según el modo activo
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && currentBooking) {
      // Si estamos modificando, precargamos el rango ya reservado
      setFormData({
        fechaIngreso: currentBooking.fechaIngreso,
        fechaSalida: currentBooking.fechaSalida, 
      });
    } else if (selectedDate) {
      if (selectedDate instanceof Date) {
        const anio = selectedDate.getFullYear();
        const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const dia = String(selectedDate.getDate()).padStart(2, "0");
        
        setFormData({
          fechaIngreso: `${anio}-${mes}-${dia}`,
          fechaSalida: "", 
        });
      } else {
        setFormData({
          fechaIngreso: selectedDate,
          fechaSalida: "",
        });
      }
    }
  }, [isOpen, selectedDate, isEditing, currentBooking]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const nuevoEstado = { ...prev, [name]: value };
      if (name === "fechaSalida" && nuevoEstado.fechaIngreso && value <= nuevoEstado.fechaIngreso) {
        nuevoEstado.fechaSalida = "";
        toast.info("La fecha de salida debe ser posterior a la fecha de ingreso.");
      }
      return nuevoEstado;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fechaSalida) {
      toast.error("Por favor, seleccione su fecha de salida.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenBase64 = btoa(tokenPlano);
      const configHeaders = {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      };

      // Recuperamos el perfil real del huésped logueado
      const userProfileRes = await axios.get("http://localhost:8080/api/auth/me", configHeaders);
      const perfilUser = userProfileRes.data;

      const payload = {
        nombreCliente: perfilUser.nombre,
        tipoDocumento: perfilUser.tipoDocumento || "DNI",
        numeroDocumento: perfilUser.numeroDocumento,
        fechaIngreso: formData.fechaIngreso,
        fechaSalida: formData.fechaSalida,
        estado: "ACTIVA",
        habitacion: { id: room.id },
      };

      if (isEditing && bookingId) {
        // 🟢 SOLUCIÓN AL ERROR DE TIPO: Limpiamos "RES-7021" para enviar sólo "7021" a Spring Boot
        const idNumerico = bookingId.replace(/\D/g, "");

        // 🛠️ MODO MODIFICAR: Envía los cambios mediante PUT al registro correspondiente con el ID numérico
        await axios.put(`http://localhost:8080/api/reservas/${idNumerico}`, payload, configHeaders);
        
        toast.success("¡Tu estadía ha sido reprogramada con éxito!", {
          style: { background: "#d97706", color: "white", border: "none" },
        });
      } else {
        // 🚀 MODO CREAR: Envía una nueva reserva por el método POST tradicional
        await axios.post("http://localhost:8080/api/reservas", payload, configHeaders);
        
        toast.success("¡Tu reserva ha sido registrada con éxito! Te esperamos.", {
          style: { background: "#059669", color: "white", border: "none" },
        });
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error al procesar la operación en el servidor:", error);
      toast.error(
        isEditing 
          ? "No se pudieron guardar las nuevas fechas. Inténtalo de nuevo." 
          : "No se pudo registrar tu reserva. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
