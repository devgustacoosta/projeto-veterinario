import { describe, it, expect } from "vitest";
import { dateTimeParts, formatTime, formatDateTime } from "../src/lib/dates";

describe("apresentação de datas e horas da API", () => {
  it.each(["2026-10-13 08:30:00", "2026-10-13T08:30", "Tue, 13 Oct 2026 08:30:00 GMT"])(
    "preserva o dia e o horário registrado em %s",
    (value) => {
      expect(dateTimeParts(value)).toEqual({ data: "13/10/2026", hora: "08:30" });
      expect(formatDateTime(value)).toBe("13/10/2026 - 08:30");
    },
  );
  it("não desloca uma data HTTP na virada do dia pelo fuso do navegador", () => {
    expect(dateTimeParts("Tue, 13 Oct 2026 00:30:00 GMT")).toEqual({ data: "13/10/2026", hora: "00:30" });
  });
  it("apresenta uma data sem inventar um horário", () => {
    expect(formatDateTime("2026-10-13")).toBe("13/10/2026");
  });
  it.each([null, "", "inválida", "2026-02-30", "2026-10-13 25:00:00"])(
    "trata uma data ausente ou inválida: %s",
    (value) => expect(dateTimeParts(value)).toEqual({ data: "", hora: "" }),
  );
  it.each(["8:00:00", "08:00:00", "08:00"])(
    "normaliza o horário %s sem exibir dois pontos ao final",
    (value) => expect(formatTime(value)).toBe("08:00"),
  );
  it.each([null, "", "25:00:00", "08:60:00"])(
    "trata horário ausente ou inválido: %s",
    (value) => expect(formatTime(value)).toBe(""),
  );
});
