import { Plus, Trash2 } from "lucide-react";
import { useCollection } from "../hooks/useCollection";
import ErrorState from "./ErrorState";
import { cents, currency } from "../lib/money";

export default function ProcedimentosAtendimento({ items, onChange }) {
  const {
    items: catalogo,
    loading,
    error,
    reload,
  } = useCollection("/vet/servicos");
  const ativos = catalogo.filter(
    (item) => item.ativo !== false && item.ativo !== 0,
  );
  const update = (index, changes) =>
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...changes } : item)),
    );
  let total = 0;
  try {
    total = items.reduce(
      (sum, item) =>
        sum + cents(item.valor_unitario) * Number(item.quantidade || 0),
      0,
    );
  } catch {
    total = 0;
  }
  return (
    <fieldset className="border-t border-slate-200 pt-5 mt-3">
      <legend className="font-bold text-slate-900">
        Procedimentos e valores
      </legend>
      <p className="text-sm text-slate-600 mb-4">
        Registre os serviços realizados neste atendimento. Os valores podem ser
        ajustados antes de salvar.
      </p>
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && <p role="status">Buscando procedimentos...</p>}
      {!loading && !error && !ativos.length && (
        <p className="text-sm text-slate-600 mb-3">
          Cadastre procedimentos na página Finanças para adicionar valores.
        </p>
      )}
      {items.map((item, index) => (
        <div
          key={item.key}
          className="bg-slate-50 rounded-xl p-4 mb-3 grid grid-cols-2 gap-3"
        >
          <label className="col-span-2 text-sm font-semibold">
            Procedimento
            <select
              aria-label="Procedimento"
              required
              value={item.servico_id}
              onChange={(e) => {
                const selected = ativos.find(
                  (s) => String(s.id) === e.target.value,
                );
                update(index, {
                  servico_id: e.target.value,
                  valor_unitario: selected?.preco_referencia ?? "",
                });
              }}
              className="w-full mt-1 border border-slate-300 rounded-lg p-2 bg-white"
            >
              <option value="">Selecione</option>
              {ativos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.descricao}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Quantidade
            <input
              required
              type="number"
              min="1"
              max="1000"
              step="1"
              value={item.quantidade}
              onChange={(e) => update(index, { quantidade: e.target.value })}
              className="w-full mt-1 border border-slate-300 rounded-lg p-2"
            />
          </label>
          <label className="text-sm font-semibold">
            Valor unitário (R$)
            <input
              required
              type="number"
              min="0"
              max="9999999.99"
              step="0.01"
              value={item.valor_unitario}
              onChange={(e) =>
                update(index, { valor_unitario: e.target.value })
              }
              className="w-full mt-1 border border-slate-300 rounded-lg p-2"
            />
          </label>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="col-span-2 text-red-700 text-sm inline-flex items-center gap-2"
          >
            <Trash2 size={16} />
            Remover procedimento {index + 1}
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={loading || !!error || !ativos.length}
        onClick={() =>
          onChange([
            ...items,
            {
              key: crypto.randomUUID(),
              servico_id: "",
              quantidade: 1,
              valor_unitario: "",
            },
          ])
        }
        className="text-brand-700 font-semibold inline-flex items-center gap-2 disabled:opacity-60"
      >
        <Plus size={16} />
        Adicionar procedimento
      </button>
      <p aria-live="polite" className="font-bold text-right mt-4">
        Total: {currency((total / 100).toFixed(2))}
      </p>
    </fieldset>
  );
}
