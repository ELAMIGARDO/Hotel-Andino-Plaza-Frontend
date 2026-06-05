import { createBrowserRouter } from "react-router";
import { AuthView } from "../features/auth/AuthView";
import { DashboardView } from "../features/dashboard/DashboardView";
import { UIKitView } from "../features/uikit/UIKitView";
import { ReportsView } from "../features/reports/ReportsView";
import { GuestsView } from "../features/guests/GuestsView";
import { AvailabilityView } from "../features/availability/AvailabilityView";
import { SettingsView } from "../features/settings/SettingsView";
import { AppLayout } from "./components/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthView,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        Component: DashboardView,
      },
      {
        path: "/ui-kit",
        Component: UIKitView,
      },
      {
        path: "/reports",
        Component: ReportsView,
      },
      {
        path: "/guests",
        Component: GuestsView,
      },
      {
        path: "/availability",
        Component: AvailabilityView,
      },
      {
        path: "/settings",
        Component: SettingsView,
      }
    ]
  }
]);
