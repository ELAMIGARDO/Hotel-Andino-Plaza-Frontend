// VISTA DE HUÉSPEDES - GESTIÓN DE CLIENTES DEL HOTEL
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { useGuests } from "./hooks/useGuests";
import { Link } from "react-router";

export function GuestsView() {
  // 🔥 Inyección de la lógica limpia de extracción y unicidad desde el Hook
  const { 
    loading, 
    terminoBusqueda, 
    setTerminoBusqueda, 
    filteredGuests 
  } = useGuests();

  // Pantalla de carga mientras lee el array de reservas de Spring Boot
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        Sincronizando el historial de clientes desde MySQL...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-200 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Toolbar Conectado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar huésped por nombre o DNI..." 
              value={terminoBusqueda} 
              onChange={(e) => setTerminoBusqueda(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 transition-colors duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
            />
          </div>

          {/* Indicador del total de clientes únicos extraídos en vivo */}
          <div className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-medium border border-blue-100 dark:border-blue-900/30">
            Total en Historial: {filteredGuests.length} Clientes únicos
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  <th className="px-6 py-4">Nombre del Cliente</th>
                  <th className="px-6 py-4">Documento (DNI/Pasaporte)</th>
                  <th className="px-6 py-4">Correo Electrónico</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Estado</th> {/* 💡 Alineado a la izquierda para empalmar con la bola */}
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                {filteredGuests.map((guest) => {
                  // 🎯 CANDADO CONDICIONAL DE ESTADO OPERATIVO
                  const esActivo = guest.estadoOperativo === "ACTIVO";

                  return (
                    <tr key={guest.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                        {guest.nombreCompleto}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 uppercase">
                        {guest.tipoDocumento}: {guest.numeroDocumento}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {guest.correoElectronico}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {guest.telefono}
                      </td>
                      
                      {/* 🟢 INTERFAZ DE ESFERAS EN TIEMPO REAL INYECTADA */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            esActivo 
                              ? "bg-emerald-500 animate-pulse" // Esfera verde parpadeante si está hoy en el hotel
                              : "bg-rose-400"                  // Esfera rosa/rojo fijo si ya finalizó su estadía
                          }`} />
                          <span className={`text-xs font-medium uppercase tracking-wider ${
                            esActivo 
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold" 
                              : "text-slate-400 dark:text-slate-500"
                          }`}>
                            {esActivo ? "Hospedado" : "Finalizado"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* Enlace estético al UI Kit */}
                          <Link 
                            to="/ui-kit" 
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors block" 
                            title="Ver ficha" 
                          >
                            <Edit2 size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerta de no resultados */}
        {filteredGuests.length === 0 && (
          <div className="text-center py-8 bg-white dark:bg-slate-800 border border-t-0 border-slate-200 dark:border-slate-700 rounded-b-xl text-slate-500 dark:text-slate-400 text-sm">
            No se encontraron clientes registrados en el historial de reservas bajo ese criterio.
          </div>
        )}

      </div>
    </div>
  );
}