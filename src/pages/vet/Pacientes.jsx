import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { usePacientes } from "../../hooks/usePacientes";
import {
  Search,
  ChevronRight,
  FileText,
  Activity,
  Scale,
  Pill,
  Stethoscope,
  PawPrint,
  Info,
} from "lucide-react";
import Loading from "../../components/Loading";

const Pacientes = () => {
  const location = useLocation();
  const { pacientes, loading, carregarHistorico } = usePacientes();
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [busca, setBusca] = useState(location.state?.petNome || "");

  const handleSelect = useCallback(
    async (pet) => {
      setPacienteSelecionado(pet);
      setLoadingHistorico(true);
      const data = await carregarHistorico(pet.id);
      setHistorico(data);
      setLoadingHistorico(false);
    },
    [carregarHistorico]
  );

  useEffect(() => {
    if (
      location.state?.petNome &&
      pacientes.length > 0 &&
      !pacienteSelecionado
    ) {
      const petEncontrado = pacientes.find(
        (p) => p.nome === location.state.petNome
      );
      if (petEncontrado) {
        setTimeout(() => {
          handleSelect(petEncontrado);
        }, 0);
      }
    }
  }, [location.state, pacientes, pacienteSelecionado, handleSelect]);

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.tutor_nome.toLowerCase().includes(busca.toLowerCase())
  );

  const formatarDataRegistro = (dataString) => {
    if (!dataString) return "";
    const partes = dataString.split(/[T ]/)[0].split("-");
    return partes.length === 3
      ? `${partes[2]}/${partes[1]}/${partes[0]}`
      : dataString.split(/[T ]/)[0];
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-8 items-start animate-in fade-in duration-300">
      <div className="w-full md:w-1/3 flex flex-col min-h-[600px]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Pacientes
          </h1>
          <p className="text-slate-500 text-sm">
            Prontuários e histórico clínico.
          </p>
        </div>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar pet ou tutor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 bg-white font-medium"
          />
        </div>

        {loading ? (
          <Loading text="Buscando pacientes..." />
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto pr-2">
            {pacientesFiltrados.map((pet) => {
              const isActive = pacienteSelecionado?.id === pet.id;
              return (
                <button
                  key={pet.id}
                  onClick={() => handleSelect(pet)}
                  className={`text-left w-full flex items-center justify-between p-4 border transition-all rounded-2xl group ${
                    isActive
                      ? "bg-brand-50 border-brand-200 shadow-sm"
                      : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <h3
                      className={`font-bold text-lg leading-tight ${
                        isActive ? "text-brand-900" : "text-slate-900"
                      }`}
                    >
                      {pet.nome}
                    </h3>
                    <p
                      className={`text-xs font-medium mt-1 ${
                        isActive ? "text-brand-700/80" : "text-slate-500"
                      }`}
                    >
                      Tutor: {pet.tutor_nome}
                    </p>
                  </div>
                  <ChevronRight
                    size={20}
                    className={
                      isActive
                        ? "text-brand-600"
                        : "text-slate-300 group-hover:text-slate-500"
                    }
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full md:w-2/3 flex flex-col">
        {!pacienteSelecionado ? (
          <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center rounded-3xl bg-slate-50/50">
            <div className="bg-white p-5 rounded-full shadow-sm mb-4">
              <FileText size={40} className="text-slate-300" />
            </div>
            <p className="font-bold text-xl text-slate-500 mb-1">
              Nenhum paciente selecionado
            </p>
            <p className="text-sm text-slate-400 font-medium">
              Selecione na lista para ver o prontuário.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="bg-white border border-slate-100 shadow-sm p-6 md:p-8 rounded-3xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex gap-5 items-center">
                <div className="w-16 h-16 bg-brand-50 flex items-center justify-center rounded-2xl text-brand-600">
                  <PawPrint size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {pacienteSelecionado.nome}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md">
                      {pacienteSelecionado.especie}
                    </span>{" "}
                    {pacienteSelecionado.raca && (
                      <span>• {pacienteSelecionado.raca}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  Responsável
                </p>
                <p className="font-bold text-slate-800 text-lg">
                  {pacienteSelecionado.tutor_nome}
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
              <Activity size={24} className="text-brand-600" />
              Histórico Médico
            </h3>

            {loadingHistorico ? (
              <Loading text="Buscando histórico médico..." />
            ) : historico.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 border-dashed py-12 flex flex-col items-center justify-center rounded-2xl text-slate-500 mt-2">
                <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                  <FileText size={24} className="text-slate-400" />
                </div>
                <p className="font-medium text-sm">
                  Nenhum histórico médico encontrado para este pet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 relative">
                <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 z-0 rounded-full"></div>
                {historico.map((registro) => {
                  const hasDetalhes =
                    registro.diagnostico ||
                    registro.prescricao ||
                    registro.observacoes ||
                    registro.peso_kg;

                  return (
                    <div key={registro.id} className="relative z-10 pl-14">
                      <div className="absolute left-[15px] top-6 w-3 h-3 rounded-full bg-white border-[3px] border-brand-500"></div>
                      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                          <span className="font-bold text-slate-900 text-sm">
                            {formatarDataRegistro(registro.data_hora)}
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                            <Stethoscope size={16} className="text-slate-400" />{" "}
                            {registro.veterinario_nome || registro.veterinario}
                          </span>
                        </div>
                        <div className="p-6 flex flex-col gap-5">
                          {!hasDetalhes ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                              <Info size={16} /> Atendimento registrado sem
                              anotações detalhadas.
                            </div>
                          ) : (
                            <>
                              {registro.diagnostico && (
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Activity size={14} /> Diagnóstico
                                  </p>
                                  <p className="text-sm font-medium text-slate-800">
                                    {registro.diagnostico}
                                  </p>
                                </div>
                              )}

                              {registro.observacoes && (
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <FileText size={14} /> Observações
                                  </p>
                                  <p className="text-sm font-medium text-slate-800">
                                    {registro.observacoes}
                                  </p>
                                </div>
                              )}

                              {registro.prescricao && (
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Pill size={14} /> Prescrição
                                  </p>
                                  <p className="text-sm font-medium text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {registro.prescricao}
                                  </p>
                                </div>
                              )}

                              {registro.peso_kg && (
                                <div className="flex gap-8 pt-4 border-t border-slate-100">
                                  <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                      <Scale size={14} /> Peso
                                    </p>
                                    <p className="font-bold text-xl text-slate-900">
                                      {registro.peso_kg}{" "}
                                      <span className="text-sm font-medium text-slate-500">
                                        kg
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pacientes;
