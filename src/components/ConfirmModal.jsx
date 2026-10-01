import { useEffect, useState } from "react";
import Modal from "./Modal";
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (isOpen) setError("");
  }, [isOpen]);
  const confirm = async () => {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await onConfirm();
      if (result !== false) onClose();
      else
        setError(
          "A operação não foi concluída. Confira os dados e tente novamente.",
        );
    } catch (err) {
      setError(err.message || "Não foi possível concluir a operação.");
    } finally {
      setPending(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-sm"
      busy={pending}
    >
      <p className="text-slate-700 mb-6">{message}</p>
      {error && (
        <p role="alert" className="text-red-700 mb-4">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="px-4 py-2.5 font-semibold border border-slate-300 rounded-lg"
        >
          {cancelText}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={confirm}
          className={`px-4 py-2.5 font-semibold text-white rounded-lg disabled:opacity-60 ${isDestructive ? "bg-red-700" : "bg-brand-600"}`}
        >
          {pending ? "Aguarde..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}
