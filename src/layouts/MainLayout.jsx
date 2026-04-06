import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  PawPrint,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const MainLayout = () => {
  const { perfil, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuTutor = [
    { title: "Meus Pets", path: "/tutor/pets", icon: <PawPrint size={20} /> },
    {
      title: "Agendamentos",
      path: "/tutor/agendamentos",
      icon: <Calendar size={20} />,
    },
  ];

  const menuVet = [
    { title: "Agenda", path: "/vet/agenda", icon: <Calendar size={20} /> },
    { title: "Pacientes", path: "/vet/pacientes", icon: <Users size={20} /> },
    {
      title: "Configurações",
      path: "/vet/configuracoes",
      icon: <Settings size={20} />,
    },
  ];

  const menuItems = perfil === "tutor" ? menuTutor : menuVet;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative">
      <header className="lg:hidden bg-surface border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xl">
          <PawPrint size={24} />
          Vet
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-slate-600 hover:text-brand-600 focus:outline-none"
        >
          <Menu size={28} />
        </button>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 shrink-0 bg-surface shadow-2xl lg:shadow-none lg:border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="px-6 py-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-bold text-2xl tracking-tight mb-1">
              <PawPrint size={28} />
              Vet
            </div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              {perfil === "tutor" ? "Área do Tutor" : "Painel Médico"}
            </p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all rounded-xl ${
                location.pathname.startsWith(item.path)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span
                className={
                  location.pathname.startsWith(item.path)
                    ? "text-brand-600"
                    : "text-slate-400"
                }
              >
                {item.icon}
              </span>
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl w-full"
          >
            <LogOut
              size={20}
              className="text-slate-400 group-hover:text-red-500"
            />
            Sair da conta
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen w-full lg:max-w-[calc(100%-18rem)]">
        <div className="flex-1 p-6 md:p-8 lg:p-12 w-full max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
