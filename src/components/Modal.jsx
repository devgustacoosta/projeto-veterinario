import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  busy = false,
}) {
  const dialog = useRef(null);
  const close = useRef(onClose);
  const titleId = useId();
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!isOpen) return;
    const node = dialog.current;
    const previous = document.activeElement;
    const root = document.getElementById("root");
    const wasInert = root?.inert;
    if (root) root.inert = true;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    const keepFocus = (event) => {
      if (
        event.key !== "Tab" ||
        [...document.querySelectorAll("dialog[open]")].at(-1) !== node
      )
        return;
      const controls = [
        ...node.querySelectorAll(
          "button, input, select, textarea, a[href], [tabindex]",
        ),
      ].filter(
        (element) =>
          !element.disabled &&
          element.tabIndex >= 0 &&
          element.getClientRects().length,
      );
      const first = controls[0],
        last = controls.at(-1);
      if (!first) {
        event.preventDefault();
        node.focus();
        return;
      }
      if (
        !node.contains(document.activeElement) ||
        (event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener("keydown", keepFocus);
    return () => {
      document.removeEventListener("keydown", keepFocus);
      node.close();
      if (root) root.inert = wasInert;
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return createPortal(
    <dialog
      ref={dialog}
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) close.current();
      }}
      className={`m-auto p-0 bg-white rounded-2xl shadow-xl w-[calc(100%-2rem)] ${maxWidth} max-h-[90dvh] backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm`}
    >
      <div className="flex justify-between items-center p-6 border-b border-slate-100">
        <h2 id={titleId} className="text-xl font-bold text-slate-900">
          {title}
        </h2>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          aria-label={`Fechar ${title}`}
          className="text-slate-600 p-2"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">{children}</div>
    </dialog>,
    document.body,
  );
}
