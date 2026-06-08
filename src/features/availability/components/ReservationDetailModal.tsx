import { X, User, Calendar, Bed } from "lucide-react";
import { useReservationDetail } from "../hooks/useReservationDetail";

interface ReservationDetailModalProps {
  isOpen: boolean;
  onSuccessRefrescar?: () => void;
  onClose: () => void;
  reserva: any;
}

export function ReservationDetailModal({
  isOpen,
  onClose,
  reserva,
  onSuccessRefrescar,
}: ReservationDetailModalProps) {
  
  // ⚡ Desestructuración de las nuevas propiedades lógicas inyectadas en tu Hook
  const {
    mostrarConfirmacion,
    setMostrarConfirmacion,
    mostrarCampoCancelar,
    setMostrarCampoCancelar,
    motivoCancelacion,
    setMotivoCancelacion,
    totalNoches,
    totalPagar,
    gestionarLiberacion,
    gestionarCancelacion,
  } = useReservationDetail({ reserva, onSuccessRefrescar, onClose });

  if (!isOpen || !reserva) return null;

  // 🎯 DETECCIÓN OPERATIVA: Verificamos si es una reserva real de un cliente que paga
  const esReservaNormal = reserva.estado === "ACTIVA";
return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transition-colors duration-200">
      
      {/* Cabecera Principal */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100">
          {esReservaNormal ? "Detalles de la Reserva" : "Detalles del Bloqueo"}
        </h3>
        <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Contenido del Detalle */}
      <div className="p-6 space-y-4 text-sm">
        
        {/* Fila del propósito o cliente */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/30">
          <User className="text-blue-500" size={18} />
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {esReservaNormal ? "Cliente" : "Tipo de Registro"}
            </p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{reserva.nombreCliente}</p>
            {esReservaNormal && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{reserva.tipoDocumento}: {reserva.numeroDocumento}</p>
            )}
          </div>
        </div>

        {/* Rango de Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50">
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><Calendar size={12} /> {esReservaNormal ? "Entrada" : "Inicio"}</p>
            <p className="font-medium mt-1 text-slate-700 dark:text-slate-300">{reserva.fechaIngreso}</p>
          </div>
          <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50">
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><Calendar size={12} /> {esReservaNormal ? "Salida" : "Fin"}</p>
            <p className="font-medium mt-1 text-slate-700 dark:text-slate-300">{reserva.fechaSalida}</p>
          </div>
        </div>

        {esReservaNormal ? (
          <>
            {/* Caja de Cobro del Total de la estadía */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de la estadía</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Calculado por {totalNoches} noche{totalNoches !== 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">S/. {totalPagar}</span>
            </div>

            {/* Detalle del Costo por Noche */}
            <div className="flex items-center justify-between p-2 border-t border-slate-100 dark:border-slate-700/50 pt-4">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Bed size={14} /> Habitación {reserva.habitacion?.numero}</span>
              <span className="font-medium text-slate-600 dark:text-slate-400">S/. {reserva.habitacion?.precio} / noche</span>
            </div>
          </>
        ) : (
          /* Si es un bloqueo, solo mostramos el número de habitación sin precios */
          <div className="flex items-center justify-between p-2 border-t border-slate-100 dark:border-slate-700/50 pt-4">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Bed size={14} /> Estado de la Habitación: {reserva.habitacion?.numero}
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md font-medium uppercase">
              Bloqueada
            </span>
          </div>
        )}

        {/* 🔍 CAJA DE CANCELACIÓN DINÁMICA */}
        {mostrarCampoCancelar && esReservaNormal && (
          <div className="space-y-2 bg-red-50/50 dark:bg-red-950/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30 transition-all duration-200 animate-fadeIn">
            <label className="text-[11px] font-medium text-red-700 dark:text-red-400">
              Escriba el motivo de la cancelación corporativa:
            </label>
            <input
              type="text"
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              maxLength={60}
              placeholder="Ej. Emergencia familiar, error en fecha..."
              className="w-full text-xs p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMostrarCampoCancelar(false)}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1"
              >
                Regresar
              </button>
              <button
                type="button"
                onClick={gestionarCancelacion}
                className="text-[11px] font-semibold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md shadow-sm transition-colors cursor-pointer"
              >
                Confirmar X
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Botonera Principal Dinámica */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700/30 flex justify-end items-center gap-2 border-t border-slate-100 dark:border-slate-700/50">
        {!mostrarCampoCancelar && (
          <>
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              Cerrar
            </button>

            {/* Botón de Cancelar Reserva */}
            {esReservaNormal && (
              <button
                type="button"
                onClick={() => setMostrarCampoCancelar(true)}
                className="px-3 py-1.5 border border-red-200 dark:border-red-900/30 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                Cancelar Reserva
              </button>
            )}

            <button type="button" onClick={() => setMostrarConfirmacion(true)} className="px-3 py-1.5 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer shadow-sm" >
              {esReservaNormal ? "Liberar Habitación" : "Habilitar Habitación"}
            </button>
          </>
        )}
      </div>

    </div>

    {/* Capa de confirmación de liberación */}
    {mostrarConfirmacion && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs overflow-hidden flex flex-col border border-slate-100 dark:border-slate-700 transition-all transform scale-100">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {esReservaNormal ? "Liberar Habitación" : "Quitar Bloqueo Técnico"}
            </h4>
            <button onClick={() => setMostrarConfirmacion(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X size={14} />
            </button>
          </div>
          <div className="p-5">
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {esReservaNormal ? "¿Desea liberar la información de esta reserva actual? Los datos se guardarán automáticamente en tu panel de reportes." : "¿Confirma que el cuarto ha completado el proceso operativo y se encuentra en óptimas condiciones para volver a recibir huéspedes?" }
            </p>
          </div>
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-700/30 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700/50">
            <button type="button" onClick={() => setMostrarConfirmacion(false)} className="px-3 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer" >
              Cancelas
            </button>
            <button type="button" onClick={gestionarLiberacion} className="px-3 py-1.5 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer" >
              Sí, Confirmar
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
)};