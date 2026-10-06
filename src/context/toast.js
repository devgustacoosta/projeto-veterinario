import { createContext, useContext } from "react";
export const ToastContext = createContext();
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast requer ToastProvider");
  return context;
}
