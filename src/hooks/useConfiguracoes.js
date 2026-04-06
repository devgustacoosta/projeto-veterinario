import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const useConfiguracoes = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [horarios, setHorarios] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resH, resB] = await Promise.all([
        fetch(`${apiUrl}/vet/horarios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/vet/bloqueios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!resH.ok || !resB.ok) {
        throw new Error("Erro de requisição aos dados de configuração.");
      }

      setHorarios(await resH.json());
      setBloqueios(await resB.json());
    } catch (error) {
      addToast("Erro ao carregar configurações", "error");
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addHorario = async (data) => {
    try {
      const response = await fetch(`${apiUrl}/vet/horarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro na inserção de horário.");
      }

      await fetchData();
      addToast("Horário padrão adicionado!", "success");
    } catch (error) {
      addToast("Erro ao adicionar horário", "error");
    }
  };

  const removeHorario = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/vet/horarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erro ao remover horário.");
      }

      setHorarios((prev) => prev.filter((h) => h.id !== id));
      addToast("Horário removido!", "success");
    } catch (error) {
      addToast("Erro ao remover horário", "error");
    }
  };

  const addBloqueio = async (data) => {
    try {
      const response = await fetch(`${apiUrl}/vet/bloqueios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro na inserção de bloqueio.");
      }

      await fetchData();
      addToast("Agenda bloqueada com sucesso!", "success");
    } catch (error) {
      addToast("Erro ao processar criação de bloqueio.", "error");
    }
  };

  const removeBloqueio = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/vet/bloqueios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erro ao remover bloqueio.");
      }

      setBloqueios((prev) => prev.filter((b) => b.id !== id));
      addToast("Bloqueio removido!", "success");
    } catch (error) {
      addToast("Erro ao remover bloqueio", "error");
    }
  };

  return {
    horarios,
    bloqueios,
    loading,
    addHorario,
    removeHorario,
    addBloqueio,
    removeBloqueio,
  };
};
