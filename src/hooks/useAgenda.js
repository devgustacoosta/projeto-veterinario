import { useCallback } from "react";
import { useCollection } from "./useCollection";
import { useToast } from "../context/toast";
import { normalizeDates, requireArray } from "../lib/api";
export function useAgenda(filtro) {
  const {
    items: agenda,
    loading,
    error,
    reload,
    request,
  } = useCollection(`/vet/agenda?filtro=${encodeURIComponent(filtro)}`);
  const patients = useCollection("/vet/todos-pets");
  const petsETutores = patients.items;
  const { addToast } = useToast();
  const fetchMinhaDisponibilidade = useCallback(
    async (data, signal) =>
      requireArray(
        await request(`/vet/disponibilidade?data=${encodeURIComponent(data)}`, {
          signal,
        }),
      ),
    [request],
  );
  const addAgendamentoVet = async (data) => {
    await request("/vet/agendamentos", {
      method: "POST",
      body: normalizeDates(data),
    });
    await reload();
    addToast("Consulta criada!", "success");
    return true;
  };
  const registrarAtendimento = async (id, data) => {
    await request(`/vet/agendamentos/${id}/historico`, {
      method: "POST",
      body: data,
    });
    await reload();
    addToast("Atendimento registrado!", "success");
    return true;
  };
  return {
    agenda,
    loading: loading || patients.loading,
    error: error || patients.error,
    reload: () => Promise.all([reload(), patients.reload()]),
    petsETutores,
    fetchMinhaDisponibilidade,
    addAgendamentoVet,
    registrarAtendimento,
  };
}
