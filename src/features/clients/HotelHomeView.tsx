import { useClientTimeline } from "./hooks/useClientTimeline";
import { ClientBookingModal } from "./ClientBookingModal";
import { ClientHeader } from "./ClienteHeader"; // 🟢 Importación de la cabecera superior
import { useRef } from "react";
import { Building, Calendar, Star, ShieldCheck, Coffee, Wifi, Sparkles } from "lucide-react";

export function HotelHomeView() {
  const timelineRef = useRef<HTMLDivElement>(null);

  // 🛠️ Extraemos de forma exacta todas las variables que requiere el modal flotante
  const { 
    rooms, 
    loading, 
    days, 
    fechasSemana, 
    obtenerEstadoCelda, 
    seleccionarCeldaLibre, 
    selectedRoom, 
    selectedDate, 
    isBookingModalOpen, 
    setIsBookingModalOpen, 
    cargarDatosPublicos 
  } = useClientTimeline();

  // Función de scroll suave para el botón principal
  const scrollToTimeline = () => {
    timelineRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased scroll-smooth flex flex-col">
      
      {/* 🟢 CABECERA SUPERIOR DINÁMICA DEL CLIENTE LOGUEADO */}
      <ClientHeader />

      {/* 🌟 SECCIÓN 1: HOME / HERO LANDING DEL HOTEL */}
      <header className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white min-h-[85vh] flex flex-col justify-center px-6 md:px-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://unsplash.com')] bg-cover bg-center opacity-25 mix-blend-overlay"></div>
        
        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs font-semibold tracking-wide text-blue-300">
            <Sparkles size={14} /> BIENVENIDO A LA EXPERIENCIA ANDINO PLAZA
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-white drop-shadow-sm">
            Tu Descanso Perfecto <br />En El Corazón De La Ciudad
          </h1>
          <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
            Disfruta de habitaciones premium, atención personalizada las 24 horas y el confort que mereces. Consulta la disponibilidad real abajo y asegura tu habitación hoy mismo.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button 
              onClick={scrollToTimeline}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-medium shadow-lg hover:shadow-blue-500/20 transition-all text-sm tracking-wide"
            >
              Reservar Ahora
            </button>
            <button onClick={scrollToTimeline} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-xl font-medium backdrop-blur-md transition-all text-sm">
              Ver Disponibilidad
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 SECCIÓN 2: CARACTERÍSTICAS DEL HOTEL */}
      <section className="py-12 bg-white border-b border-slate-100 px-6 md:px-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto -mt-12 rounded-2xl shadow-sm relative z-20">
        <div className="flex items-center gap-3.5 p-2"><Wifi className="text-blue-600" size={24} /> <div><p className="font-semibold text-sm">Wifi Ultra Rápido</p><p className="text-xs text-slate-400">Gratis en todo el hotel</p></div></div>
        <div className="flex items-center gap-3.5 p-2"><Coffee className="text-blue-600" size={24} /> <div><p className="font-semibold text-sm">Desayuno Buffet</p><p className="text-xs text-slate-400">Incluido en tu suite</p></div></div>
        <div className="flex items-center gap-3.5 p-2"><ShieldCheck className="text-blue-600" size={24} /> <div><p className="font-semibold text-sm">Estadía Segura</p><p className="text-xs text-slate-400">Monitoreo 24/7</p></div></div>
        <div className="flex items-center gap-3.5 p-2"><Star className="text-blue-600" size={24} /> <div><p className="font-semibold text-sm">Calificación 4.9</p><p className="text-xs text-slate-400">Por nuestros huéspedes</p></div></div>
      </section>

      {/* 📅 SECCIÓN 3: EL APARTADO DE DISPONIBILIDAD CLIENTE */}
      <section ref={timelineRef} className="max-w-[1400px] mx-auto px-4 py-16 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mapa de Habitaciones Libres</h2>
          <p className="text-sm text-slate-500">
            Selecciona cualquier bloque verde brillante para iniciar tu proceso de reserva directa de forma inmediata.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm font-medium animate-pulse">Sincronizando grilla del hotel...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto p-6">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 p-4 w-[180px] bg-white sticky left-0 z-10">Habitación</th>
                  {days.map((day, idx) => (
                    <th key={idx} className="text-center text-xs font-medium text-slate-500 p-4 bg-slate-50/50">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 bg-white sticky left-0 font-medium text-slate-900 border-r border-slate-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] z-10">
                      <div className="text-sm font-bold text-slate-800">Hab. {room.numero}</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5 capitalize">{room.tipo}</div>
                    </td>
                    
                    {fechasSemana.map((fecha, fIdx) => {
                      const celda = obtenerEstadoCelda(room.id, fecha);
                      return (
                        <td key={fIdx} className="p-2.5 text-center min-w-[130px]">
                          {celda.ocupado ? (
                            <div className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs border border-slate-200/40 select-none cursor-not-allowed uppercase tracking-wide">
                              Ocupado
                            </div>
                          ) : (
                            <button 
                              type="button" 
                              onClick={() => seleccionarCeldaLibre(room, fecha)} 
                              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.02] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all uppercase tracking-wider"
                            >
                              Libre
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 🟢 MODAL FLOTANTE DE RESERVAS INTEGRADO CORRECTAMENTE */}
      <ClientBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        room={selectedRoom}
        selectedDate={selectedDate}
        onSuccess={cargarDatosPublicos}
      />
    </div>
  );
}
