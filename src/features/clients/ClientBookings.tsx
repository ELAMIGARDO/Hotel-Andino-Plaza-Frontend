import { useState, useEffect } from "react";
import { ClientHeader } from "./ClienteHeader";
import { ClientBookingModal } from "./ClientBookingModal";
import { Calendar, Edit2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";
import SockJS from "sockjs-client"; // 🟢 Conexión oficial de tu endpoint compatible con withSockJS()
import { Client } from "@stomp/stompjs";

interface Booking {
  id: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  price: number;
  status: string;
}

export function ClientBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const tokenPlano = localStorage.getItem("auth_token") || "";

  const cargarReservasDelServidor = async () => {
    if (!tokenPlano) {
      setIsLoading(false);
      return;
    }

    try {
      const tokenBase64 = btoa(tokenPlano);
      const configHeaders = {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      };

      const userProfileRes = await axios.get("http://localhost:8080/api/auth/me", configHeaders);
      const miDocumento = userProfileRes.data.numeroDocumento;

      const response = await axios.get("http://localhost:8080/api/reservas", configHeaders);
      const todasLasReservas = response.data;

      const misReservasFiltradas = todasLasReservas.filter(
        (res: any) => res.numeroDocumento === miDocumento
      );

      const reservasMapeadas = misReservasFiltradas.map((res: any) => ({
        id: `RES-${res.id}`,
        roomNumber: res.habitacion?.numero || "N/A",
        roomType: res.habitacion?.tipo || "Habitación Estándar",
        checkIn: res.fechaIngreso,
        checkOut: res.fechaSalida,
        price: res.precioTotal || res.habitacion?.precio || 150, 
        status: res.estado || "ACTIVA"
      }));

      setBookings(reservasMapeadas);
    } catch (error) {
      console.error("Error al sincronizar estadías desde Spring Boot:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 CONEXIÓN WEBSOCKET CORREGIDA Y ACOPLADA A TU ARCHIVO WEBSOCKCONFIG.JAVA
  useEffect(() => {
    cargarReservasDelServidor();

    const stompClient = new Client({
      // 🟢 SOLUCIÓN: Usamos factory con SockJS apuntando al endpoint real /ws-hotel
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-hotel"),
      reconnectDelay: 5000, 
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("🟢 ¡Conectado con éxito al canal de WebSockets del hotel (/ws-hotel)!");
        
        stompClient.subscribe("/topic/disponibilidad", (message) => {
          console.log("📩 Mensaje recibido desde Spring Boot:", message.body);
          
          if (message.body === "UPDATE_RESERVA") {
            // Ejecución limpia diferida para que coincida con el asentamiento en Base de Datos
            setTimeout(() => {
              cargarReservasDelServidor();
            }, 150);
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ Error en el broker de STOMP:", frame.headers['message']);
      }
    });

    stompClient.activate();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
        console.log("🔴 Conexión de WebSocket cerrada limpiamente");
      }
    };
  }, []); 

  const handleOpenEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const crearDateSeguro = (fechaStr: string) => {
    if (!fechaStr) return new Date();
    const [anio, mes, dia] = fechaStr.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  };

  const obtenerEstiloEstado = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVA":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "CANCELADA":
        return "bg-red-50 text-red-700 border-red-100";
      case "FINALIZADA":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <ClientHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm font-medium text-slate-500">Sincronizando portal en tiempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ClientHeader />

      <main className="max-w-4xl w-full mx-auto p-6 space-y-6 flex-1">
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="text-blue-600" size={24} />
              Historial de mis Estadías
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Visualiza tus reservas en tiempo real y gestiona tus fechas de alojamiento.
            </p>
          </div>
          
          <a href="/home" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm shrink-0">
            <ArrowLeft size={14} className="text-slate-500" />
            Volver a Reservar Habitaciones
          </a>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-white shadow-sm">
            <p className="text-slate-500 font-medium">No tienes ninguna estadía registrada a tu nombre.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${obtenerEstiloEstado(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{booking.id}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">Hotel Andino Plaza</h3>
                  <p className="text-sm text-slate-600 font-medium">{booking.roomType} (N° {booking.roomNumber})</p>
                  <p className="text-sm text-slate-500">
                    Ingreso: <span className="font-semibold text-slate-700">{booking.checkIn}</span> — Salida: <span className="font-semibold text-slate-700">{booking.checkOut}</span>
                  </p>
                </div>

                <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Total Estimado</span>
                    <span className="text-xl font-black text-slate-900">${booking.price} USD</span>
                  </div>

                  {booking.status.toUpperCase() === "ACTIVA" ? (
                    <button 
                      onClick={() => handleOpenEdit(booking)}
                      className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Edit2 size={14} /> Modificar Fechas
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic select-none">No modificable</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex gap-3 items-start">
          <AlertCircle className="text-slate-500 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-slate-600 leading-relaxed">
            Las modificaciones sobre reservas activas se sincronizan instantáneamente mediante WebSockets con la central del hotel.
          </p>
        </div>
      </main>

      {isModalOpen && selectedBooking && (
        <ClientBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          room={{ 
            id: 1, 
            numero: selectedBooking.roomNumber, 
            tipo: selectedBooking.roomType 
          }}
          selectedDate={crearDateSeguro(selectedBooking.checkIn)}
          isEditing={true}
          bookingId={selectedBooking.id}
          currentBooking={{
            fechaIngreso: selectedBooking.checkIn,
            fechaSalida: selectedBooking.checkOut
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            cargarReservasDelServidor(); 
          }}
        />
      )}
    </div>
  );
}
