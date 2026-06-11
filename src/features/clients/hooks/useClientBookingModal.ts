import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

interface UseClientBookingModalProps {
  isOpen: boolean;
  room: any;
  selectedDate: Date | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function useClientBookingModal({
  isOpen,
  room,
  selectedDate,
  onClose,
  onSuccess,
}: UseClientBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fechaIngreso: "",
    fechaSalida: "",
  });

  // Datos auto-recuperados de la sesión activa del usuario
  // Al registrarse, guardamos "nombre", "tipoDocumento" y "numeroDocumento" en la base de datos de usuarios
  const tokenPlano = localStorage.getItem("auth_token") || "";
  const [userEmail] = tokenPlano.split(":"); // Extrae el correo/usuario de la sesión

  useEffect(() => {
    if (isOpen && selectedDate) {
      const anio = selectedDate.getFullYear();
      const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dia = String(selectedDate.getDate()).padStart(2, "0");
      
      setFormData({
        fechaIngreso: `${anio}-${mes}-${dia}`,
        fechaSalida: "", 
      });
    }
  }, [isOpen, selectedDate]);

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
      // 🛠️ CONSULTA PREVIA AL /ME PARA RECUPERAR EL NOMBRE Y DNI REAL DESDE EL BACKEND
      // Así garantizamos que la reserva se guarde con el DNI exacto con el que se registró
      const tokenBase64 = btoa(tokenPlano);
      const configHeaders = {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      };

      const userProfileRes = await axios.get("http://localhost:8080/api/auth/me", configHeaders);
      const perfilUser = userProfileRes.data; // Contiene { nombre, tipoDocumento, numeroDocumento }

      const payload = {
        nombreCliente: perfilUser.nombre,
        tipoDocumento: perfilUser.tipoDocumento || "DNI",
        numeroDocumento: perfilUser.numeroDocumento,
        fechaIngreso: formData.fechaIngreso,
        fechaSalida: formData.fechaSalida,
        estado: "ACTIVA",
        habitacion: { id: room.id },
      };

      // Guardamos la reserva usando las credenciales del usuario
      await axios.post("http://localhost:8080/api/reservas", payload, configHeaders);
      
      toast.success("¡Tu reserva ha sido registrada con éxito! Te esperamos.", {
        style: { background: "#059669", color: "white", border: "none" },
      });
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error al registrar la reserva automatizada:", error);
      toast.error("No se pudo procesar tu reserva. Inténtalo de nuevo.");
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
