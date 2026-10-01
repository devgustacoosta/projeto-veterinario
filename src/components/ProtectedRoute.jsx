import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth";

const ProtectedRoute = ({ children, perfisPermitidos }) => {
  const { isAuthenticated, perfil } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (perfisPermitidos && !perfisPermitidos.includes(perfil)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
