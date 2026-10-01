import { useState } from "react";
import { useCollection } from "./useCollection";
import { useToast } from "../context/toast";
export function usePets() {
  const {
    items: pets,
    setItems,
    loading,
    error,
    reload,
    request,
  } = useCollection("/tutor/pets");
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const mutate = async (path, method, body, message, id) => {
    setSaving(true);
    setMutationError("");
    try {
      await request(path, { method, body });
      if (method === "DELETE")
        setItems((prev) => prev.filter((pet) => pet.id !== id));
      else await reload();
      addToast(message, "success");
      return true;
    } catch (err) {
      setMutationError(err.message);
      addToast(err.message, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };
  return {
    pets,
    loading,
    error,
    saving,
    mutationError,
    clearMutationError: () => setMutationError(""),
    reload,
    addPet: (data) => mutate("/tutor/pets", "POST", data, "Pet cadastrado!"),
    updatePet: (id, data) =>
      mutate(`/tutor/pets/${id}`, "PUT", data, "Dados do pet atualizados!"),
    deletePet: (id) =>
      mutate(`/tutor/pets/${id}`, "DELETE", undefined, "Pet removido!", id),
  };
}
