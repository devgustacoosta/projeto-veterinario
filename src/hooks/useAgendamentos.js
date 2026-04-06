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

  if (payload.nova_data_hora) {
    payload.nova_data_hora = payload.nova_data_hora.replace("T", " ");
    if (payload.nova_data_hora.length === 16) {
      payload.nova_data_hora += ":00";
    }
  }

  return payload;
};

export const useAgendamentos = (filtro = "todos") => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [agendamentos, setAgendamentos] = useState([]);
  const [pets, setPets] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [agRes, petsRes, vetRes] = await Promise.all([
        fetch(`${apiUrl}/tutor/agendamentos?filtro=${filtro}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/tutor/pets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/veterinarios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!agRes.ok || !petsRes.ok || !vetRes.ok) {
        throw new Error("Erro ao buscar os dados da API");
      }

      setAgendamentos(await agRes.json());
      setPets(await petsRes.json());
      setVeterinarios(await vetRes.json());
    } catch {
      addToast("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl, filtro, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchHorariosDisponiveis = useCallback(
    async (vetId, data) => {
      try {
        const response = await fetch(
          `${apiUrl}/veterinarios/${vetId}/disponibilidade?data=${data}`,
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

  const addAgendamento = async (data) => {
    const payload = sanitizePayloadDate(data);

    const response = await fetch(`${apiUrl}/tutor/agendamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 409) throw new Error("Horário já ocupado");
    if (!response.ok) throw new Error("Erro ao agendar");

    await fetchData();
    addToast("Consulta agendada!", "success");
    return true;
  };

  const cancelAgendamento = async (id) => {
    try {
      const response = await fetch(
        `${apiUrl}/tutor/agendamentos/${id}/cancelar`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Erro de resposta da API");
      }

      setAgendamentos((prev) =>
        prev.map((ag) => (ag.id === id ? { ...ag, status: "cancelado" } : ag))
      );
      addToast("Agendamento cancelado!", "success");
    } catch {
      addToast("Erro ao cancelar o agendamento!", "error");
    }
  };

  return {
    agendamentos,
    pets,
    veterinarios,
    loading,
    addAgendamento,
    cancelAgendamento,
    fetchHorariosDisponiveis,
  };
};
