// VISTA DE CONFIGURACIÓN - GESTIÓN DE PERFIL, DATOS DEL HOTEL Y PREFERENCIAS DEL SISTEMA

import { useState } from "react";
import { User, Building2, Bell, Database, Camera, Settings } from "lucide-react";
import clsx from "clsx";

export function SettingsView() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 1. Perfil del Administrador */}
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
          <div className="border-b border-slate-100 dark:border-slate-700/50 px-6 py-4 flex items-center gap-2">
            <User size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Perfil del Administrador</h2>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1644268756918-16348d1bc619?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBjb3Jwb3JhdGUlMjBwb3J0cmFpdCUyMGhlYWRzaG90JTIwZXhlY3V0aXZlJTIwbWFuJTIwc3VpdHxlbnwxfHx8fDE3Nzc2NzY1OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                  alt="Avatar del Administrador" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 dark:border-slate-700 shadow-sm"
                />
                <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cambiar Foto</span>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  defaultValue="admin@andinoplaza.com"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar Contraseña</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
                  Actualizar Perfil
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Datos del Hotel */}
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
          <div className="border-b border-slate-100 dark:border-slate-700/50 px-6 py-4 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Datos del Hotel</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Razón Social</label>
                <input 
                  type="text" 
                  defaultValue="Andino Plaza Hotel & Suites S.A.C."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">RUC</label>
                <input 
                  type="text" 
                  defaultValue="20123456789"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IGV (%)</label>
                <input 
                  type="number" 
                  defaultValue="18"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Moneda Principal</label>
                <div className="relative">
                  <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 appearance-none pr-10 [&>option]:text-slate-900">
                    <option value="PEN">Soles (PEN)</option>
                    <option value="USD">Dólares (USD)</option>
                    <option value="EUR">Euros (EUR)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 dark:text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="px-5 py-2 bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600 font-medium rounded-lg text-sm transition-colors shadow-sm">
                Guardar Datos
              </button>
            </div>
          </div>
        </section>

        {/* 3. Preferencias del Sistema */}
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
          <div className="border-b border-slate-100 dark:border-slate-700/50 px-6 py-4 flex items-center gap-2">
            <Settings size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Preferencias del Sistema</h2>
          </div>
          
          <div className="p-6 space-y-6">
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-4 items-start">
                <div className="mt-0.5 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Notificaciones por Correo</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recibir alertas diarias sobre nuevas reservas y cancelaciones importantes.</p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button 
                type="button" 
                onClick={() => setEmailNotif(!emailNotif)}
                className={clsx(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                  emailNotif ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-600"
                )}
              >
                <span 
                  className={clsx(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    emailNotif ? "translate-x-5" : "translate-x-0"
                  )} 
                />
              </button>
            </div>
            
            <hr className="border-slate-100 dark:border-slate-700/50" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-4 items-start">
                <div className="mt-0.5 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Copias de Seguridad Automáticas</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Realizar un respaldo de la base de datos de huéspedes y reservas cada 24 horas.</p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button 
                type="button" 
                onClick={() => setAutoBackup(!autoBackup)}
                className={clsx(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                  autoBackup ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-600"
                )}
              >
                <span 
                  className={clsx(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    autoBackup ? "translate-x-5" : "translate-x-0"
                  )} 
                />
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}