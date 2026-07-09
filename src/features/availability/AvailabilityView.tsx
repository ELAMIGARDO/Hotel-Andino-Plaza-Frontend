import { CalendarIcon, ChevronDown } from "lucide-react";
import { BookingModal } from "./components/BookingModal";
import { useAvailabilityView } from "./hooks/useAvailabilityView";
import { ReservationDetailModal } from "./components/ReservationDetailModal";
import { RoomModal } from "./components/RoomModal"; // 1. Importación del nuevo modal

export function AvailabilityView() {
  // Destructuramos las variables existentes y las nuevas que vienen desde tu hook corregido
  const {
    roomType,
    setRoomType,
    roomStatus,
    setRoomStatus,
    loading,
    isModalOpen,
    setIsModalOpen,
    days,
    filteredRooms,
    calcularBloquesDeHabitacion,
    cargarDatosDelHotel,
    isDetailOpen,
    setIsDetailOpen,
    reservaSeleccionada,
    setReservaSeleccionada,
    // --- VARIABLES NUEVAS EXTRAÍDAS DEL HOOK ---
    isRoomModalOpen,
    setIsRoomModalOpen,
    handleGuardarHabitacion,
    handleEliminarHabitacion,
    handleEditarHabitacion,
    roomToEdit,
    setRoomToEdit,
  } = useAvailabilityView();

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Cargando mapa de ocupación real del hotel...
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-auto p-8 flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Filtros de la parte superior */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-wrap items-end gap-4 shrink-0 transition-colors duration-200">
        <div className="flex-1 min-w-[320px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Rango de Fechas del Sistema (Tiempo Real)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <CalendarIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                readOnly
                value={days[0] ? `Desde ${days[0]}` : ""}
                className="w-full pl-9 pr-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
            <span className="text-slate-400 dark:text-slate-500">-</span>
            <div className="relative flex-1">
              <CalendarIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                readOnly
                value={days[9] ? `Hasta ${days[9]}` : ""}
                className="w-full pl-9 pr-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="w-48 flex-shrink-0">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Tipo de Habitación
          </label>
          <div className="relative">
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 appearance-none pr-10"
            >
              <option value="Todas">Todas</option>
              <option value="Estándar">Estándar</option>
              <option value="Doble">Doble</option>
              <option value="Suite">Suite</option>
              <option value="Penthouse">Penthouse</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="w-48 flex-shrink-0">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Estado
          </label>
          <div className="relative">
            <select
              value={roomStatus}
              onChange={(e) => setRoomStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 appearance-none pr-10"
            >
              <option value="Todos">Todos</option>
              <option value="Disponible">Disponible</option>
              <option value="Ocupado">Ocupado</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>
      
      {/* Leyenda y Controladores */}
      <div className="flex items-center justify-between mb-4 px-2 shrink-0 text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800"></div>
            <span className="text-slate-600 dark:text-slate-400">
              {" "}
              Disponible (Haz clic en el fondo para reservar){" "}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Reserva
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-500"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Mantenimiento
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Limpieza
              </span>
            </div>
          </div>
        </div>

        {/* Contenedor de Botones de Acción */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRoomModalOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-colors border border-slate-200 dark:border-slate-600"
          >
            + Agregar Habitación
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            + Nueva Reserva
          </button>
        </div>
      </div>

      {/* Tabla Gantt del Timeline */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex-1 overflow-auto flex flex-col min-h-[500px]">
        {/* Cabecera de los Días */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 shrink-0">
          <div className="w-48 shrink-0 border-r border-slate-200 dark:border-slate-700 p-4 flex items-center font-medium text-slate-700 dark:text-slate-300 text-sm">
            {" "}
            Habitación{" "}
          </div>
          <div className="flex-1 flex min-w-[800px]">
            {days.map((day, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[80px] border-r border-slate-200 dark:border-slate-700 p-4 text-center"
              >
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {day.split(" ")[0]}
                </span>
                <div className="text-lg font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {day.split(" ")[1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filas de Habitaciones reales */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              const roomBlocks = calcularBloquesDeHabitacion(room.id);
              return (
                <div
                  key={room.id}
                  className="flex border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 group"
                >
                  {/* Datos de la Celda Izquierda con Editar y Borrar Integrados */}
                  <div className="w-48 shrink-0 border-r border-slate-200 dark:border-slate-700 p-4 z-10 flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {" "}
                        Hab. {room.numero}{" "}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {" "}
                        {room.tipo} • Activa{" "}
                      </div>
                    </div>
                    {/* Botones de acción rápidos que aparecen con group-hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => {
                          setRoomToEdit(room); // 1. Guarda la habitación en el estado del hook
                          setIsRoomModalOpen(true); // 2. Abre el modal formulario
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                        title="Editar Habitación"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEliminarHabitacion(room.id)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                        title="Eliminar Habitación"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Contenedor del Gantt Dinámico */}
                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 flex min-w-[800px] relative bg-emerald-50/30 dark:bg-emerald-950/10 cursor-pointer hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 transition-colors"
                    title="Clic para registrar reserva en esta habitación"
                  >
                    {days.map((_, idx) => (
                      <div
                        key={idx}
                        className="flex-1 min-w-[80px] border-r border-slate-100 dark:border-slate-700/30"
                      />
                    ))}

                    {/* Bloques Flotantes Calculados */}
                    {roomBlocks.map((block, i) => (
                      <div
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setReservaSeleccionada(block.reservaOriginal);
                          setIsDetailOpen(true);
                        }}
                        className={`absolute top-2 bottom-2 rounded-md px-3 py-1.5 flex items-center text-xs font-medium text-white shadow-sm overflow-hidden transition-all cursor-pointer ${block.colorTailwind}`}
                        style={{
                          left: `calc((${block.start} / ${days.length}) * 100% + 4px)`,
                          width: `calc((${block.duration} / ${days.length}) * 100% - 8px)`,
                        }}
                        title={`Ocupado por: ${block.label} — Haz clic para ver detalles`}
                      >
                        <span className="truncate w-full font-semibold">
                          {block.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No se encontraron habitaciones reales creadas en MySQL.
            </div>
          )}
        </div>

        {/* Modal para registrar un Check-In */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={cargarDatosDelHotel}
        />

        {/* Modal flotante para ver detalles y liberar habitación */}
        <ReservationDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setReservaSeleccionada(null);
          }}
          reserva={reservaSeleccionada}
          onSuccessRefrescar={cargarDatosDelHotel}
        />

        {/* MODAL CONECTADO AL FLUJO COMPLETO CRUD */}
        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => {
            setIsRoomModalOpen(false);
            setRoomToEdit(null); // 🛠️ Muy importante: Limpia la selección al cerrar
          }}
          // Elige automáticamente si crea o actualiza según el estado
          onSave={roomToEdit ? handleEditarHabitacion : handleGuardarHabitacion}
          roomToEdit={roomToEdit} // 🛠️ Envía la información de la fila al modal hijo
        />
      </div>
    </div>
  );
}
