import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Building, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function ClientLoginView() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const tokenPlano = `${email}:${password}`;
      const tokenBase64 = btoa(tokenPlano);

      // Validamos contra tu Spring Boot
      const response = await axios.get("http://localhost:8080/api/auth/me", {
        headers: {
          "Authorization": `Basic ${tokenBase64}`,
          "Content-Type": "application/json"
        }
      });

      const userRole = response.data?.rol;

      // 🔓 REGLA CLIENTE: Permite ingresar a USER o ADMIN (por si el admin quiere revisar)
      if (userRole !== "USER" && userRole !== "ADMIN") {
        setError("Acceso no autorizado.");
        setIsLoading(false);
        return;
      }

      // Guardamos la sesión pública del cliente
      localStorage.setItem("auth_token", tokenPlano);
      localStorage.setItem("auth", "true");
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_role", userRole);

      toast.success("¡Sesión de huésped iniciada!");
      
      // 🚀 Te redirige a la vista del cliente/home pública que creamos antes
      window.location.href = "/home"; 

    } catch (err: any) {
      console.error(err);
      setError("Correo electrónico o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 transition-colors duration-200">
        
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={14} /> Volver a zona administrativa
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm">
            <Building size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            Portal del Huésped
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ingresa para gestionar tus reservas
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleClientLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              placeholder="juanperez@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 pr-11"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm mt-2">
            {isLoading ? "Validando huésped..." : "Iniciar Sesión Huésped"}
          </button>
        </form>
      </div>
    </div>
  );
}
