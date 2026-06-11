// COMPONENTE DE BARRA LATERAL DE NAVEGACIÓN
import { Building, LayoutDashboard, CalendarDays, Users, Settings, LogOut, Layers, BarChart2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import clsx from "clsx";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Disponibilidad", path: "/availability", icon: CalendarDays },
    { name: "Huéspedes", path: "/guests", icon: Users },
    { name: "Reportes", path: "/reports", icon: BarChart2 },
    { name: "Configuración", path: "/settings", icon: Settings },
    { name: "Modificar", path: "/ui-kit", icon: Layers },
  ];

  // 🚪 FUNCIÓN DE LOGOUT OPERATIVO
  const handleLogout = () => {
    localStorage.clear(); // Elimina auth, auth_token, user_role y user_email de un solo golpe
    navigate("/");
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors duration-200">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shrink-0 shadow-sm">
          <Building size={16} />
        </div>
        <span className="font-semibold text-slate-800 dark:text-slate-100 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
          Andino Plaza
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "#" && item.name === "Dashboard");
          return (
            <Link
              key={item.name}
              to={item.path !== "#" ? item.path : "/dashboard"}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <item.icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors group"
        >
          <LogOut size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
