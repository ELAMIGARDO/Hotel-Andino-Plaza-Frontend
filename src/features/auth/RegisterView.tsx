import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, UserPlus, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function RegisterView() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reglas estrictas idénticas al modal de administrador
  const reglasDocumento: Record<string, { max: number; placeholder: string }> = {
    DNI: { max: 8, placeholder: "Ej. 12345678" },
    RUC: { max: 11, placeholder: "Ej. 20123456789" },
    PASAPORTE: { max: 9, placeholder: "Ej. E123456" },
  };

  const reglaActual = reglasDocumento[tipoDocumento] || reglasDocumento.DNI;

  // Filtrado de caracteres en tiempo real al escribir el documento
  const handleDocumentoInputChange = (valor: string) => {
    let filtrado = valor;
    if (tipoDocumento === "DNI" || tipoDocumento === "RUC") {
      filtrado = valor.replace(/\D/g, "").slice(0, reglaActual.max);
    } else if (tipoDocumento === "PASAPORTE") {
      filtrado = valor.replace(/[^A-Za-z0-9]/g, "").slice(0, reglaActual.max);
    }
    setNumeroDocumento(filtrado);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Validación de longitud del documento antes de enviar
    if (numeroDocumento.length < reglaActual.max) {
      toast.error(`El número de ${tipoDocumento} debe tener exactamente ${reglaActual.max} caracteres.`);
      return;
    }

    // 2. 🔐 CANDADO DE SEGURIDAD EXCLUSIVO: Expresión regular para la contraseña
    // Requiere mínimo 6 caracteres, al menos una letra mayúscula y al menos un carácter especial
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "La contraseña es muy débil. Debe incluir obligatoriamente al menos una letra MAYÚSCULA, un carácter especial (Ej: @, $, !, #, *) y tener un mínimo de 6 caracteres."
      );
      toast.error("Contraseña no cumple con los requisitos de seguridad.");
      return;
    }

    setIsLoading(true);

    try {
      // Enviamos el objeto completo mapeado con los nuevos campos de MySQL
      await axios.post("http://localhost:8080/api/auth/register", {
        nombre: nombre,
        email: email,
        password: password,
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento
      });

      toast.success("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
      navigate("/"); 
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("No se pudo conectar con el servidor de registro.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 transition-colors duration-200">
        
        <button 
          onClick={() => navigate("/")} 
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Volver al inicio de sesión
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            Crear una Cuenta
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Regístrate como huésped del Hotel Andino Plaza
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-800/30 whitespace-pre-line leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo Doc.
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => {
                  setTipoDocumento(e.target.value);
                  setNumeroDocumento(""); 
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm h-[42px]"
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">PAS.</option>
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Número de Documento
              </label>
              <input
                type="text"
                value={numeroDocumento}
                onChange={(e) => handleDocumentoInputChange(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[42px]"
                placeholder={reglaActual.placeholder}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-11"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Pequeña guía visual informativa debajo del campo */}
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck size={12} className="text-blue-500" /> Requerido: 1 Mayúscula y 1 Carácter Especial (@, !, #, $, etc.)
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm mt-4 flex justify-center items-center"
          >
            {isLoading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>
      </div>
    </div>
  );
}
