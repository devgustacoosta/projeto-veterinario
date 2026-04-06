import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const usePets = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/tutor/pets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Falha ao buscar pets");
      setPets(await response.json());
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const addPet = async (petData) => {
    try {
      const response = await fetch(`${apiUrl}/tutor/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(petData),
      });
      if (!response.ok) throw new Error("Erro");
      await fetchPets();
      addToast("Pet cadastrado!", "success");
      return true;
    } catch {
      addToast("Erro ao cadastrar pet", "error");
      return true;
    }
  };

  const updatePet = async (id, petData) => {
    try {
      const response = await fetch(`${apiUrl}/tutor/pets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(petData),
      });
      if (!response.ok) throw new Error("Erro");
      await fetchPets();
      addToast("Dados do pet atualizados!", "success");
      return true;
    } catch {
      addToast("Erro ao atualizar dados do pet", "error");
      return true;
    }
  };

  const deletePet = async (id) => {
    try {
      await fetch(`${apiUrl}/tutor/pets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPets((p) => p.filter((pet) => pet.id !== id));
      addToast("Pet removido!", "success");
    } catch {
      addToast("Erro ao remover pet", "Error");
    }
  };

  return { pets, loading, addPet, updatePet, deletePet };
};
