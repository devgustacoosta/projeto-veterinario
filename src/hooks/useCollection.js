import { useCallback, useEffect, useState } from "react";
import { useApi } from "./useApi";
import { requireArray } from "../lib/api";
export function useCollection(path) {
  const request = useApi();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(requireArray(await request(path)));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [path, request]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    request(path, { signal: controller.signal })
      .then(requireArray)
      .then(setItems)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, request]);
  return { items, setItems, loading, error, reload, request };
}
