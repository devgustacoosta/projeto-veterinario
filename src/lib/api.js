export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
export async function apiRequest(path, { token, body, ...options } = {}) {
  const base = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");
  if (!base)
    throw new ApiError(
      "O serviço está indisponível. Tente novamente mais tarde.",
    );
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "Não foi possível conectar ao serviço. Verifique sua conexão.",
    );
  }
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (response.ok)
      throw new ApiError(
        "O serviço retornou uma resposta inválida.",
        response.status,
      );
  }
  if (!response.ok) {
    if (response.status === 401 && token)
      window.dispatchEvent(new Event("session-expired"));
    const defaults = {
      401: "Sua sessão expirou. Entre novamente.",
      403: "Você não tem permissão para esta operação.",
      409: "Este horário ou registro já está em uso.",
    };
    throw new ApiError(
      data?.erro ||
        data?.message ||
        defaults[response.status] ||
        "Não foi possível concluir a operação.",
      response.status,
    );
  }
  return data;
}
export function requireArray(data) {
  if (!Array.isArray(data))
    throw new ApiError("O serviço retornou uma lista inválida.");
  return data;
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function normalizeDates(data) {
  const result = { ...data };
  for (const key of ["data_hora", "nova_data_hora"])
    if (result[key]) {
      result[key] = result[key].replace("T", " ");
      if (result[key].length === 16) result[key] += ":00";
    }
  return result;
}
