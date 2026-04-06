import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const sanitizePayloadDate = (data) => {
  if (!data) return data;
  const payload = { ...data };

  if (payload.data_hora) {
    payload.data_hora = payload.data_hora.replace("T", " ");
    if (payload.data_hora.length === 16) {
      payload.data_hora += ":00";
    }
  }

  return payload;
};

export const useAgenda = (filtroAtivo) => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [agenda, setAgenda] = useState([]);
  const [petsETutores, setPetsETutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/vet/agenda?filtro=${filtroAtivo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Erro na requisição da agenda");
      setAgenda(await response.json());
    } catch {
      addToast("Erro ao carregar a agenda", "error");
    } finally {
      setLoading(false);
    }
  }, [token, filtroAtivo, apiUrl, addToast]);

  const fetchPetsTutores = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/vet/todos-pets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setPetsETutores(await response.json());
      }
    } catch {
      console.error("Erro ao carregar lista de pets");
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchAgenda();
    fetchPetsTutores();
  }, [fetchAgenda, fetchPetsTutores]);

  const fetchMinhaDisponibilidade = useCallback(
    async (data) => {
      try {
        const response = await fetch(
          `${apiUrl}/vet/disponibilidade?data=${data}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) return [];
        return await response.json();
      } catch {
        return [];
      }
    },
    [apiUrl, token]
  );

  const addAgendamentoVet = async (data) => {
    const payload = sanitizePayloadDate(data);

    const response = await fetch(`${apiUrl}/vet/agendamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 409) throw new Error("Horário já ocupado");
    if (!response.ok) throw new Error("Erro ao salvar consulta");

    await fetchAgenda();
    addToast("Consulta criada com sucesso!", "success");
    return true;
  };

  const registrarAtendimento = async (id, dados) => {
    const response = await fetch(`${apiUrl}/vet/agendamentos/${id}/historico`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) throw new Error("Erro ao registrar atendimento");

    await fetchAgenda();
    addToast("Histórico registrado!", "success");
    return true;
  };

  return {
    agenda,
    loading,
    petsETutores,
    fetchMinhaDisponibilidade,
    addAgendamentoVet,
    registrarAtendimento,
  };
};
