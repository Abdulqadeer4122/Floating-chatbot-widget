"use client";

import React from "react";
import { ToastProps } from "../types/chat";
interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

interface Toast extends ToastProps {
  id: string;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(({ variant = "default", title, description }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [
      ...prevToasts,
      {
        id,
        variant,
        title,
        description,
      },
    ]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        style={{
          position: "fixed",
          zIndex: 9999,
          top: "1rem",
          right: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              backgroundColor:
                toast.variant === "destructive"
                  ? "#f87171"
                  : toast.variant === "success"
                  ? "#4ade80"
                  : "#f3f4f6",
              color: toast.variant === "default" ? "#1f2937" : "#ffffff",
              padding: "1rem",
              borderRadius: "0.375rem",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              maxWidth: "25rem",
              width: "100%",
              animation: "slideIn 0.2s ease-out",
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{toast.title}</div>
            {toast.description && <div style={{ fontSize: "0.875rem" }}>{toast.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom Hook to use the Toast context
export const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

