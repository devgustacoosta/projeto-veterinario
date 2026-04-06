import React, { createContext, useState, useMemo, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token")
  );
  const [perfil, setPerfil] = useState(() =>
    localStorage.getItem("user_perfil")
  );

  const login = (newToken, newPerfil) => {
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user_perfil", newPerfil);
    setToken(newToken);
    setPerfil(newPerfil);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_perfil");
    setToken(null);
    setPerfil(null);
  };

  const contextValue = useMemo(
    () => ({
      token,
      perfil,
      login,
      logout,
      isAuthenticated: !!token,
    }),
    [token, perfil]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
