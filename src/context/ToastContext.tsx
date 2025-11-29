"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

interface ToastState {
  message: string;
  type: ToastType;
  isOpen: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("UseToast must be used within a ToastProvider");
  }
  return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ message, type, isOpen: true });
  }, []);

  // Auto-hide after 3 seconds
  useEffect(() => {
    if (!toast.isOpen) return;
    const timeout = setTimeout(() => {
      setToast(prev => ({ ...prev, isOpen: false }));
    }, 3000);
    return () => clearTimeout(timeout);
  }, [toast.isOpen]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/*Toast UI*/}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toast.isOpen && (
          <div
            className={`px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-3 transition-all duration-300
              ${
                toast.type === "success"
                  ? "bg-green-600 text-white"
                  : toast.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-slate-800 text-white"
              }
            `}
          >
            {" "}
            <span>{toast.message}</span>
          </div>
        )}
      </div>{" "}
    </ToastContext.Provider>
  );
};
