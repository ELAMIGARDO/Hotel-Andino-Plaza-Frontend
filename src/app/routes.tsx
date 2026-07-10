import { createBrowserRouter, Navigate } from "react-router";
import { AuthView } from "../features/auth/AuthView";
import { RegisterView } from "../features/auth/RegisterView";
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
import { ClientBookings } from "../features/clients/ClientBookings"; // 🟢 Importado

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthView,
  },
  {
    path: "/login-huesped",
    element: <ClientLoginView />,
  },
  {
    path: "/register",
    element: <RegisterView />,
  },
  {
    path: "/home",
    element: <HotelHomeView />,
  },
  {
    path: "/consulta-cliente",
    element: <ClientBookings />, // 🟢 Ruta integrada para el huésped
  },
  {
    element: <ProtectedRoute />, 
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardView /> },
          { path: "/ui-kit", element: <UIKitView /> },
          { path: "/reports", element: <ReportsView /> },
          { path: "/guests", element: <GuestsView /> },
          { path: "/availability", element: <AvailabilityView /> },
          { path: "/settings", element: <SettingsView /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
