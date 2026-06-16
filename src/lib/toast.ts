"use client";

import { useState, useCallback } from "react";

export type ToastVariant = "default" | "success" | "error";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let toastListeners: Array<(toast: Toast) => void> = [];

export function emitToast(toast: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const full: Toast = { id, variant: "default", ...toast };
  toastListeners.forEach((fn) => fn(full));
}

export const toast = {
  success: (title: string, description?: string) =>
    emitToast({ title, description, variant: "success" }),
  error: (title: string, description?: string) =>
    emitToast({ title, description, variant: "error" }),
  info: (title: string, description?: string) =>
    emitToast({ title, description, variant: "default" }),
};

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const subscribe = useCallback(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  return { toasts, subscribe };
}
