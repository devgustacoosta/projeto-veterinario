import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const usePacientes = () => {
  const { token } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch(`${apiUrl}/vet/pacientes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erro ao buscar pacientes");
        setPacientes(await response.json());
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, [token, apiUrl]);

  const carregarHistorico = async (petId) => {
    const response = await fetch(`${apiUrl}/vet/pacientes/${petId}/historico`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Erro ao buscar histórico");
    return await response.json();
  };

  return { pacientes, loading, carregarHistorico };
};
