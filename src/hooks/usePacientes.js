import { useCallback } from "react";
import { useCollection } from "./useCollection";
import { requireArray } from "../lib/api";
export function usePacientes() {
  const {
    items: pacientes,
    loading,
    error,
    reload,
    request,
  } = useCollection("/vet/pacientes");
  const carregarHistorico = useCallback(
    async (id, options) =>
      requireArray(await request(`/vet/pacientes/${id}/historico`, options)),
    [request],
  );
  return { pacientes, loading, error, reload, carregarHistorico };
}
