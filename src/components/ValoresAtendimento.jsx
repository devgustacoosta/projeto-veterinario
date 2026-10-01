import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { currency } from "../lib/money";
import Modal from "./Modal";
import Loading from "./Loading";
import ErrorState from "./ErrorState";
export default function ValoresAtendimento({ appointment, onClose }) {
  const request = useApi();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    request(`/tutor/agendamentos/${appointment.id}/financeiro`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (!result || !Array.isArray(result.procedimentos))
          throw new Error("Não foi possível carregar os valores.");
        currency(result.total);
        setData(result);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [appointment.id, request, retry]);
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Valores do atendimento de ${appointment.pet_nome}`}
    >
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            setError("");
            setRetry((n) => n + 1);
          }}
        />
      ) : (
        data && (
          <>
            {!data.procedimentos.length ? (
              <p className="text-slate-600">
                Não há procedimentos com valores registrados neste atendimento.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.procedimentos.map((item, index) => (
                  <li
                    key={item.id ?? index}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <p className="font-bold">{item.descricao}</p>
                    <p className="text-sm text-slate-600">
                      {item.quantidade} × {currency(item.valor_unitario)}
                    </p>
                    <p className="text-right font-bold mt-2">
                      {currency(item.subtotal)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="font-bold text-xl text-right mt-5">
              Total: {currency(data.total)}
            </p>
          </>
        )
      )}
    </Modal>
  );
}
