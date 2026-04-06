import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import Pets from "./pages/tutor/Pets";
import Agendamentos from "./pages/tutor/Agendamentos";

import Agenda from "./pages/vet/Agenda";
import Pacientes from "./pages/vet/Pacientes";
import Configuracoes from "./pages/vet/Configuracoes";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />

            <Route element={<ProtectedRoute perfisPermitidos={["tutor"]} />}>
              <Route element={<MainLayout />}>
                <Route path="/tutor/pets" element={<Pets />} />
                <Route path="/tutor/agendamentos" element={<Agendamentos />} />
                <Route
                  path="/tutor"
                  element={<Navigate to="/tutor/pets" replace />}
                />
              </Route>
            </Route>

            <Route
              element={<ProtectedRoute perfisPermitidos={["veterinario"]} />}
            >
              <Route element={<MainLayout />}>
                <Route path="/vet/agenda" element={<Agenda />} />
                <Route path="/vet/pacientes" element={<Pacientes />} />
                <Route path="/vet/configuracoes" element={<Configuracoes />} />
                <Route
                  path="/vet"
                  element={<Navigate to="/vet/agenda" replace />}
                />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
