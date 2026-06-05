// VISTA DE UI KIT - DEMOSTRACIÓN DE COMPONENTES DE INTERFAZ DE USUARIO PARA EL HOTEL

import { X, History, Printer, Sparkles, Trash2, Calendar as CalendarIcon, ChevronDown } from "lucide-react";

export function UIKitView() {
  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* 1. Modal: Confirmar Cambios */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden max-w-md mx-auto w-full transition-colors duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Confirmar Cambios</h3>
              <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                ¿Desea guardar la información de esta reserva actual?
              </p>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                  Volver
                </button>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                  Sí, Guardar
                </button>
              </div>
            </div>
          </div>

          {/* 2. Diálogo de Advertencia: Descartar Cambios */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden max-w-md mx-auto w-full transition-colors duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Descartar Cambios</h3>
              <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Hay datos sin guardar en el formulario. Si sale ahora, se perderá la información.
              </p>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                  Continuar Editando
                </button>
                <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                  Descartar
                </button>
              </div>
            </div>
          </div>

          {/* 3. Formulario Modal: Bloquear Habitación */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden max-w-md mx-auto w-full transition-colors duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Bloquear Habitación</h3>
              <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-slate-400 dark:text-slate-500" />
                    Fecha de inicio
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-transparent [&::-webkit-calendar-picker-indicator]:dark:invert"
                    defaultValue="2026-05-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-slate-400 dark:text-slate-500" />
                    Fecha de fin
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-transparent [&::-webkit-calendar-picker-indicator]:dark:invert"
                    defaultValue="2026-05-03"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Motivo</label>
                <div className="relative">
                  <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-transparent appearance-none pr-10 [&>option]:text-slate-900">
                    <option>Mantenimiento preventivo</option>
                    <option>Limpieza profunda</option>
                    <option>Reparación de daños</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors w-full">
                  Bloquear Habitación
                </button>
              </div>
            </div>
          </div>

          {/* 4. Diálogo de Opciones de Exportación */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden max-w-md mx-auto w-full transition-colors duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Opciones de Exportación</h3>
              <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded">
                     <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Datos del Cliente</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded">
                     <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Detalles del Pago</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Historial</span>
                </label>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors w-full">
                  Descargar Archivo
                </button>
              </div>
            </div>
          </div>
          
          {/* 5. Menú Contextual Desplegable */}
          <div className="flex justify-center items-start pt-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 py-2 w-56 transition-colors duration-200">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <History size={16} className="text-slate-400 dark:text-slate-500" />
                <span className="font-medium">Ver Historial</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <Printer size={16} className="text-slate-400 dark:text-slate-500" />
                <span className="font-medium">Imprimir Recibo</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <Sparkles size={16} className="text-slate-400 dark:text-slate-500" />
                <span className="font-medium">Asignar Limpieza</span>
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">
                <Trash2 size={16} className="text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
                <span className="font-medium">Eliminar Reserva</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}