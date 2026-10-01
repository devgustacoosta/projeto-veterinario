import { useState } from "react";
import { useCollection } from "./useCollection";
import { useToast } from "../context/toast";
export function useConfiguracoes() {
  const horarios = useCollection("/vet/horarios");
  const bloqueios = useCollection("/vet/bloqueios");
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const mutate = async (path, method, body, collection) => {
    setSaving(true);
    try {
      await horarios.request(path, { method, body });
      await collection.reload();
      addToast("Configuração atualizada!", "success");
      return true;
    } catch (err) {
      addToast(err.message, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };
  return {
    horarios: horarios.items,
    bloqueios: bloqueios.items,
    loading: horarios.loading || bloqueios.loading,
    error: horarios.error || bloqueios.error,
    saving,
    reload: () => Promise.all([horarios.reload(), bloqueios.reload()]),
    addHorario: (data) => mutate("/vet/horarios", "POST", data, horarios),
    removeHorario: (id) =>
      mutate(`/vet/horarios/${id}`, "DELETE", undefined, horarios),
    addBloqueio: (data) => mutate("/vet/bloqueios", "POST", data, bloqueios),
    removeBloqueio: (id) =>
      mutate(`/vet/bloqueios/${id}`, "DELETE", undefined, bloqueios),
  };
}
