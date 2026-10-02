import {
  renderHook,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AuthContext } from "../src/context/auth";
import { ToastContext } from "../src/context/toast";
import { usePets } from "../src/hooks/usePets";
import ConfirmModal from "../src/components/ConfirmModal";

const addToast = vi.fn();
function Wrapper({ children }) {
  return (
    <AuthContext.Provider value={{ token: "test" }}>
      <ToastContext.Provider value={{ addToast }}>
        {children}
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}
function setupFetch() {
  vi.stubEnv("VITE_API_URL", "https://api.example");
  const fetch = vi
    .fn()
    .mockResolvedValue(new Response('[{"id":1,"nome":"Lua"}]'));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
describe("operações de pets", () => {
  it.each(["addPet", "updatePet"])(
    "%s mantém formulário aberto em falha",
    async (method) => {
      const fetch = setupFetch();
      const { result } = renderHook(() => usePets(), { wrapper: Wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));
      fetch.mockResolvedValue(
        new Response('{"erro":"Não foi salvo"}', { status: 500 }),
      );
      let success;
      await act(async () => {
        success =
          method === "addPet"
            ? await result.current.addPet({ nome: "Lua" })
            : await result.current.updatePet(1, { nome: "Lua" });
      });
      expect(success).toBe(false);
      expect(result.current.saving).toBe(false);
      expect(addToast).toHaveBeenLastCalledWith("Não foi salvo", "error");
    },
  );
  it("não remove pet da lista quando exclusão é recusada", async () => {
    const fetch = setupFetch();
    const { result } = renderHook(() => usePets(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.pets).toHaveLength(1));
    fetch.mockResolvedValue(new Response(null, { status: 403 }));
    await act(async () => {
      expect(await result.current.deletePet(1)).toBe(false);
    });
    expect(result.current.pets).toHaveLength(1);
  });
  it("remove somente após confirmação HTTP", async () => {
    const fetch = setupFetch();
    const { result } = renderHook(() => usePets(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.pets).toHaveLength(1));
    fetch.mockResolvedValue(new Response(null, { status: 204 }));
    await act(async () => {
      expect(await result.current.deletePet(1)).toBe(true);
    });
    expect(result.current.pets).toHaveLength(0);
  });
});
describe("confirmação assíncrona", () => {
  it("aguarda operação, bloqueia envio repetido e fecha após sucesso", async () => {
    let resolve;
    const operation = new Promise((r) => {
      resolve = r;
    });
    const onConfirm = vi.fn(() => operation),
      onClose = vi.fn();
    render(
      <ConfirmModal
        isOpen
        onConfirm={onConfirm}
        onClose={onClose}
        title="Excluir pet"
        message="Confirmar?"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(screen.getByRole("button", { name: "Aguarde..." })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
    await act(async () => resolve(true));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("mantém diálogo e mostra erro quando o servidor recusa", async () => {
    const onClose = vi.fn();
    render(
      <ConfirmModal
        isOpen
        onConfirm={() => Promise.reject(new Error("Horário ocupado"))}
        onClose={onClose}
        title="Agendar"
        message="Confirmar?"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Horário ocupado",
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
