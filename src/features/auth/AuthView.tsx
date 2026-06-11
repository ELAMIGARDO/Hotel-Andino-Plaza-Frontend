// VISTA DE AUTENTICACIÓN - PÁGINA DE INICIO DE SESIÓN CORREGIDA
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Eye, EyeOff, Building } from "lucide-react";

export function AuthView() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 🛠️ CORRECCIÓN CRÍTICA: Creamos el Base64 manual antes de enviar la petición de login
      const tokenPlano = `${email}:${password}`;
      const tokenBase64 = btoa(tokenPlano);

      // 🌐 Enviamos la cabecera explícita requerida por el filtro STATELESS de Spring Security
      const response = await axios.get("http://localhost:8080/api/auth/me", {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      });

      // 2. Extraemos el rol que retorna tu base de datos a través de Spring
      const userRole = response.data?.rol;

      // 🔒 CANDADO ABSOLUTO: Si no es administrador, le denegamos el acceso
      if (userRole !== "ADMIN") {
        setError(
          "Acceso denegado: Esta plataforma es de uso exclusivo para el personal del hotel.",
        );
        setIsLoading(false);
        return;
      }

      // 3. Si es ADMIN y la cabecera fue aceptada, guardamos el String plano en el LocalStorage
      // para que useDashboardData y useTimeline puedan consumirlo y encriptarlo en cada click
      localStorage.setItem("auth_token", tokenPlano);
      localStorage.setItem("auth", "true");
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_role", "ADMIN");

      toast.success("¡Bienvenido al sistema!");
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error en la autenticación del panel:", error);

      // Si el servidor responde con 401, el problema son las credenciales
      if (error.response && error.response.status === 401) {
        setError("Correo electrónico o contraseña incorrectos");
      } else {
        setError(
          "Error de conexión con el servidor de seguridad de Spring Boot.",
        );
      }
    }
    {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 transition-colors duration-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm">
            <Building size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            Hotel Andino Plaza
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Acceso al sistema de gestión
          </p>
        </div>

        {/* Alerta de Error limpia y estilizada */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800/30">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              htmlFor="email"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="admin@andinoplaza.com"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-600 dark:text-slate-400">
                {" "}
                Recordarme{" "}
              </span>
            </label>
            <a
              href="#"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              ¿Olvidó su contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm mt-2 flex justify-center items-center"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
            ¿No tienes una cuenta?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              Regístrate aquí
            </button>
          </div>
          <div className="text-right mb-2">
            <button
              type="button"
              onClick={() => navigate("/login-huesped")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100"
            >
              Ingreso de Huéspedes →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
