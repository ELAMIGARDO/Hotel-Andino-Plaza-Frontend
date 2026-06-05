import { Search, Filter, Plus } from "lucide-react";
import { useTimeline } from "../hooks/useTimeline";
import { ReservationDetailModal } from "../components/ReservationDetailModal";

interface AvailabilityTimelineProps {
  onOpenModal: () => void;
  onSuccessRefrescar?: (refrescarFn: () => void) => void;
  filtroGlobal: string;
}

export function AvailabilityTimeline({
  onOpenModal,
  onSuccessRefrescar,
  filtroGlobal,
}: AvailabilityTimelineProps) {
  // 🔥 Consumo de toda la lógica de negocio estructurada en el Custom Hook
  const {
    filterType,
    setFilterType,
    buscarNumero,
    setBuscarNumero,
    loading,
    days,
    fechasSemana,
    filteredRooms,
    isDetailOpen,
    setIsDetailOpen,
    reservaSeleccionada,
    setReservaSeleccionada,
    verificarOcupacion,
    consultarBackend,
  } = useTimeline({ onSuccessRefrescar, filtroGlobal });

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Sincronizando habitaciones con MySQL...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Disponibilidad
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Vista general de habitaciones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Buscador Conectado */}
          <div className="relative flex-1 sm:w-48">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar habitación..."
              value={buscarNumero}
              onChange={(e) => setBuscarNumero(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Selector de Tipo Conectado */}
          <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 rounded-lg p-1 bg-slate-50 dark:bg-slate-900/50">
            <Filter
              size={14}
              className="text-slate-500 dark:text-slate-400 ml-2"
            />
            <select
              className="bg-transparent text-sm border-none focus:ring-0 text-slate-700 dark:text-slate-300 py-1 pr-8 cursor-pointer [&>option]:text-slate-900"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="estándar">Estándar</option>
              <option value="doble">Doble</option>
              <option value="suite">Suite</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>

          {/* Selector de Fecha de la interfaz */}
          <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50">
            <input
              type="date"
              className="bg-transparent text-sm border-none focus:ring-0 text-slate-700 dark:text-slate-300 [&::-webkit-calendar-picker-indicator]:dark:invert"
              defaultValue="2026-05-01"
            />
          </div>

          {/* Botón Nueva Reserva */}
          <button
            onClick={onOpenModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ml-auto sm:ml-0"
          >
            <Plus size={16} /> Nueva Reserva
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Cabecera de los Días de la Semana */}
          <div className="grid grid-cols-[120px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="p-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r border-slate-200 dark:border-slate-700">
              Habitación
            </div>
            {days.map((day, idx) => (
              <div
                key={idx}
                className="p-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Renderizado de las Filas de Habitaciones de MySQL */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="grid grid-cols-[120px_repeat(7,1fr)] group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
              >
                {/* Información de la Habitación Real */}
                <div className="p-3 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Hab. {room.numero}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {room.tipo}
                  </span>
                </div>
                {/* Recorrido Dinámico de las Celdas del Dashboard */}
                {fechasSemana.map((fechaDia, idx) => {
                  const reservaEnCelda = verificarOcupacion(room.id, fechaDia);
                  const isFree = !reservaEnCelda;

                  // 🎯 CONFIGURACIÓN DINÁMICA DE COLORES Y ETIQUETAS
                  let clasesFondo = "bg-emerald-500 hover:bg-emerald-600"; // Libre (Verde)
                  let textoPrincipal = "Libre";
                  let textoSecundario = "";

                  if (!isFree) {
                    if (reservaEnCelda.estado === "MANTENIMIENTO") {
                      clasesFondo =
                        "bg-slate-500 hover:bg-slate-600 text-white"; // Mantenimiento (Gris)
                      textoPrincipal = "🛠️ MANTENIMIENTO";
                    } else if (reservaEnCelda.estado === "LIMPIEZA") {
                      clasesFondo =
                        "bg-amber-500 hover:bg-amber-600 text-white"; // Limpieza (Amarillo)
                      textoPrincipal = "🧹 EN LIMPIEZA";
                    } else {
                      clasesFondo =
                        "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"; // Reserva (Gris claro clásico de tu diseño)
                      textoPrincipal =  reservaEnCelda.nombreCliente
                        ? reservaEnCelda.nombreCliente.split(" ")[0]
                        : "Ocupada";
                      textoSecundario = "Ver detalles";
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className="p-2 border-r border-slate-200 dark:border-slate-700 last:border-r-0 flex items-center justify-center relative"
                    >
                      <div
                        className={`w-full h-full min-h-[44px] rounded-md transition-all flex items-center justify-center overflow-hidden cursor-pointer shadow-sm ${clasesFondo}`}
                        title={
                          isFree
                            ? "Disponible — Clic para reservar"
                            : `Estado: ${reservaEnCelda.estado} — ${reservaEnCelda.nombreCliente}`
                        }
                        onClick={() => {
                          if (isFree) {
                            onOpenModal();
                          } else {
                            setReservaSeleccionada(reservaEnCelda);
                            setIsDetailOpen(true);
                          }
                        }}
                      >
                        {isFree ? (
                          <div className="w-full h-full flex items-center justify-center px-1">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate">
                              {textoPrincipal}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center px-1 text-center leading-tight">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider truncate max-w-full ${
                                reservaEnCelda.estado === "ACTIVA"
                                  ? "text-slate-700 dark:text-slate-200"
                                  : "text-white"
                              }`}
                            >
                              {textoPrincipal}
                            </span>
                            <span
                              className={`text-[9px] font-medium ${
                                reservaEnCelda.estado === "ACTIVA"
                                  ? "text-slate-500 dark:text-slate-400"
                                  : "text-white/80"
                              }`}
                            >
                              {textoSecundario}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">
            No se encontraron habitaciones en el sistema.
          </p>
        </div>
      )}

      {/* Modal de Detalles del Flujo Conectado */}
      <ReservationDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setReservaSeleccionada(null);
        }}
        reserva={reservaSeleccionada}
        onSuccessRefrescar={consultarBackend}
      />
    </div>
  );
}
