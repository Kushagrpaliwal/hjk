"use client";
import { useEffect, useRef } from "react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = 480 }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={(e) => e.target === overlayRef.current && onClose()}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(15,23,42,0.4)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
        >
            <div
                className="animate-scale-in"
                style={{
                    width: "100%",
                    maxWidth,
                    background: "#FFFFFF",
                    borderRadius: 24,
                    boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 24px",
                        borderBottom: "1px solid #F1F5F9",
                    }}
                >
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1E293B" }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: "none",
                            background: "#F5F7FB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#64748B",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#E6EAF2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#F5F7FB")}
                    >
                        <span style={{ fontSize: 20, lineHeight: 1 }}>×</span>
                    </button>
                </div>
                {/* Body */}
                <div style={{ padding: 24 }}>{children}</div>
            </div>
        </div>
    );
}
