import { Navigate, Outlet } from 'react-router';

interface ProtectedRouteProps {
  rolesPermitidos?: string[];
}

export const ProtectedRoute = ({ rolesPermitidos = undefined }: ProtectedRouteProps) => {
  // 🟢 CORRECCIÓN 1: Leemos exactamente las mismas llaves que guarda tu AuthView.tsx
  const userRole = localStorage.getItem("user_role"); // Coincide con localStorage.setItem("user_role", "ADMIN")
  const isAuthenticated = !!localStorage.getItem("auth_token"); // Coincide con localStorage.setItem("auth_token", tokenPlano)

  // CASO 1: Si no está logueado, va directo al Login principal
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // CASO 2: Si la ruta pide roles específicos y el usuario no lo tiene
  if (rolesPermitidos && !rolesPermitidos.includes(userRole || "")) {
    // Si un cliente intenta entrar a una URL de Admin, lo mandamos a su zona
    if (userRole === "CLIENTE") {
      return <Navigate to="/clientes" replace />;
    }
    // Si cualquier otro rol intenta entrar a zona no permitida, va al Dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // CASO 3: Si todo está en orden, renderiza las pantallas hijas (Dashboard, Timeline, etc.)
  return <Outlet />;
};
