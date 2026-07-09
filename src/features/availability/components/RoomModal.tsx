import React, { useState, useEffect } from "react"; // 👈 Se agregó useEffect aquí
import { X, ChevronDown } from "lucide-react";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: any) => void;
  roomToEdit?: any;
}

// 🛠️ CORRECCIÓN 1: Agregado roomToEdit en la desestructuración de los parámetros
export function RoomModal({ isOpen, onClose, onSave, roomToEdit }: RoomModalProps) {
  const [numeroHabitacion, setNumeroHabitacion] = useState("");
  const [tipoHabitacion, setTipoHabitacion] = useState("Estándar");
  const [estado, setEstado] = useState("Disponible");
  const [precio, setPrecio] = useState("");

  // 🛠️ CORRECCIÓN 2: Ciclo de vida para precargar los datos si pulsas el lápiz o limpiar si vas a crear una nueva
  useEffect(() => {
    if (isOpen) {
      if (roomToEdit) {
        // Modo Edición: Se cargan los valores actuales de tu base de datos MySQL
        setNumeroHabitacion(roomToEdit.numero || "");
        setTipoHabitacion(roomToEdit.tipo || "Estándar");
        setPrecio(roomToEdit.precio?.toString() || "");
        setEstado(roomToEdit.disponible ? "Disponible" : "Ocupado");
      } else {
        // Modo Creación: Se limpian los campos del formulario por completo
        setNumeroHabitacion("");
        setTipoHabitacion("Estándar");
        setPrecio("");
        setEstado("Disponible");
      }
    }
  }, [isOpen, roomToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construimos el objeto JSON mapeado idéntico a tu Entidad de Java
    const payload: any = {
      numero: numeroHabitacion,
      tipo: tipoHabitacion,
      precio: parseFloat(precio),
      disponible: estado === "Disponible" // Se evalúa como Boolean para coincidir con tu backend
    };

    // 🛠️ CORRECCIÓN 3: Si venimos de presionar el lápiz de edición, le adjuntamos obligatoriamente el ID numérico real
    if (roomToEdit && roomToEdit.id) {
      payload.id = roomToEdit.id;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-colors duration-200">
        {/* Cabecera con título dinámico contextual */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {roomToEdit ? `Editar Habitación: ${roomToEdit.numero}` : "Añadir Nueva Habitación"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Número de Habitación
            </label>
            <input
              type="text"
              required
              value={numeroHabitacion}
              onChange={(e) => setNumeroHabitacion(e.target.value)}
              placeholder="Ej: 101"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Tipo de Habitación
            </label>
            <div className="relative">
              <select
                value={tipoHabitacion}
                onChange={(e) => setTipoHabitacion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 appearance-none pr-10"
              >
                <option value="Estándar">Estándar</option>
                <option value="Doble">Doble</option>
                <option value="Suite">Suite</option>
                <option value="Penthouse">Penthouse</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Precio por Noche
            </label>
            <input
              type="number"
              required
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Botones de acción con texto contextual dinámico */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              {roomToEdit ? "Actualizar Cambios" : "Guardar Habitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
