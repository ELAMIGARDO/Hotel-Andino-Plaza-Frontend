import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Bell, LogOut, Calendar, User, Moon } from "lucide-react";

export function ClientHeader() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Recuperamos los datos del cliente logueado
  const userEmail = localStorage.getItem("user_email") || "huesped@andinoplaza.com";
  const userName = localStorage.getItem("auth_token")?.split(":")[0] || "Huésped";
  
  // Extraemos la inicial del nombre del cliente para el avatar circular (Ej: Juan -> J)
  const inicialAvatar = userName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login-huesped"; // Lo expulsa a su login correspondiente
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40 relative sticky top-0 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg">HotelAndinoPlaza</span>
        <h1 className="text-base font-semibold text-slate-800 tracking-tight">
          Portal de Reservas Directas
        </h1>
      </div>    

      <div className="flex items-center gap-4">
        {/* Notificaciones de cortesía del Huésped */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative" aria-label="Notificaciones">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown Idéntico al de tu Imagen */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className="h-9 w-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold shadow-sm border border-blue-200 cursor-pointer hover:bg-blue-200 transition-all select-none"
          >
            {inicialAvatar}
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 origin-top-right animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-bold text-slate-800 capitalize">Huésped: {userName}</p>
                <p className="text-xs text-slate-500 mt-0.5 break-all">{userEmail}</p>
              </div>
              
              <div className="p-2 space-y-0.5">
                <Link 
                  to="/consulta-cliente" 
                  onClick={() => setShowProfileMenu(false)} 
                  className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors flex items-center gap-3"
                >
                  <Calendar size={16} className="text-slate-400" /> 
                  Ver Mis Estadías Activas
                </Link>
                
                <button 
                  onClick={() => { 
                    document.documentElement.classList.toggle("dark"); 
                    setShowProfileMenu(false); 
                  }} 
                  className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors flex items-center gap-3"
                >
                  <Moon size={16} className="text-slate-400" /> 
                  Modo Noche
                </button>
              </div>
              
              <div className="p-2 border-t border-slate-100">
                <button 
                  onClick={handleLogout} 
                  className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-3"
                >
                  <LogOut size={16} className="text-red-500" /> 
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
