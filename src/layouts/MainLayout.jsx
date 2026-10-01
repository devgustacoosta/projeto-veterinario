import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import {
  PawPrint,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  Wallet,
  X,
} from "lucide-react";

const MainLayout = () => {
  const { perfil, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const listener = (event) => setIsDesktop(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  useEffect(() => {
    if (!isMobileMenuOpen || isDesktop) return;
    const menu = document.getElementById("menu-principal");
    const trigger = document.getElementById("menu-trigger");
    const main = document.getElementById("conteudo");
    main.inert = true;
    menu.querySelector("button, a")?.focus();
    const listener = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
      if (event.key === "Tab") {
        const elements = [...menu.querySelectorAll("button, a")].filter(
          (el) => el.getClientRects().length,
        );
        const first = elements[0],
          last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      main.inert = false;
      document.removeEventListener("keydown", listener);
      trigger?.focus();
    };
  }, [isMobileMenuOpen, isDesktop]);

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
    { title: "Finanças", path: "/vet/financas", icon: <Wallet size={20} /> },
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
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo
      </a>
      <header className="lg:hidden bg-surface border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xl">
          <PawPrint size={24} />
          Vet
        </div>
        <button
          id="menu-trigger"
          aria-label="Abrir menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="menu-principal"
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
        id="menu-principal"
        inert={!isDesktop && !isMobileMenuOpen}
        aria-hidden={!isDesktop && !isMobileMenuOpen}
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
            aria-label="Fechar menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-600 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              aria-current={
                location.pathname.startsWith(item.path) ? "page" : undefined
              }
              key={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
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
                    : "text-slate-600"
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
              className="text-slate-600 group-hover:text-red-700"
            />
            Sair da conta
          </button>
        </div>
      </aside>

      <main
        id="conteudo"
        tabIndex={-1}
        className="flex-1 flex flex-col min-h-screen w-full lg:max-w-[calc(100%-18rem)]"
      >
        <div className="flex-1 p-6 md:p-8 lg:p-12 w-full max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
