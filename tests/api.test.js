import { describe, it, expect, vi } from "vitest";
import {
  apiRequest,
  localDate,
  normalizeDates,
  requireArray,
} from "../src/lib/api";
import { cents, decimal, validateItems } from "../src/lib/money";

describe("contrato HTTP", () => {
  it("envia autenticação e JSON e aceita resposta sem conteúdo", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example/");
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetch);
    expect(
      await apiRequest("/pets", {
        token: "test",
        method: "POST",
        body: { nome: "Lua" },
      }),
    ).toBeNull();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://api.example/pets");
    expect(options.headers.get("Authorization")).toBe("Bearer test");
    expect(JSON.parse(options.body)).toEqual({ nome: "Lua" });
  });
  it.each([400, 403, 409, 500])(
    "rejeita HTTP %s sem tratar como sucesso",
    async (status) => {
      vi.stubEnv("VITE_API_URL", "https://api.example");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response('{"erro":"Falha"}', { status })),
      );
      await expect(apiRequest("/pets")).rejects.toMatchObject({
        status,
        message: "Falha",
      });
    },
  );
  it("encerra a sessão autenticada em 401", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );
    const listener = vi.fn();
    window.addEventListener("session-expired", listener);
    await expect(
      apiRequest("/pets", { token: "expired" }),
    ).rejects.toMatchObject({ status: 401 });
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener("session-expired", listener);
  });
  it("distingue configuração, rede e resposta inválida", async () => {
    vi.stubEnv("VITE_API_URL", "");
    await expect(apiRequest("/pets")).rejects.toThrow("indisponível");
    vi.stubEnv("VITE_API_URL", "https://api.example");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(apiRequest("/pets")).rejects.toThrow("conectar");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("html")));
    await expect(apiRequest("/pets")).rejects.toThrow("inválida");
  });
  it("preserva abortos", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError")),
    );
    await expect(apiRequest("/pets")).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});
describe("valores e datas", () => {
  it("calcula moeda sem perda de centavos", () => {
    expect(cents("0,10") + cents("0.20")).toBe(30);
    expect(decimal("12.5")).toBe("12.50");
    expect(
      validateItems([{ servico_id: 2, quantidade: 3, valor_unitario: "12.5" }]),
    ).toEqual([{ servico_id: 2, quantidade: 3, valor_unitario: "12.50" }]);
  });
  it.each(["-1", "NaN", "1.234", "", "1e2", "Infinity"])(
    "rejeita valor inválido %s",
    (value) => {
      expect(() => cents(value)).toThrow();
    },
  );
  it.each([0, -1, 1.5, 1001])("rejeita quantidade %s", (quantidade) => {
    expect(() =>
      validateItems([{ servico_id: 1, quantidade, valor_unitario: "2" }]),
    ).toThrow();
  });
  it("normaliza data sem modificar o objeto original", () => {
    const data = { data_hora: "2026-10-10T18:00" };
    expect(normalizeDates(data).data_hora).toBe("2026-10-10 18:00:00");
    expect(data.data_hora).toContain("T");
    expect(localDate(new Date(2026, 9, 10, 23, 30))).toBe("2026-10-10");
    expect(() => requireArray({})).toThrow();
  });
});
