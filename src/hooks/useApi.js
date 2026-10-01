import { useCallback } from "react";
import { useAuth } from "../context/auth";
import { apiRequest } from "../lib/api";
export function useApi() {
  const { token } = useAuth();
  return useCallback(
    (path, options) => apiRequest(path, { ...options, token }),
    [token],
  );
}
