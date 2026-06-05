import { X, Calendar as CalendarIcon, User, BedDouble } from "lucide-react";
import { useBookingModal } from "../hooks/useBookingModal";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BookingModal({
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  // 🔥 Extraemos toda la lógica pesada del formulario en un solo gancho estructurado
  const {
    formData,
    isSubmitting,
    habitaciones,
    reglaActual,
    hoyString,
    isNombreBloqueado,
    handleChange,
    handleDocumentoChange,
    cambiarTipoDocumento,
    handleSubmit,
  } = useBookingModal({ isOpen, onClose, onSuccess });

  if (!isOpen) return null;

  const esReservaNormal = formData.estado === "ACTIVA";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col transition-all transform scale-100 opacity-100">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-white dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            {esReservaNormal ? "Nueva Reserva" : "Bloquear Habitación"}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Selector: Propósito del Registro */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Propósito del Registro
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/50 cursor-pointer"
            >
              <option value="ACTIVA">🎯 Registrar Reserva Normal</option>
              <option value="MANTENIMIENTO">
                🛠️ Bloquear por Mantenimiento Técnico
              </option>
              <option value="LIMPIEZA">
                🧹 Bloquear por Limpieza Profunda
              </option>
            </select>
          </div>

          {/* ========================================================= */}
          {/* 🔥 SECCIÓN CONDICIONAL: SOLO APARECE SI ES RESERVA NORMAL */}
          {/* ========================================================= */}
          {esReservaNormal && (
            <>
              {/* Identificación del cliente */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User
                    size={14}
                    className="text-slate-400 dark:text-slate-500"
                  />{" "}
                  Identificación del cliente
                </label>
                <div className="flex gap-2">
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={(e) => cambiarTipoDocumento(e.target.value)}
                    required={esReservaNormal}
                    className="w-1/3 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/50 cursor-pointer"
                  >
                    <option value="DNI">DNI</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="RUC">RUC</option>
                  </select>

                  <input
                    type="text"
                    name="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => handleDocumentoChange(e.target.value)}
                    required={esReservaNormal}
                    minLength={reglaActual.min}
                    maxLength={reglaActual.max}
                    pattern={reglaActual.pattern}
                    placeholder={reglaActual.placeholder}
                    className="w-2/3 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Nombre Cliente Inteligente */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User
                      size={14}
                      className="text-slate-400 dark:text-slate-500"
                    />{" "}
                    Nombre del cliente
                  </label>
                </div>

                <input
                  type="text"
                  name="nombreCliente"
                  value={formData.nombreCliente}
                  onChange={handleChange}
                  required={esReservaNormal}
                  // 🔒 CANDADO HTML: Si está bloqueado, se vuelve de solo lectura y cambia de color a gris suave
                  readOnly={isNombreBloqueado}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                    isNombreBloqueado
                      ? "bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed font-medium"
                      : "bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            </>
          )}

          {/* ========================================================= */}

          {/* Fechas de Check-In & Check-Out (SIEMPRE VISIBLE) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CalendarIcon
                  size={14}
                  className="text-slate-400 dark:text-slate-500"
                />{" "}
                {esReservaNormal ? "Check-in" : "Inicio Bloqueo"}
              </label>
              <input
                type="date"
                name="fechaIngreso"
                value={formData.fechaIngreso}
                onChange={handleChange}
                min={hoyString}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/50 [&::-webkit-calendar-picker-indicator]:dark:invert cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CalendarIcon
                  size={14}
                  className="text-slate-400 dark:text-slate-500"
                />{" "}
                {esReservaNormal ? "Check-out" : "Fin Bloqueo"}
              </label>
              <input
                type="date"
                name="fechaSalida"
                value={formData.fechaSalida}
                onChange={handleChange}
                min={formData.fechaIngreso || hoyString}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/50 [&::-webkit-calendar-picker-indicator]:dark:invert cursor-pointer"
              />
            </div>
          </div>

          {/* Selector de Habitación Relacional (SIEMPRE VISIBLE) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BedDouble
                size={14}
                className="text-slate-400 dark:text-slate-500"
              />{" "}
              Seleccionar Habitación
            </label>
            <select
              name="habitacionId"
              value={formData.habitacionId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/50 [&>option]:text-slate-900 cursor-pointer"
            >
              <option value="">Seleccionar...</option>
              {habitaciones.map((h) => (
                <option key={h.id} value={h.id}>
                  Hab. {h.numero} — {h.tipo} (${h.precio}/noche)
                </option>
              ))}
            </select>
          </div>

          {/* Botones de Control */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting
                ? "Procesando..."
                : esReservaNormal
                  ? "Confirmar Reserva"
                  : "Confirmar Bloqueo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
