import { KeyRound, BookmarkCheck, PieChart } from "lucide-react";
import { DashboardMetrics } from "../hooks/useDashboardData";

interface MetricsCardsProps {
  data: DashboardMetrics;
}

export function MetricsCards({ data }: MetricsCardsProps) {
  // Mapeamos los datos dinámicos inyectados desde el Hook hacia tu excelente diseño visual
  const metricsStructure = [
    {
      title: "Habitaciones Disponibles",
      value: `${data.habitacionesDisponibles}`,
      subtitle: `de ${data.habitacionesTotales} totales`,
      icon: KeyRound,
      color: "bg-emerald-100 text-emerald-700 dark:text-emerald-400",
      trend: "Sincronizado con MySQL"
    },
    {
      title: "Reservas Activas",
      value: `${data.reservasActivas}`,
      subtitle: "En el hotel actualmente",
      icon: BookmarkCheck,
      color: "bg-blue-100 text-blue-700 dark:text-blue-400",
      trend: "Tiempo real activo"
    },
    {
      title: "Porcentaje de Ocupación",
      value: `${data.porcentajeOcupacion}%`,
      subtitle: "Capacidad actual ocupada",
      icon: PieChart,
      color: "bg-purple-100 text-purple-700 dark:text-purple-400",
      trend: data.porcentajeOcupacion > 70 ? "Alta demanda" : "Ocupación estable"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metricsStructure.map((metric, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col transition-colors duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.color} dark:bg-opacity-20`}>
              <metric.icon size={20} />
            </div>
          </div>
          
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {metric.title}
          </h3>
          
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
              {metric.value}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {metric.subtitle}
            </span>
          </div>
          
          <div className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
            {metric.trend}
          </div>
        </div>
      ))}
    </div>
  );
}
