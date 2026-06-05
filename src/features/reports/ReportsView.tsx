// VISTA DE REPORTES - ANÁLISIS DE RENDIMIENTO Y MÉTRICAS OPERATIVAS CON DATOS DE SPRING BOOT

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FileDown, Calendar as CalendarIcon, Filter } from "lucide-react";
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
  estado: string; // "ACTIVA", "FINALIZADA", "CANCELADA"
  motivoCancelacion?: string;
  habitacion: Habitacion;
}

export function ReportsView() {
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [habitacionesCount, setHabitacionesCount] = useState(0);

  // 1. Estado para almacenar los límites de tiempo de la semana actual en curso
  const [rangoSemana, setRangoSemana] = useState<{
    inicio: Date;
    fin: Date;
  } | null>(null);

  useEffect(() => {
    // Calcula dinámicamente el lunes y domingo de la semana actual al cargar la pantalla
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diferencia = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);

    const lunes = new Date(hoy.setDate(diferencia));
    lunes.setHours(0, 0, 0, 0);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);

    setRangoSemana({ inicio: lunes, fin: domingo });

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
    cargarDatosEstadisticos();
  }, []);

  // FUNCIÓN LOCAL: Previene el desfase de días por conversión de zona horaria UTC
  const crearFechaLocal = (fechaStr: string) => {
    if (!fechaStr) return new Date();
    const [anio, mes, dia] = fechaStr.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  };

  // A) Filtro para la tabla inferior: Captura las canceladas de MySQL
  const reservasCanceladas = reservas.filter((r) => r.estado === "CANCELADA");

  // B) Tasa de Ocupación: Habitaciones con estado "ACTIVA" hoy
  const totalActivas = reservas.filter((r) => r.estado === "ACTIVA").length;
  const porcentajeOcupadas =
    habitacionesCount > 0
      ? Math.round((totalActivas / habitacionesCount) * 100)
      : 0;
  const porcentajeDisponibles = 100 - porcentajeOcupadas;

  const occupancyData = [
    { name: "Ocupadas", value: porcentajeOcupadas },
    { name: "Disponibles", value: porcentajeDisponibles },
  ];
  const COLORS = ["#2563eb", "#10b981"];

  // D) Gráfico de Barras: Mapeo real e independiente por días de la semana actual en curso
  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const revenueData = diasSemana.map((dia, index) => {
    const ingresosDelDia = reservas
      .filter((r) => {
        if (r.estado !== "ACTIVA" && r.estado !== "FINALIZADA") return false;

        const fechaSalidaReserva = crearFechaLocal(r.fechaSalida);

        // Si el rango de la semana no se ha calculado, omitimos temporalmente
        if (!rangoSemana) return false;

        // Validamos estrictamente si la fecha pertenece a la semana transcurriendo
        const perteneceASemanaActual =
          fechaSalidaReserva >= rangoSemana.inicio &&
          fechaSalidaReserva <= rangoSemana.fin;

        if (!perteneceASemanaActual) return false;

        let diaIndex = fechaSalidaReserva.getDay();
        diaIndex = diaIndex === 0 ? 6 : diaIndex - 1; // Ajuste Lunes = 0, Domingo = 6

        return diaIndex === index;
      })
      .reduce((sum, r) => {
        const fechaInLocal = crearFechaLocal(r.fechaIngreso);
        const fechaOutLocal = crearFechaLocal(r.fechaSalida);

        const milisegundosPorDia = 1000 * 60 * 60 * 24;
        const noches = Math.round(
          (fechaOutLocal.getTime() - fechaInLocal.getTime()) /
            milisegundosPorDia,
        );
        const nochesCalculadas = noches <= 0 ? 1 : noches;

        return sum + nochesCalculadas * (r.habitacion?.precio || 0);
      }, 0);

    return { name: dia, ingresos: ingresosDelDia };
  });

  // C) Ingresos Acumulados: Sumamos únicamente lo recaudado dentro de la semana actual
  const totalIngresosAcumulados = revenueData.reduce(
    (sum, item) => sum + item.ingresos,
    0,
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Generando indicadores y procesando base de datos...
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Resumen de rendimiento y métricas operativas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-800 transition-colors duration-200 shadow-sm">
              <CalendarIcon
                size={14}
                className="text-slate-500 dark:text-slate-400 ml-2"
              />
              <select className="bg-transparent text-sm border-none focus:ring-0 text-slate-700 dark:text-slate-300 py-1 pr-8 cursor-pointer [&>option]:text-slate-900">
                <option>Últimos 7 días</option>
                <option>Últimos 30 días</option>
              </select>
            </div>
            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <FileDown size={16} /> Exportar
            </button>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart: Ingresos Distribuidos Reales */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Ingresos
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Últimos 7 días
                </p>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                  ${totalIngresosAcumulados.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Sincronizado con MySQL
                </span>
              </div>
            </div>
            <div className="h-64 w-full opacity-90 dark:opacity-100">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    className="text-slate-500 dark:text-slate-400"
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    className="text-slate-500 dark:text-slate-400"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "currentColor", opacity: 0.05 }}
                    contentStyle={{
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      color: "#000",
                    }}
                    formatter={(value: any) => [`$${value}`, "Ingresos"]}
                  />
                  <Bar
                    dataKey="ingresos"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Tasa de Ocupación Dinámica */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col transition-colors duration-200">
            <div className="mb-2">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Tasa de Ocupación
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Estado actual de habitaciones
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "8px" }}
                    formatter={(value: any) => [`${value}%`, "Porcentaje"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-semibold text-slate-800 dark:text-slate-100">
                  {porcentajeOcupadas}%
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Ocupadas
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {occupancyData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla: Cancelaciones Mapeadas de MySQL */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Registros Eliminados y Cancelaciones
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Historial de reservas canceladas en la base de datos
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-600">
              <Filter size={14} /> Filtrar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    ID Reserva
                  </th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    Cliente
                  </th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    Fecha de Cancelación
                  </th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    Motivo
                  </th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">
                    Monto Pérdida
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                {reservasCanceladas.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                      RES-{booking.id}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {booking.nombreCliente}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {booking.fechaSalida}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
                        {booking.motivoCancelacion || "Cambio de planes"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-800 dark:text-slate-200">
                      $
                      {booking.habitacion?.precio
                        ? booking.habitacion.precio.toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reservasCanceladas.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No hay historial de reservas canceladas registrado en MySQL.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
