import { useClientBookingModal } from "./hooks/useClientBookingModal";
import { X, Calendar, AlertCircle, ArrowRight } from "lucide-react";

interface ClientBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  selectedDate: Date | null;
  onSuccess?: () => void;
}

export function ClientBookingModal({ isOpen, onClose, room, selectedDate, onSuccess }: ClientBookingModalProps) {
  const {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useClientBookingModal({ isOpen, room, selectedDate, onClose, onSuccess });

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full overflow-hidden">
        
        {/* Cabecera simplificada */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar size={20} />
            <div>
              <h3 className="font-bold text-sm">Confirmar tu estadía</h3>
              <p className="text-[11px] text-blue-100 font-medium mt-0.5">Habitación N° {room.numero} ({room.tipo})</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Formulario de Fechas Puro */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Fecha de Check-In (Ingreso)
              </label>
              <div className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 text-sm font-medium">
                {formData.fechaIngreso}
              </div>
            </div>

            <div className="flex justify-center text-slate-300 py-0.5">
              <ArrowRight size={20} className="rotate-90 md:rotate-0" />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Selecciona tu Check-Out (Salida)
              </label>
              <input
                type="date"
                name="fechaSalida"
                value={formData.fechaSalida}
                onChange={handleChange}
                required
                min={formData.fechaIngreso}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-[44px]"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
            <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p>El sistema enlazará automáticamente esta reserva con tu nombre y documento de identidad registrado. Pagas al llegar al hotel.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 text-sm"
          >
            {isSubmitting ? "Procesando tu Reserva..." : "Confirmar Reserva Directa"}
          </button>
        </form>
      </div>
    </div>
  );
}
