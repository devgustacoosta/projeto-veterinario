import { useCallback } from "react";
import { useCollection } from "./useCollection";
import { useToast } from "../context/toast";
import { normalizeDates, requireArray } from "../lib/api";
export function useAgendamentos(filtro = "todos") {
  const appointments = useCollection(
    `/tutor/agendamentos?filtro=${encodeURIComponent(filtro)}`,
  );
  const pets = useCollection("/tutor/pets");
  const vets = useCollection("/veterinarios");
  const { request, reload } = appointments;
  const { addToast } = useToast();
  const fetchHorariosDisponiveis = useCallback(
    async (id, data, signal) =>
      requireArray(
        await request(
          `/veterinarios/${id}/disponibilidade?data=${encodeURIComponent(data)}`,
          { signal },
        ),
      ),
    [request],
  );
  const mutate = async (path, method, body, message) => {
    await request(path, {
      method,
      body: body ? normalizeDates(body) : undefined,
    });
    await reload();
    addToast(message, "success");
    return true;
  };
  return {
    agendamentos: appointments.items,
    pets: pets.items,
    veterinarios: vets.items,
    loading: appointments.loading || pets.loading || vets.loading,
    error: appointments.error || pets.error || vets.error,
    reload: () => Promise.all([reload(), pets.reload(), vets.reload()]),
    fetchHorariosDisponiveis,
    addAgendamento: (data) =>
      mutate("/tutor/agendamentos", "POST", data, "Consulta agendada!"),
    cancelAgendamento: (id) =>
      mutate(
        `/tutor/agendamentos/${id}/cancelar`,
        "PUT",
        undefined,
        "Consulta cancelada!",
      ),
    remarcarAgendamento: (id, data) =>
      mutate(
        `/tutor/agendamentos/${id}/remarcar`,
        "PUT",
        { nova_data_hora: data },
        "Consulta remarcada!",
      ),
  };
}
