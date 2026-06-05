/// Componente de Layout Principal para la Aplicación

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Bell, CheckCircle2, AlertCircle, Info, Settings, Moon, LogOut } from "lucide-react";

export function AppLayout() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, type: "success", title: "Nueva Reserva Confirmada", message: "Juan Pérez reservó la Suite 201 por 3 noches.", time: "Hace 10 min", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { id: 2, type: "warning", title: "Cancelación de Reserva", message: "Reserva #4091 ha sido cancelada.", time: "Hace 1 hora", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { id: 3, type: "info", title: "Mantenimiento Programado", message: "Habitación 302 en limpieza profunda.", time: "Hace 2 horas", icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard": return "Panel de Control";
      case "/availability": return "Disponibilidad de Habitaciones";
      case "/guests": return "Directorio de Huéspedes";
      case "/reports": return "Reportes e Indicadores";
      case "/settings": return "Configuración";
      case "/ui-kit": return "Modificar (UI Kit)";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 relative transition-colors duration-200">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">{getPageTitle()}</h1>
          
          <div className="flex items-center gap-4">
            
            {/* Notification Dropdown Container */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>

              {/* Notification Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50 origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Notificaciones</h3>
                    <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">3 Nuevas</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 cursor-pointer">
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.bg} ${notif.color} dark:bg-opacity-20`}>
                          <notif.icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{notif.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700">
                    <button className="w-full py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors">
                      Marcar todas como leídas
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Container */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-8 w-8 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center font-medium shadow-sm border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors select-none"
              >
                AD
              </div>

              {/* Profile Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50 origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Administrador</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">admin@andinoplaza.com</p>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <Link 
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors flex items-center gap-3"
                    >
                      <Settings size={16} />
                      Configuración
                    </Link>
                    <button 
                      onClick={() => {
                        document.documentElement.classList.toggle('dark');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors flex items-center gap-3 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Moon size={16} />
                      Modo Noche
                    </button>
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => navigate("/")}
                      className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center gap-3"
                    >
                      <LogOut size={16} className="text-red-500 dark:text-red-400" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </header>

        <div className="flex-1 overflow-auto flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}