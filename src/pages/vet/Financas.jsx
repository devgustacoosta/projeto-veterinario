import { useEffect, useState } from "react";
import { Plus, Pencil, Wallet, Receipt } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../context/toast";
import { currency, decimal } from "../../lib/money";
import { localDate } from "../../lib/api";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import ErrorState from "../../components/ErrorState";

const emptyForm = {
  descricao: "",
  tipo: "consulta",
  preco_referencia: "",
  custo_material: "0",
  ativo: true,
};
export default function Financas() {
  const services = useCollection("/vet/servicos");
  const request = useApi();
  const { addToast } = useToast();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [filters, setFilters] = useState({
    inicio: localDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
    fim: localDate(),
    agrupamento: "dia",
  });
  const [query, setQuery] = useState(filters);
  const [retry, setRetry] = useState(0);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setReport(null);
    request(`/vet/financeiro?${new URLSearchParams(query)}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (
          !data ||
          !Array.isArray(data.atendimentos) ||
          !Array.isArray(data.periodos)
        )
          throw new Error("Não foi possível carregar o resumo financeiro.");
        currency(data.total);
        setReport(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, request, retry]);
  const open = (service) => {
    setForm(service ? { ...service, ativo: !!service.ativo } : emptyForm);
    setSaveError("");
    setModal(service?.id ?? "new");
  };
  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      if (!form.descricao.trim())
        throw new Error("Informe a descrição do procedimento.");
      const body = {
        descricao: form.descricao.trim(),
        tipo: form.tipo,
        preco_referencia: decimal(form.preco_referencia),
        custo_material: decimal(form.custo_material),
        ativo: form.ativo,
      };
      await request(
        modal === "new" ? "/vet/servicos" : `/vet/servicos/${modal}`,
        { method: modal === "new" ? "POST" : "PUT", body },
      );
      setModal(null);
      await services.reload();
      addToast("Procedimento salvo!", "success");
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Wallet className="text-brand-600" />
          Finanças
        </h1>
        <p className="text-slate-600 mt-2">
          Acompanhe os valores dos atendimentos e organize seus procedimentos.
        </p>
      </header>
      <section
        aria-labelledby="receitas-title"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7"
      >
        <h2 id="receitas-title" className="text-xl font-bold mb-5">
          Valores dos atendimentos
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (filters.inicio > filters.fim) {
              setError("A data inicial deve ser anterior ou igual à final.");
              return;
            }
            setQuery({ ...filters });
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6"
        >
          <label className="text-sm font-semibold">
            De
            <input
              required
              type="date"
              value={filters.inicio}
              onChange={(e) =>
                setFilters({ ...filters, inicio: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded-lg mt-1"
            />
          </label>
          <label className="text-sm font-semibold">
            Até
            <input
              required
              type="date"
              min={filters.inicio}
              value={filters.fim}
              onChange={(e) => setFilters({ ...filters, fim: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg mt-1"
            />
          </label>
          <label className="text-sm font-semibold">
            Agrupar por
            <select
              value={filters.agrupamento}
              onChange={(e) =>
                setFilters({ ...filters, agrupamento: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded-lg bg-white mt-1"
            >
              <option value="dia">Dia</option>
              <option value="mes">Mês</option>
              <option value="ano">Ano</option>
            </select>
          </label>
          <button className="bg-brand-600 text-white rounded-lg p-2 self-end font-semibold">
            Consultar
          </button>
        </form>
        {loading ? (
          <Loading text="Carregando valores..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setRetry((n) => n + 1)} />
        ) : (
          report && (
            <>
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-5">
                <p className="text-sm text-brand-900">
                  Total dos serviços no período
                </p>
                <p className="text-3xl font-bold text-brand-900 mt-2">
                  {currency(report.total)}
                </p>
                <p className="text-sm text-slate-700 mt-2">
                  Valores registrados nos atendimentos. Não representam lucro ou
                  confirmação de pagamento.
                </p>
              </div>
              {!report.atendimentos.length ? (
                <p className="text-slate-600">
                  Nenhum valor registrado neste período.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <caption className="text-left font-semibold mb-3">
                      Atendimentos do período
                    </caption>
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th scope="col" className="p-3">
                          Data
                        </th>
                        <th scope="col" className="p-3">
                          Paciente / tutor
                        </th>
                        <th scope="col" className="p-3">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.atendimentos.map((row) => (
                        <tr
                          key={row.agendamento_id}
                          className="border-b border-slate-100"
                        >
                          <td className="p-3">
                            {row.data_hora?.replace("T", " ").slice(0, 16)}
                          </td>
                          <td className="p-3">
                            {row.pet_nome}
                            <span className="block text-slate-600">
                              {row.tutor_nome}
                            </span>
                          </td>
                          <td className="p-3 font-semibold">
                            {currency(row.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!!report.periodos.length && (
                <div className="mt-5 grid sm:grid-cols-3 gap-3">
                  {report.periodos.map((row) => (
                    <div
                      key={row.periodo}
                      className="rounded-xl bg-slate-50 p-4"
                    >
                      <p className="text-slate-600 text-sm">{row.periodo}</p>
                      <p className="font-bold mt-1">{currency(row.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        )}
      </section>
      <section
        aria-labelledby="catalogo-title"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7"
      >
        <div className="flex flex-wrap justify-between gap-4 mb-5">
          <h2
            id="catalogo-title"
            className="text-xl font-bold flex items-center gap-2"
          >
            <Receipt size={22} />
            Procedimentos
          </h2>
          <button
            type="button"
            onClick={() => open(null)}
            className="bg-brand-600 text-white rounded-lg px-4 py-2 font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Novo procedimento
          </button>
        </div>
        {services.loading ? (
          <Loading />
        ) : services.error ? (
          <ErrorState message={services.error} onRetry={services.reload} />
        ) : !services.items.length ? (
          <p className="text-slate-600">Nenhum procedimento cadastrado.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {services.items.map((service) => (
              <article
                key={service.id}
                className="p-5 border border-slate-200 rounded-xl"
              >
                <div className="flex justify-between gap-3">
                  <h3 className="font-bold">{service.descricao}</h3>
                  <button
                    type="button"
                    onClick={() => open(service)}
                    aria-label={`Editar ${service.descricao}`}
                    className="p-2 text-brand-700"
                  >
                    <Pencil size={18} />
                  </button>
                </div>
                <p className="text-xl font-bold text-brand-900">
                  {currency(service.preco_referencia)}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  {service.tipo} • {service.ativo ? "Ativo" : "Inativo"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "new" ? "Novo procedimento" : "Editar procedimento"}
        busy={saving}
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          {saveError && <ErrorState message={saveError} />}
          <label className="text-sm font-semibold">
            Descrição
            <input
              required
              maxLength={150}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full p-3 rounded-lg border border-slate-300 mt-1"
            />
          </label>
          <label className="text-sm font-semibold">
            Tipo
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full p-3 rounded-lg border border-slate-300 bg-white mt-1"
            >
              <option value="consulta">Consulta</option>
              <option value="exame">Exame</option>
              <option value="procedimento">Procedimento</option>
              <option value="outro">Outro</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Preço de referência (R$)
            <input
              required
              type="number"
              min="0"
              max="9999999.99"
              step="0.01"
              value={form.preco_referencia}
              onChange={(e) =>
                setForm({ ...form, preco_referencia: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-slate-300 mt-1"
            />
          </label>
          <label className="text-sm font-semibold">
            Custo de materiais (R$)
            <input
              required
              type="number"
              min="0"
              max="9999999.99"
              step="0.01"
              value={form.custo_material}
              onChange={(e) =>
                setForm({ ...form, custo_material: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-slate-300 mt-1"
            />
          </label>
          <label className="flex items-center gap-2 font-semibold text-sm">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            Disponível para novos atendimentos
          </label>
          <button
            disabled={saving}
            className="bg-brand-600 text-white font-semibold rounded-lg p-3 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar procedimento"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
