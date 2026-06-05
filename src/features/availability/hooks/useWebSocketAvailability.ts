import { useEffect } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

interface UseWebSocketAvailabilityProps {
  onUpdate: () => void; // Función 'consultarBackend' que refrescará los estados de React
}

export function useWebSocketAvailability({ onUpdate }: UseWebSocketAvailabilityProps) {
  useEffect(() => {
    // 1. Apuntamos al endpoint configurado en tu clase WebSocketConfig.java
    const socket = new SockJS("http://localhost:8080/ws-hotel");
    const stompClient = Stomp.over(socket);

    // Desactivamos los mensajes de depuración en la consola para mantenerla limpia
    stompClient.debug = () => {};

    // 2. Establecemos conexión con el servidor de Spring Boot
    stompClient.connect({}, () => {
      // 3. Nos suscribimos al canal de disponibilidad del hotel
      stompClient.subscribe("/topic/disponibilidad", (mensaje) => {
        if (mensaje.body === "UPDATE_RESERVA") {
          // 🔥 Ejecuta el refresco de habitaciones y reservas instantáneamente
          onUpdate(); 
        }
      });
    }, (error) => {
      console.error("Error en la conexión por WebSocket. Reintentando...", error);
    });

    // 4. Limpieza del canal cuando el usuario sale de la vista de disponibilidad
    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {});
      }
    };
  }, [onUpdate]);
}
