"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            {/* Toast Container */}
            <div
                style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    zIndex: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                }}
            >
                {toasts.map((toast) => {
                    const config = {
                        success: { icon: CheckCircle2, color: "#22C55E", bg: "rgba(34,197,94,0.06)" },
                        error: { icon: AlertCircle, color: "#EF4444", bg: "rgba(239,68,68,0.06)" },
                        warning: { icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.06)" },
                    };
                    const c = config[toast.type] || config.success;
                    const Icon = c.icon;

                    return (
                        <div
                            key={toast.id}
                            className="animate-slide-in"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "14px 18px",
                                minWidth: 320,
                                background: "#FFFFFF",
                                borderRadius: 16,
                                border: `1px solid ${c.color}20`,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: c.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Icon size={18} color={c.color} />
                            </div>
                            <span style={{ fontSize: 13.5, fontWeight: 500, color: "#1E293B", flex: 1 }}>
                                {toast.message}
                            </span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    padding: 4,
                                    display: "flex",
                                }}
                            >
                                <X size={14} color="#94A3B8" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
