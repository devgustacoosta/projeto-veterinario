import React, { useState, useEffect } from "react";
import { useAgendamentos } from "../../hooks/useAgendamentos";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  X,
  RefreshCw,
  User,
} from "lucide-react";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";

const Agendamentos = () => {
  const {
    agendamentos,
    pets,
    veterinarios,
    loading,
    addAgendamento,
    cancelAgendamento,
    fetchHorariosDisponiveis,
  } = useAgendamentos();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDestructive: false,
    action: null,
  });

  const [formData, setFormData] = useState({
    veterinario_id: "",
    pet_id: "",
    data: "",
    hora: "",
    motivo_consulta: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.veterinario_id && formData.data) {
        setLoadingSlots(true);
        const slots = await fetchHorariosDisponiveis(
          formData.veterinario_id,
          formData.data
        );
        setAvailableSlots(slots);
        setFormData((prev) => ({ ...prev, hora: "" }));
        setLoadingSlots(false);
      } else {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [formData.veterinario_id, formData.data, fetchHorariosDisponiveis]);

  const handleRescheduleDateChange = async (vetId, newDate) => {
    setRescheduleDate(newDate);
    setRescheduleTime("");
    if (newDate) {
      setLoadingRescheduleSlots(true);
      const slots = await fetchHorariosDisponiveis(vetId, newDate);
      setRescheduleSlots(slots);
      setLoadingRescheduleSlots(false);
    } else {
      setRescheduleSlots([]);
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!formData.data || !formData.hora) return;

    setConfirmDialog({
      isOpen: true,
      title: "Confirmar Agendamento",
      message: `Deseja agendar a consulta para o dia ${formData.data
        .split("-")
        .reverse()
        .join("/")} às ${formData.hora}?`,
      isDestructive: false,
      action: async () => {
        const success = await addAgendamento({
          veterinario_id: parseInt(formData.veterinario_id, 10),
          pet_id: parseInt(formData.pet_id, 10),
          data_hora: `${formData.data} ${formData.hora}`,
          motivo_consulta: formData.motivo_consulta,
        });

        if (success) {
          setIsFormOpen(false);
          setFormData({
            veterinario_id: "",
            pet_id: "",
            data: "",
            hora: "",
            motivo_consulta: "",
          });
        }
      },
    });
  };

  const handleRequestCancel = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Cancelar Agendamento",
      message:
        "Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.",
      isDestructive: true,
      action: () => cancelAgendamento(id),
    });
  };

  const handleRequestReschedule = (ag_id, vet_id) => {
    if (!rescheduleDate || !rescheduleTime) return;

    setConfirmDialog({
      isOpen: true,
      title: "Confirmar Remarcação",
      message: `Deseja remarcar a consulta para o dia ${rescheduleDate
        .split("-")
        .reverse()
        .join("/")} às ${rescheduleTime}?`,
      isDestructive: false,
      action: async () => {
        const token = localStorage.getItem("access_token");
        const apiUrl = import.meta.env.VITE_API_URL;

        await fetch(`${apiUrl}/tutor/agendamentos/${ag_id}/remarcar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nova_data_hora: `${rescheduleDate} ${rescheduleTime}:00`,
          }),
        });
        window.location.reload();
      },
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { data: "", hora: "" };
    const [datePart, timePart] = dateString.split(/[T ]/);
    const parts = datePart?.split("-") || [];
    return {
      data: parts.length === 3 ? `${parts[2]}/${parts[1]}` : datePart,
      hora: timePart ? timePart.substring(0, 5) : "00:00",
    };
  };

  if (loading) return <Loading text="Carregando consultas..." />;

  return (
    <div className="w-full flex flex-col items-start animate-in fade-in duration-300">
      <div className="w-full max-w-4xl flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Consultas
          </h1>
          <p className="text-slate-500 text-sm">
            Acompanhe seus agendamentos veterinários.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-brand-600 text-white py-2.5 px-5 rounded-xl hover:bg-brand-700 transition-all font-semibold shadow-sm"
        >
          <Plus size={18} /> Nova Consulta
        </button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Agendar Consulta"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleRequestSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 font-medium text-sm">
                Qual pet?
              </label>
              <select
                value={formData.pet_id}
                onChange={(e) =>
                  setFormData({ ...formData, pet_id: e.target.value })
                }
                className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 bg-white"
                required
              >
                <option value="" disabled>
                  Selecione
                </option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 font-medium text-sm">
                Veterinário
              </label>
              <select
                value={formData.veterinario_id}
                onChange={(e) =>
                  setFormData({ ...formData, veterinario_id: e.target.value })
                }
                className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 bg-white"
                required
              >
                <option value="" disabled>
                  Selecione
                </option>
                {veterinarios.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 font-medium text-sm">Data</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
                className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 bg-white"
                required
              />
            </div>
          </div>

          {formData.veterinario_id && formData.data && (
            <div className="flex flex-col gap-2 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-slate-700 font-medium text-sm mb-1">
                Horários Disponíveis
              </label>
              {loadingSlots ? (
                <p className="text-sm text-slate-500 font-medium">
                  Buscando horários...
                </p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-red-500 font-medium">
                  Nenhum horário disponível para o dia selecionado.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, hora: slot })}
                      className={`py-2 px-1 rounded-lg border text-sm font-semibold transition-all ${
                        formData.hora === slot
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-300 hover:border-brand-400"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 font-medium text-sm">
              Motivo da consulta
            </label>
            <textarea
              value={formData.motivo_consulta}
              onChange={(e) =>
                setFormData({ ...formData, motivo_consulta: e.target.value })
              }
              rows="2"
              className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 bg-white resize-none"
              placeholder="O que está acontecendo com o pet?"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.data || !formData.hora}
              className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </Modal>

      <div className="w-full max-w-4xl flex flex-col gap-4">
        {agendamentos.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed py-16 flex flex-col items-center justify-center rounded-2xl text-slate-500">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <CalendarIcon size={32} className="text-slate-400" />
            </div>
            <p className="font-medium">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          agendamentos.map((ag) => {
            const { data, hora } = formatDateTime(ag.data_hora);
            const isCancelado = ag.status === "cancelado";
            const isAgendado = ["pendente", "confirmado", "remarcado"].includes(
              ag.status
            );

            return (
              <div
                key={ag.id}
                className={`bg-white border ${
                  isCancelado
                    ? "border-slate-100 opacity-70"
                    : "border-slate-200 shadow-sm hover:shadow-md"
                } p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-6 transition-all`}
              >
                <div className="flex gap-5 md:gap-8 items-center">
                  <div
                    className={`flex flex-col items-center justify-center py-3 px-5 rounded-xl min-w-[100px] ${
                      isCancelado ? "bg-slate-50" : "bg-brand-50"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                        isCancelado ? "text-slate-400" : "text-brand-600"
                      }`}
                    >
                      {data}
                    </span>
                    <span
                      className={`text-xl font-bold flex items-center gap-1.5 ${
                        isCancelado ? "text-slate-500" : "text-slate-900"
                      }`}
                    >
                      <Clock
                        size={18}
                        className={
                          isCancelado ? "text-slate-400" : "text-brand-500"
                        }
                      />
                      {hora}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {ag.pet_nome}
                      </h3>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                          isCancelado
                            ? "bg-red-50 text-red-600"
                            : isAgendado
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {ag.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <User size={14} className="text-slate-400" />{" "}
                      {ag.veterinario_nome}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {ag.motivo_consulta || "Consulta geral"}
                    </p>
                  </div>
                </div>

                {isAgendado && rescheduleId !== ag.id && (
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => {
                        setRescheduleId(ag.id);
                        setRescheduleDate("");
                        setRescheduleTime("");
                        setRescheduleSlots([]);
                      }}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <RefreshCw size={16} /> Remarcar
                    </button>
                    <button
                      onClick={() => handleRequestCancel(ag.id)}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <X size={16} /> Cancelar
                    </button>
                  </div>
                )}

                {rescheduleId === ag.id && (
                  <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider md:hidden mb-1">
                      Escolha um novo horário
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={rescheduleDate}
                        onChange={(e) =>
                          handleRescheduleDateChange(
                            ag.veterinario_id,
                            e.target.value
                          )
                        }
                        className="border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-500 bg-white min-w-[140px]"
                      />

                      {loadingRescheduleSlots ? (
                        <div className="py-2 px-3 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg">
                          Carregando...
                        </div>
                      ) : (
                        <select
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          disabled={rescheduleSlots.length === 0}
                          className="border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-500 bg-white min-w-[140px] disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">
                            {rescheduleDate && rescheduleSlots.length === 0
                              ? "Sem horários"
                              : "Selecione a hora"}
                          </option>
                          {rescheduleSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="flex gap-2 w-full mt-1">
                      <button
                        onClick={() =>
                          handleRequestReschedule(ag.id, ag.veterinario_id)
                        }
                        disabled={!rescheduleDate || !rescheduleTime}
                        className="flex-1 bg-brand-600 text-white py-2.5 px-4 text-sm rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setRescheduleId(null);
                          setRescheduleDate("");
                          setRescheduleTime("");
                        }}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 py-2.5 px-4 text-sm rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};

export default Agendamentos;
