import React, { useState, useMemo, useEffect, useCallback } from "react";

import { AuthContext } from "./auth";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token"),
  );
  const [perfil, setPerfil] = useState(() =>
    localStorage.getItem("user_perfil"),
  );

  const login = useCallback((newToken, newPerfil) => {
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user_perfil", newPerfil);
    setToken(newToken);
    setPerfil(newPerfil);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_perfil");
    setToken(null);
    setPerfil(null);
  }, []);

  useEffect(() => {
    window.addEventListener("session-expired", logout);
    return () => window.removeEventListener("session-expired", logout);
  }, [logout]);

  const contextValue = useMemo(
    () => ({
      token,
      perfil,
      login,
      logout,
      isAuthenticated: !!token,
    }),
    [token, perfil, login, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
