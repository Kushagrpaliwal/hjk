"use client";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useToast } from "../components/Toast";

export default function ChangePasswordPage() {
    const [form, setForm] = useState({ old: "", newPwd: "", confirm: "" });
    const [showPwd, setShowPwd] = useState({ old: false, new: false, confirm: false });
    const toast = useToast();

    const strength = (() => {
        const p = form.newPwd;
        if (!p) return { level: 0, label: "", color: "#E6EAF2" };
        let score = 0;
        if (p.length >= 8) score++;
        if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
        if (/\d/.test(p)) score++;
        if (/[^a-zA-Z0-9]/.test(p)) score++;
        const levels = [
            { level: 1, label: "Weak", color: "#EF4444" },
            { level: 2, label: "Fair", color: "#F59E0B" },
            { level: 3, label: "Good", color: "#5B6CFF" },
            { level: 4, label: "Strong", color: "#22C55E" },
        ];
        return levels[score - 1] || { level: 0, label: "", color: "#E6EAF2" };
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.old || !form.newPwd || !form.confirm) {
            toast("Please fill in all fields", "warning");
            return;
        }
        if (form.newPwd !== form.confirm) {
            toast("Passwords do not match", "error");
            return;
        }
        if (form.newPwd.length < 8) {
            toast("Password must be at least 8 characters", "error");
            return;
        }

        const adminUserRaw = localStorage.getItem("adminUser");
        if (!adminUserRaw) {
            toast("Session expired. Please login again.", "error");
            return;
        }
        const adminUser = JSON.parse(adminUserRaw);

        try {
            const res = await fetch("/api/admins", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: adminUser.username,
                    oldPassword: form.old,
                    newPassword: form.newPwd
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast("Password changed successfully!", "success");
                setForm({ old: "", newPwd: "", confirm: "" });
            } else {
                toast(data.error || "Failed to update password", "error");
            }
        } catch (error) {
            toast("Network error occurred", "error");
        }
    };

    const fields = [
        { key: "old", label: "Current Password", placeholder: "Enter current password" },
        { key: "newPwd", label: "New Password", placeholder: "Enter new password" },
        { key: "confirm", label: "Confirm New Password", placeholder: "Confirm new password" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>Change Password</h1>
                <p style={{ fontSize: 14, color: "#94A3B8" }}>Update your account password</p>
            </div>

            <div style={{ maxWidth: 520 }}>
                <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E6EAF2", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", padding: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(91,108,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShieldCheck size={24} color="#5B6CFF" />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#1E293B" }}>Security</div>
                            <div style={{ fontSize: 13, color: "#94A3B8" }}>Ensure your password is strong</div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                        {fields.map((f) => (
                            <div key={f.key}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>{f.label}</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPwd[f.key] ? "text" : "password"}
                                        placeholder={f.placeholder}
                                        value={form[f.key]}
                                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                        style={{
                                            width: "100%",
                                            height: 48,
                                            padding: "0 48px 0 16px",
                                            borderRadius: 14,
                                            border: "1px solid #E6EAF2",
                                            fontSize: 14,
                                            color: "#1E293B",
                                            outline: "none",
                                            transition: "border-color 0.2s, box-shadow 0.2s",
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = "#5B6CFF";
                                            e.target.style.boxShadow = "0 0 0 3px rgba(91,108,255,0.1)";
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = "#E6EAF2";
                                            e.target.style.boxShadow = "none";
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd({ ...showPwd, [f.key]: !showPwd[f.key] })}
                                        style={{
                                            position: "absolute",
                                            right: 12,
                                            top: "35%",
                                            transform: "translateY(-50%)",
                                            border: "none",
                                            background: "none",
                                            cursor: "pointer",
                                            display: "flex",
                                            padding: 4,
                                        }}
                                    >
                                        {showPwd[f.key] ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                                    </button>
                                </div>

                                {/* Strength indicator for new password */}
                                {f.key === "newPwd" && form.newPwd && (
                                    <div style={{ marginTop: 10 }}>
                                        <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        flex: 1,
                                                        height: 4,
                                                        borderRadius: 2,
                                                        background: i <= strength.level ? strength.color : "#E6EAF2",
                                                        transition: "background 0.3s",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: strength.color }}>{strength.label}</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Requirements */}
                        <div style={{ padding: "14px 16px", borderRadius: 14, background: "#F5F7FB", border: "1px solid #F1F5F9" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>Password Requirements</div>
                            {[
                                { text: "At least 8 characters", met: form.newPwd.length >= 8 },
                                { text: "Upper & lowercase letters", met: /[a-z]/.test(form.newPwd) && /[A-Z]/.test(form.newPwd) },
                                { text: "At least one number", met: /\d/.test(form.newPwd) },
                                { text: "At least one special character", met: /[^a-zA-Z0-9]/.test(form.newPwd) },
                            ].map((r) => (
                                <div key={r.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: r.met ? "#22C55E" : "#94A3B8", marginBottom: 4, fontWeight: 500 }}>
                                    <span>{r.met ? "✓" : "○"}</span> {r.text}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                height: 48,
                                borderRadius: 14,
                                border: "none",
                                background: "#5B6CFF",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#4C5DF4")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#5B6CFF")}
                        >
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
