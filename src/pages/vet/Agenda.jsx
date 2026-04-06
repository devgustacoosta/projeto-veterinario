import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAgenda } from "../../hooks/useAgenda";
import {
  Calendar,
  User,
  Phone,
  CheckCircle,
  FileText,
  PawPrint,
  Plus,
} from "lucide-react";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";

const Agenda = () => {
  const navigate = useNavigate();
  const [filtroAtivo, setFiltroAtivo] = useState("atuais");
  const {
    agenda,
    loading,
    petsETutores,
    fetchMinhaDisponibilidade,
    addAgendamentoVet,
    registrarAtendimento,
  } = useAgenda(filtroAtivo);

  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [formRegistro, setFormRegistro] = useState({
    diagnostico: "",
    prescricao: "",
    observacoes: "",
    peso_kg: "",
  });

  const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false);
  const [formNovo, setFormNovo] = useState({
    pet_tutor: "",
    data: "",
    hora: "",
    motivo_consulta: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  useEffect(() => {
    const getSlots = async () => {
      if (formNovo.data) {
        setLoadingSlots(true);
        const slots = await fetchMinhaDisponibilidade(formNovo.data);
        setAvailableSlots(slots);
        setFormNovo((prev) => ({ ...prev, hora: "" }));
        setLoadingSlots(false);
      } else {
        setAvailableSlots([]);
      }
    };
    getSlots();
  }, [formNovo.data, fetchMinhaDisponibilidade]);

  const formatarDataHora = (dataString) => {
    if (!dataString) return "";
    const partes = dataString.split(/[T ]/);
    const dataPartes = partes[0].split("-");
    const dataFormatada =
      dataPartes.length === 3
        ? `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`
        : partes[0];
    const horaFormatada = partes[1] ? partes[1].substring(0, 5) : "00:00";

    return `${dataFormatada} - ${horaFormatada}`;
  };

  const abrirModal = (ag) => {
    setAgendamentoSelecionado(ag);
    setFormRegistro({
      diagnostico: "",
      prescricao: "",
      observacoes: "",
      peso_kg: "",
    });
    setModalAberto(true);
  };

  const handleSubmitRegistro = async (e) => {
    e.preventDefault();
    const dadosTratados = {
      ...formRegistro,
      peso_kg: formRegistro.peso_kg
        ? parseFloat(formRegistro.peso_kg)
        : undefined,
    };
    if (await registrarAtendimento(agendamentoSelecionado.id, dadosTratados)) {
      setModalAberto(false);
    }
  };

  const handleRequestNovoAgendamento = (e) => {
    e.preventDefault();
    setConfirmDialog({
      isOpen: true,
      title: "Confirmar Agendamento",
      message: `Deseja agendar esta consulta para o dia ${formNovo.data
        .split("-")
        .reverse()
        .join("/")} às ${formNovo.hora}?`,
      action: async () => {
        const [tutor_id, pet_id] = formNovo.pet_tutor.split("|");
        const success = await addAgendamentoVet({
          tutor_id: parseInt(tutor_id, 10),
          pet_id: parseInt(pet_id, 10),
          data_hora: `${formNovo.data} ${formNovo.hora}`,
          motivo_consulta: formNovo.motivo_consulta,
        });

        if (success) {
          setModalNovoAgendamento(false);
          setFormNovo({
            pet_tutor: "",
            data: "",
            hora: "",
            motivo_consulta: "",
          });
        }
      },
    });
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Agenda
          </h1>
          <p className="text-slate-500 text-sm">
            Acompanhe os horários e pacientes agendados.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button
            onClick={() => setModalNovoAgendamento(true)}
            className="flex justify-center items-center gap-2 bg-brand-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Novo Agendamento
          </button>
          <div className="flex p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
            {["passados", "atuais", "futuras"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroAtivo(tipo)}
                className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  filtroAtivo === tipo
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full relative">
        <div className="absolute left-[159px] top-6 bottom-6 w-px bg-slate-200 hidden md:block z-0"></div>

        {loading ? (
          <Loading text="Atualizando horários..." />
        ) : agenda.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed py-16 flex flex-col items-center justify-center rounded-2xl text-slate-500">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <p className="font-medium">Nenhuma consulta agendada.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {agenda.map((ag) => {
              const isConcluido = ag.status === "concluido";
              return (
                <div
                  key={ag.id}
                  className="flex flex-col md:flex-row gap-4 md:gap-6 items-start relative z-10"
                >
                  <div className="flex items-center md:w-[160px] shrink-0 md:justify-end md:mt-5 mb-1 md:mb-0 relative">
                    <span
                      className={`text-lg md:text-base font-bold tracking-tight md:pr-6 ${
                        isConcluido ? "text-slate-400" : "text-slate-900"
                      }`}
                    >
                      {formatarDataHora(ag.data_hora)}
                    </span>
                    <div
                      className={`hidden md:block w-3.5 h-3.5 rounded-full border-2 bg-white ${
                        isConcluido ? "border-slate-300" : "border-brand-500"
                      } absolute right-[-7px]`}
                    ></div>
                  </div>

                  <div
                    className={`flex-1 w-full border ${
                      isConcluido
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-100 bg-white shadow-sm hover:shadow-md"
                    } p-5 sm:p-6 rounded-2xl transition-all`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isConcluido
                                ? "bg-slate-100 text-slate-400"
                                : "bg-brand-50 text-brand-600"
                            }`}
                          >
                            <PawPrint size={18} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 leading-none">
                            {ag.pet_nome}
                          </h3>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md ml-2">
                            {ag.especie}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-3 font-medium">
                          {ag.motivo_consulta || "Consulta geral"}
                        </p>
                      </div>
                      {isConcluido && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-100">
                          <CheckCircle size={14} /> Concluído
                        </span>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-4 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User size={16} className="text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {ag.tutor_nome}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Phone size={16} className="text-slate-400" />
                          {ag.tutor?.telefone || "Não informado"}
                        </div>
                      </div>
                      <div className="flex items-end">
                        {!isConcluido ? (
                          <button
                            onClick={() => abrirModal(ag)}
                            className="flex items-center gap-2 bg-brand-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm transition-colors w-full sm:w-auto justify-center"
                          >
                            <FileText size={16} /> Registrar Atendimento
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              navigate("/vet/pacientes", {
                                state: { petNome: ag.pet_nome },
                              })
                            }
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center"
                          >
                            Ver Histórico
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalNovoAgendamento}
        onClose={() => setModalNovoAgendamento(false)}
        title="Novo Agendamento"
        maxWidth="max-w-lg"
      >
        <form
          onSubmit={handleRequestNovoAgendamento}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">
              Paciente (Tutor - Pet)
            </label>
            <select
              value={formNovo.pet_tutor}
              onChange={(e) =>
                setFormNovo({ ...formNovo, pet_tutor: e.target.value })
              }
              className="border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 w-full"
              required
            >
              <option value="" disabled>
                Selecione um paciente
              </option>
              {petsETutores.map((p) => (
                <option
                  key={`${p.tutor_id}-${p.pet_id}`}
                  value={`${p.tutor_id}|${p.pet_id}`}
                >
                  {p.tutor_nome} - {p.pet_nome} ({p.especie})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Data</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={formNovo.data}
              onChange={(e) =>
                setFormNovo({ ...formNovo, data: e.target.value })
              }
              className="border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 w-full"
              required
            />
          </div>

          {formNovo.data && (
            <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-sm font-bold text-slate-700">
                Horários Disponíveis
              </label>
              {loadingSlots ? (
                <p className="text-sm text-slate-500 font-medium">
                  Buscando horários...
                </p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-red-500 font-medium">
                  Nenhum horário disponível para a data.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormNovo({ ...formNovo, hora: slot })}
                      className={`py-2 px-1 rounded-lg border text-sm font-semibold transition-all ${
                        formNovo.hora === slot
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
            <label className="text-sm font-bold text-slate-700">
              Motivo da Consulta
            </label>
            <textarea
              value={formNovo.motivo_consulta}
              onChange={(e) =>
                setFormNovo({ ...formNovo, motivo_consulta: e.target.value })
              }
              rows="2"
              className="border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 w-full resize-none"
              placeholder="O que houve?"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setModalNovoAgendamento(false)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formNovo.data || !formNovo.hora}
              className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar Agendamento
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Registrar Atendimento"
        maxWidth="max-w-lg"
      >
        <p className="text-sm font-medium text-slate-500 mb-4">
          Pet: {agendamentoSelecionado?.pet_nome}
        </p>
        <form onSubmit={handleSubmitRegistro} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">
              Diagnóstico
            </label>
            <input
              type="text"
              value={formRegistro.diagnostico}
              onChange={(e) =>
                setFormRegistro({
                  ...formRegistro,
                  diagnostico: e.target.value,
                })
              }
              className="border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">
              Prescrição
            </label>
            <textarea
              value={formRegistro.prescricao}
              onChange={(e) =>
                setFormRegistro({ ...formRegistro, prescricao: e.target.value })
              }
              rows="3"
              className="border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 w-full resize-none"
            ></textarea>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">
              Observações
            </label>
            <textarea
              value={formRegistro.observacoes}
              onChange={(e) =>
                setFormRegistro({
                  ...formRegistro,
                  observacoes: e.target.value,
                })
              }
              rows="2"
              className="border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 w-full resize-none"
            ></textarea>
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-1/3">
            <label className="text-sm font-bold text-slate-700">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formRegistro.peso_kg}
              onChange={(e) =>
                setFormRegistro({ ...formRegistro, peso_kg: e.target.value })
              }
              className="border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 w-full"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setModalAberto(false)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-brand-700 transition-all"
            >
              Salvar e Concluir
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={false}
      />
    </div>
  );
};

export default Agenda;
