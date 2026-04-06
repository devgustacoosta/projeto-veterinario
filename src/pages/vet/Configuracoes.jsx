import React, { useState } from "react";
import { useConfiguracoes } from "../../hooks/useConfiguracoes";
import { Clock, CalendarOff, Plus, Trash2, AlertCircle } from "lucide-react";
import Loading from "../../components/Loading";

const Configuracoes = () => {
  const {
    horarios,
    bloqueios,
    loading,
    addHorario,
    removeHorario,
    addBloqueio,
    removeBloqueio,
  } = useConfiguracoes();

  const [formH, setFormH] = useState({
    dia_semana: "1",
    hora_inicio: "08:00",
    hora_fim: "18:00",
    duracao_consulta_min: 30,
  });
  const [formB, setFormB] = useState({
    data_inicio: "",
    data_fim: "",
    motivo: "",
  });

  const diasSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  if (loading) return <Loading text="Carregando configurações..." />;

  const handleSubmitHorario = (e) => {
    e.preventDefault();
    addHorario({
      ...formH,
      dia_semana: parseInt(formH.dia_semana, 10),
      hora_inicio: formH.hora_inicio + ":00",
      hora_fim: formH.hora_fim + ":00",
      duracao_consulta_min: parseInt(formH.duracao_consulta_min, 10),
    });
  };

  const formatDateTimeDisplay = (dataStr) => {
    if (!dataStr) return { data: "", hora: "" };
    const [d, t] = dataStr.split(/[T ]/);
    const partes = d.split("-");
    const dataFormatada =
      partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : d;

    return {
      data: dataFormatada,
      hora: t ? t.substring(0, 5) : "",
    };
  };

  return (
    <div className="w-full flex flex-col items-start pb-12 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Configurações da Agenda
        </h1>
        <p className="text-slate-500 text-sm">
          Defina seus horários regulares e períodos de indisponibilidade.
        </p>
      </div>

      <div className="w-full flex flex-col xl:flex-row gap-8 items-start">
        <div className="w-full xl:w-3/5 bg-white border border-slate-100 shadow-sm p-6 md:p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Horários de Atendimento
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Intervalos de disponibilidade padrão
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmitHorario}
            className="flex flex-col gap-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Dia da Semana
                </label>
                <select
                  value={formH.dia_semana}
                  onChange={(e) =>
                    setFormH({ ...formH, dia_semana: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg py-2.5 px-3 font-medium bg-white text-sm outline-none focus:ring-2 focus:ring-brand-100"
                >
                  {diasSemana.map((dia, i) => (
                    <option key={i} value={i}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-full md:w-32">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Dur. (min)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={formH.duracao_consulta_min}
                  onChange={(e) =>
                    setFormH({ ...formH, duracao_consulta_min: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg py-2.5 px-3 font-medium bg-white text-sm outline-none w-full focus:ring-2 focus:ring-brand-100"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Início
                </label>
                <input
                  type="time"
                  value={formH.hora_inicio}
                  onChange={(e) =>
                    setFormH({ ...formH, hora_inicio: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg py-2.5 px-3 font-medium bg-white text-sm outline-none w-full focus:ring-2 focus:ring-brand-100"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Fim
                </label>
                <input
                  type="time"
                  value={formH.hora_fim}
                  onChange={(e) =>
                    setFormH({ ...formH, hora_fim: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg py-2.5 px-3 font-medium bg-white text-sm outline-none w-full focus:ring-2 focus:ring-brand-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-brand-600 text-white p-3 rounded-lg hover:bg-brand-700 shadow-sm transition-all flex items-center justify-center min-w-[46px] h-[46px] w-full md:w-auto"
              >
                <Plus size={20} />
              </button>
            </div>
          </form>
          <div className="flex flex-col gap-4">
            {[0, 1, 2, 3, 4, 5, 6].map((dia) => {
              const hDia = horarios.filter((h) => h.dia_semana === dia);
              if (hDia.length === 0) return null;
              return (
                <div
                  key={dia}
                  className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-slate-100 last:border-0 gap-4"
                >
                  <span className="w-32 font-bold text-slate-800 shrink-0">
                    {diasSemana[dia]}
                  </span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {hDia.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center gap-3 bg-white border border-slate-200 py-1.5 pl-3 pr-1.5 rounded-lg text-sm shadow-sm group hover:border-brand-200 transition-colors"
                      >
                        <span className="font-bold text-slate-700">
                          {h.hora_inicio.substring(0, 5)} -{" "}
                          {h.hora_fim.substring(0, 5)}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded font-bold">
                          {h.duracao_consulta_min}m
                        </span>
                        <button
                          onClick={() => removeHorario(h.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full xl:w-2/5 bg-white border border-slate-100 shadow-sm p-6 md:p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
              <CalendarOff size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Bloqueios Pontuais
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Suspensão de agenda por períodos
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addBloqueio({
                ...formB,
                data_inicio: formB.data_inicio.replace("T", " ") + ":00",
                data_fim: formB.data_fim.replace("T", " ") + ":00",
              });
              setFormB({ data_inicio: "", data_fim: "", motivo: "" });
            }}
            className="flex flex-col gap-4 mb-8"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Início*
                </label>
                <input
                  type="datetime-local"
                  value={formB.data_inicio}
                  onChange={(e) =>
                    setFormB({ ...formB, data_inicio: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg py-2.5 px-3 font-medium text-xs bg-white outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Fim*
                </label>
                <input
                  type="datetime-local"
                  value={formB.data_fim}
                  onChange={(e) =>
                    setFormB({ ...formB, data_fim: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg py-2.5 px-3 font-medium text-xs bg-white outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Motivo
              </label>
              <input
                type="text"
                placeholder="Ex: Férias..."
                value={formB.motivo}
                onChange={(e) => setFormB({ ...formB, motivo: e.target.value })}
                className="border border-slate-300 rounded-lg py-2.5 px-3 font-medium text-sm bg-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 text-white py-3 rounded-xl font-bold shadow-sm hover:bg-slate-800 transition-all mt-2"
            >
              Criar Bloqueio
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {bloqueios.map((b) => {
              const inicio = formatDateTimeDisplay(b.data_inicio);
              const fim = formatDateTimeDisplay(b.data_fim);

              return (
                <div
                  key={b.id}
                  className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex justify-between items-start transition-all"
                >
                  <div className="flex gap-3">
                    <AlertCircle size={18} className="text-red-500 mt-0.5" />
                    <div className="flex flex-col">
                      <p className="font-bold text-slate-900 text-sm mb-1">
                        {b.motivo || "Período Bloqueado"}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500">
                        De: {inicio.data} - {inicio.hora}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500">
                        Até: {fim.data} - {fim.hora}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBloqueio(b.id)}
                    className="text-slate-300 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;