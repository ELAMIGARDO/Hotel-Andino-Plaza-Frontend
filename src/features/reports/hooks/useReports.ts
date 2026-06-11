import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Habitacion {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
}

interface Reserva {
  id: number;
  nombreCliente: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaIngreso: string;
  fechaSalida: string;
  estado: string;
  motivoCancelacion?: string;
  habitacion: Habitacion;
}

export function useReports() {
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [habitacionesCount, setHabitacionesCount] = useState(0);
  // 🚀 Inicia por defecto en "diario" para ver el detalle por cliente
  const [filtroDias, setFiltroDias] = useState<string>("diario");

  // 1. 🔥 Función principal optimizada con useCallback y convertida a Base64 para Spring Security
  const cargarDatosEstadisticos = useCallback(async () => {
    // 🔑 RECUPERACIÓN DE LAS CREDENCIALES REALES EN FORMATO "usuario:password"
    const credentials = localStorage.getItem("auth_token");

    // Si no existen credenciales guardadas, evitamos disparar peticiones fallidas a ciegas
    if (!credentials) {
      console.warn("useReports: No se encontraron credenciales válidas en localStorage.");
      setLoading(false);
      return;
    }

    try {
      // 🛠️ CORRECCIÓN CRÍTICA: Convertimos el string plano a Base64 para HTTP Basic
      const tokenBase64 = btoa(credentials);

      const configHeaders = {
        headers: {
          "Authorization": `Basic ${tokenBase64}`,
          "Content-Type": "application/json"
        }
      };

      const [resReservas, resHabitaciones] = await Promise.all([
        axios.get("http://localhost:8080/api/reservas", configHeaders),
        axios.get("http://localhost:8080/api/habitaciones", configHeaders),
      ]);

      // Salvaguarda: Forzamos a que siempre se reciba un array válido de la API
      const dataReservas = Array.isArray(resReservas.data) ? resReservas.data : [];
      const dataHabitaciones = Array.isArray(resHabitaciones.data) ? resHabitaciones.data : [];

      setReservas(dataReservas);
      setHabitacionesCount(dataHabitaciones.length);
    } catch (error) {
      console.error("Error al cargar reportes desde Spring Boot:", error);
      // En caso de error de red o de autenticación, vaciamos los estados de forma segura
      setReservas([]);
      setHabitacionesCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosEstadisticos();
  }, [filtroDias, cargarDatosEstadisticos]);

  const crearFechaLocal = (fechaStr: string) => {
    if (!fechaStr) return new Date();
    const [anio, mes, dia] = fechaStr.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  };

  // 🛡️ SALVAGUARDA: Garantizamos arrays válidos para los filtros ante fallos de API
  const seguroReservas = Array.isArray(reservas) ? reservas : [];

  // A) Filtrar Canceladas
  const reservasCanceladas = seguroReservas.filter((r) => r && r.estado === "CANCELADA");

  // B) Ocupación Real (Ignora mantenimientos)
  const totalActivas = seguroReservas.filter(
    (r) => r && r.estado === "ACTIVA" && r.numeroDocumento !== "00000000"
  ).length;

  const porcentajeOcupadas = habitacionesCount > 0 ? Math.round((totalActivas / habitacionesCount) * 100) : 0;
  const porcentajeDisponibles = 100 - porcentajeOcupadas;
  
  const occupancyData = [
    { name: "Ocupadas", value: porcentajeOcupadas },
    { name: "Disponibles", value: porcentajeDisponibles },
  ];

  // C) Limpiar bloqueos de mantenimiento para ingresos reales (Filtro estricto anti-dinero ficticio)
  const reservasValidas = seguroReservas.filter(
    (r) => r && 
    (r.estado === "ACTIVA" || r.estado === "FINALIZADA") && 
    r.numeroDocumento !== "00000000" &&
    !(r.nombreCliente && r.nombreCliente.includes("INTERNO:"))
  );

  // 📊 D) GRÁFICO DE BARRAS ULTRA DINÁMICO (Soporta Diario, Semanal y Mensual)
  let revenueData: { name: string; ingresos: number }[] = [];

  if (filtroDias === "diario") {
    // 👥 MODO DIARIO: Muestra barras individuales con el Primer Nombre de cada cliente
    const ultimasReservas = [...reservasValidas]
      .sort((a, b) => (b?.id || 0) - (a?.id || 0))
      .slice(0, 7)
      .reverse();

    revenueData = ultimasReservas.map((r) => {
      const fechaInLocal = crearFechaLocal(r.fechaIngreso);
      const fechaOutLocal = crearFechaLocal(r.fechaSalida);
      const noches = Math.round((fechaOutLocal.getTime() - fechaInLocal.getTime()) / (1000 * 60 * 60 * 24));
      const nochesCalculadas = noches <= 0 ? 1 : noches;
      
      const primerNombre = r.nombreCliente ? r.nombreCliente.split(" ")[0] : `Res-${r.id}`;
      
      return {
        name: primerNombre.toUpperCase(),
        ingresos: nochesCalculadas * (r.habitacion?.precio || 0),
      };
    });
  } else {
    // 🗓️ MODO SEMANAL / MENSUAL: Agrupación fija por fechas
    const filtroEsSemanal = filtroDias === "7";
    const etiquetasGrafico = filtroEsSemanal ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] : ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];

    revenueData = etiquetasGrafico.map((etiqueta, index) => {
      const ingresosDelBloque = reservasValidas
        .filter((r) => {
          const fechaSalidaReserva = crearFechaLocal(r.fechaSalida);
          if (filtroEsSemanal) {
            let diaIndex = fechaSalidaReserva.getDay();
            diaIndex = diaIndex === 0 ? 6 : diaIndex - 1; // Ajuste Lunes = 0
            return diaIndex === index;
          } else {
            const diaDelMes = fechaSalidaReserva.getDate();
            const semanaIndex = Math.min(Math.floor((diaDelMes - 1) / 7), 3);
            return semanaIndex === index;
          }
        })
        .reduce((sum, r) => {
          const fechaInLocal = crearFechaLocal(r.fechaIngreso);
          const fechaOutLocal = crearFechaLocal(r.fechaSalida);
          const noches = Math.round((fechaOutLocal.getTime() - fechaInLocal.getTime()) / (1000 * 60 * 60 * 24));
          const nochesCalculadas = noches <= 0 ? 1 : noches;
          return sum + nochesCalculadas * (r.habitacion?.precio || 0);
        }, 0);

      return { name: etiqueta, ingresos: ingresosDelBloque };
    });
  }

  // E) Calcular la suma total acumulada dinámicamente de lo que se ve en pantalla
  const totalIngresosAcumulados = revenueData.reduce((sum, item) => sum + (item?.ingresos || 0), 0);

  // F) Exportación limpia a Excel
  const exportarExcelCSV = () => {
    const seguroExportar = Array.isArray(reservas) ? reservas : [];
    if (seguroExportar.length === 0) return alert("No hay datos para exportar");

    let csvContent = "data:text/csv;charset=utf-8,ID Reserva,Cliente,Documento,Fecha Ingreso,Fecha Salida,Estado,Precio Habitacion\n";

    seguroExportar.forEach((r) => {
      if (r && r.numeroDocumento !== "00000000" && r.estado !== "MANTENIMIENTO" && r.estado !== "LIMPIEZA") {
        const fila = `RES-${r.id},${r.nombreCliente},${r.numeroDocumento},${r.fechaIngreso},${r.fechaSalida},${r.estado},S/.${r.habitacion?.precio || 0}`;
        csvContent += fila + "\n";
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Hotel_Andino_${filtroDias}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    loading,
    totalIngresosAcumulados,
    porcentajeOcupadas,
    occupancyData,
    revenueData,
    reservasCanceladas,
    filtroDias,
    setFiltroDias,
    exportarExcelCSV,
  };
}
