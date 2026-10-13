export function formatTime(value) {
  if (typeof value !== "string") return "";
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

export function dateTimeParts(value) {
  if (typeof value !== "string" || !value) return { data: "", hora: "" };
  const local = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}:\d{2})(?::\d{2}(?:\.\d+)?)?)?$/.exec(value);
  if (local) {
    const [, year, month, day, time] = local;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (
      date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() + 1 !== Number(month) ||
      date.getUTCDate() !== Number(day) ||
      (time && !formatTime(time))
    ) return { data: "", hora: "" };
    return { data: `${day}/${month}/${year}`, hora: time ? formatTime(time) : "" };
  }
  if (!/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value))
    return { data: "", hora: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { data: "", hora: "" };
  const pad = (number) => String(number).padStart(2, "0");
  return {
    data: `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`,
    hora: `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`,
  };
}

export function formatDateTime(value) {
  const { data, hora } = dateTimeParts(value);
  return hora ? `${data} - ${hora}` : data;
}

export function weekdayName(value) {
  const { data } = dateTimeParts(value);
  if (!data) return "";
  const [day, month, year] = data.split("/").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(date);
}

export function formatPeriod(value) {
  if (typeof value !== "string") return "";
  if (/^\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    if (month < 1 || month > 12) return "";
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
  }
  return dateTimeParts(value).data;
}
