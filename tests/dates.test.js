import { describe, it, expect } from "vitest";
import { dateTimeParts, formatTime, formatDateTime, weekdayName, formatPeriod } from "../src/lib/dates";

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


describe("localização em português do Brasil", () => {
  it.each([
    ["2026-10-11", "domingo"],
    ["2026-10-12", "segunda-feira"],
    ["2026-10-13", "terça-feira"],
    ["2026-10-14", "quarta-feira"],
    ["2026-10-15", "quinta-feira"],
    ["2026-10-16", "sexta-feira"],
    ["2026-10-17", "sábado"],
    ["Wed, 06 Oct 2021 08:00:00 GMT", "quarta-feira"],
  ])("apresenta %s como %s", (value, expected) => {
    expect(weekdayName(value)).toBe(expected);
  });
  it.each([
    ["2026-10-06", "06/10/2026"],
    ["2026-10", "outubro de 2026"],
    ["2026", "2026"],
    ["2026-13", ""],
    ["inválido", ""],
  ])("apresenta o período %s como %s", (value, expected) => {
    expect(formatPeriod(value)).toBe(expected);
  });
});
