import { useState, useEffect } from "react";
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
  // 🚀 Modificado: Ahora inicia por defecto en "diario" para ver el detalle por cliente
  const [filtroDias, setFiltroDias] = useState<string>("diario");

  const cargarDatosEstadisticos = async () => {
    try {
      const [resReservas, resHabitaciones] = await Promise.all([
        axios.get("http://localhost:8080/api/reservas"),
        axios.get("http://localhost:8080/api/habitaciones"),
      ]);
      setReservas(resReservas.data);
      setHabitacionesCount(resHabitaciones.data.length);
    } catch (error) {
      console.error("Error al cargar reportes desde Spring Boot:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosEstadisticos();
  }, [filtroDias]);

  const crearFechaLocal = (fechaStr: string) => {
    if (!fechaStr) return new Date();
    const [anio, mes, dia] = fechaStr.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  };

  // A) Filtrar Canceladas
  const reservasCanceladas = reservas.filter((r) => r.estado === "CANCELADA");

  // B) Ocupación Real (Ignora mantenimientos)
  const totalActivas = reservas.filter(
    (r) => r.estado === "ACTIVA" && r.numeroDocumento !== "00000000"
  ).length;

  const porcentajeOcupadas = habitacionesCount > 0 ? Math.round((totalActivas / habitacionesCount) * 100) : 0;
  const porcentajeDisponibles = 100 - porcentajeOcupadas;

  const occupancyData = [
    { name: "Ocupadas", value: porcentajeOcupadas },
    { name: "Disponibles", value: porcentajeDisponibles },
  ];

  // C) Limpiar bloqueos de mantenimiento
  const reservasValidas = reservas.filter(
    (r) => (r.estado === "ACTIVA" || r.estado === "FINALIZADA") && r.numeroDocumento !== "00000000"
  );

  // 📊 D) GRÁFICO DE BARRAS ULTRA DINÁMICO (Soporta Diario, Semanal y Mensual)
  let revenueData: { name: string; ingresos: number }[] = [];

  if (filtroDias === "diario") {
    // 👥 MODO DIARIO: Muestra barras individuales con el Primer Nombre de cada cliente
    // Ordenamos de más reciente a antiguo, tomamos los últimos 7 clientes y los revertimos para orden cronológico
    const ultimasReservas = [...reservasValidas]
      .sort((a, b) => b.id - a.id)
      .slice(0, 7)
      .reverse();

    revenueData = ultimasReservas.map((r) => {
      const fechaInLocal = crearFechaLocal(r.fechaIngreso);
      const fechaOutLocal = crearFechaLocal(r.fechaSalida);
      const noches = Math.round((fechaOutLocal.getTime() - fechaInLocal.getTime()) / (1000 * 60 * 60 * 24));
      const nochesCalculadas = noches <= 0 ? 1 : noches;
      const primerNombre = r.nombreCliente.split(" ")[0] || `Res-${r.id}`;

      return {
        name: primerNombre.toUpperCase(),
        ingresos: nochesCalculadas * (r.habitacion?.precio || 0),
      };
    });
  } else {
    // 🗓️ MODO SEMANAL / MENSUAL: Agrupación fija por fechas
    const filtroEsSemanal = filtroDias === "7";
    const etiquetasGrafico = filtroEsSemanal 
      ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
      : ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];

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
  const totalIngresosAcumulados = revenueData.reduce((sum, item) => sum + item.ingresos, 0);

  // F) Exportación limpia a Excel
  const exportarExcelCSV = () => {
    if (reservas.length === 0) return alert("No hay datos para exportar");
    let csvContent = "data:text/csv;charset=utf-8,ID Reserva,Cliente,Documento,Fecha Ingreso,Fecha Salida,Estado,Precio Habitacion\n";

    reservas.forEach((r) => {
      if (r.numeroDocumento !== "00000000") {
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
