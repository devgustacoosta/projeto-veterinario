import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Loading from "../components/Loading";
import { PawPrint } from "lucide-react";

const Auth = () => {
  const { login, isAuthenticated, perfil } = useAuth();
  const { addToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "tutor",
    telefone: "",
  });

  if (isAuthenticated) {
    return <Navigate to={perfil === "tutor" ? "/tutor" : "/vet"} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      nome: "",
      email: "",
      senha: "",
      perfil: "tutor",
      telefone: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL;
    const endpoint = isLogin ? "/auth/login" : "/auth/cadastro";
    const payload = isLogin
      ? { email: formData.email, senha: formData.senha }
      : formData;

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Ocorreu um erro na requisição.");
      }

      if (isLogin) {
        addToast("Login realizado com sucesso!", "success");
        login(data.access_token, data.perfil);
      } else {
        addToast(
          "Conta criada com sucesso! Faça login para continuar.",
          "success"
        );
        setIsLogin(true);
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockLogin = (perfilMock) => {
    addToast(
      `Login simulado como ${perfilMock === "tutor" ? "Tutor" : "Veterinário"}`,
      "success"
    );
    login("token-simulado-desenvolvimento", perfilMock);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-8">
      {isLoading && <Loading fullScreen text="Processando..." />}

      <div className="w-full max-w-md bg-surface shadow-xl rounded-2xl border border-slate-100 p-8 sm:p-10 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-50 text-brand-600 p-3 rounded-full">
            <PawPrint size={32} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isLogin ? "Bem-vindo ao Vet" : "Crie sua conta"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isLogin ? "Não tem uma conta?" : "Já possui cadastro?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-1.5 text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              {isLogin ? "Cadastre-se" : "Entrar"}
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="nome"
                className="text-slate-700 font-medium text-sm"
              >
                Nome completo*
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all bg-white text-slate-900 w-full"
                required={!isLogin}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-slate-700 font-medium text-sm"
            >
              E-mail*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all bg-white text-slate-900 w-full"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="senha"
              className="text-slate-700 font-medium text-sm"
            >
              Senha*
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all bg-white text-slate-900 w-full"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="telefone"
                  className="text-slate-700 font-medium text-sm"
                >
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all bg-white text-slate-900 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="perfil"
                  className="text-slate-700 font-medium text-sm"
                >
                  Perfil de acesso
                </label>
                <select
                  id="perfil"
                  name="perfil"
                  value={formData.perfil}
                  onChange={handleChange}
                  className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all bg-white text-slate-900 w-full"
                  required={!isLogin}
                >
                  <option value="tutor">Tutor de Pet</option>
                  <option value="veterinario">Médico Veterinário</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 bg-brand-600 text-white py-3 px-4 rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-100 disabled:opacity-70 transition-all font-semibold shadow-sm w-full"
          >
            {isLogin ? "Entrar" : "Finalizar cadastro"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 hidden">
          <p className="text-xs text-slate-400 font-semibold text-center uppercase tracking-wider mb-4">
            Acesso Rápido para Testes
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleMockLogin("tutor")}
              className="flex-1 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Entrar como Tutor
            </button>
            <button
              type="button"
              onClick={() => handleMockLogin("veterinario")}
              className="flex-1 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Entrar como Vet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
