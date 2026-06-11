import { createBrowserRouter, Navigate } from "react-router";
import { AuthView } from "../features/auth/AuthView";
import { RegisterView } from "../features/auth/RegisterView"; // Tu nueva vista
import { DashboardView } from "../features/dashboard/DashboardView";
import { UIKitView } from "../features/uikit/UIKitView";
import { ReportsView } from "../features/reports/ReportsView";
import { GuestsView } from "../features/guests/GuestsView";
import { AvailabilityView } from "../features/availability/AvailabilityView";
import { SettingsView } from "../features/settings/SettingsView";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { ClientLoginView } from "../features/auth/ClientLoginView";
import { HotelHomeView } from "../features/clients/HotelHomeView";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthView, // 🌐 Vista Pública 1: Login (Limpia)
  },
   {
    path: "/login-huesped",
    element: <ClientLoginView />, // 🟢 Nueva ruta del Login para Huéspedes
  },
  {
    path: "/register",
    element: <RegisterView />, // 🌐 Vista Pública 2: Registro (¡Mover aquí afuera para limpiar el menú!)
  },
  {
    path: "/home",
    element: <HotelHomeView />, // 🏢 El Gantt público del cliente con la landing page
  },
  {
    // 🔒 Filtro Guardián: Protege todo el panel de administración
    element: <ProtectedRoute />, 
    children: [
      {
        element: <AppLayout />, // 🏢 Aquí adentro SÍ va el menú lateral de administración
        children: [
          {
            path: "/dashboard",
            element: <DashboardView />,
          },
          {
            path: "/ui-kit",
            element: <UIKitView />,
          },
          {
            path: "/reports",
            element: <ReportsView />,
          },
          {
            path: "/guests",
            element: <GuestsView />,
          },
          {
            path: "/availability",
            element: <AvailabilityView />,
          },
          {
            path: "/settings",
            element: <SettingsView />, 
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
