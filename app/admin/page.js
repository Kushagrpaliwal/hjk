"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gem, User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem("adminUser", JSON.stringify(data.admin));
                document.cookie = "adminAuth=1; path=/; max-age=86400; samesite=lax";
                router.push("/admin/dashboard");
            } else {
                setError(data.error || "Invalid username or password");
            }
        } catch (err) {
            setError("Network error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100dvh",
                background: "#F5F7FB",
                fontFamily: "'Inter', sans-serif",
                padding: "24px",
            }}
        >
            {/* Login Card Wrapper */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "440px",
                    animation: "loginFadeIn 0.5s ease-out forwards",
                }}
            >
                {/* Logo / Brand */}
                <div style={{ textAlign: "center", marginBottom: "36px" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "56px",
                            height: "56px",
                            borderRadius: "18px",
                            background: "linear-gradient(135deg, #667EEA, #764BA2)",
                            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                            marginBottom: "20px",
                        }}
                    >
                        <Gem size={26} color="#fff" />
                    </div>
                    <h1
                        style={{
                            fontSize: "26px",
                            fontWeight: 800,
                            color: "#1E293B",
                            letterSpacing: "-0.02em",
                            marginBottom: "8px",
                            lineHeight: 1.2,
                        }}
                    >
                        Welcome Back
                    </h1>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#94A3B8",
                            fontWeight: 400,
                            margin: 0,
                        }}
                    >
                        Sign in to your admin control panel
                    </p>
                </div>

                {/* Card */}
                <div
                    style={{
                        background: "#FFFFFF",
                        borderRadius: "24px",
                        border: "1px solid #E6EAF2",
                        padding: "32px",
                        boxShadow:
                            "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
                    }}
                >
                    {/* Error Message */}
                    {error && (
                        <div
                            style={{
                                background: "#FEF2F2",
                                border: "1px solid #FECACA",
                                borderRadius: "14px",
                                padding: "12px 16px",
                                marginBottom: "24px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                animation: "loginShake 0.4s ease-out",
                            }}
                        >
                            <span
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    background: "#FEF2F2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px",
                                    flexShrink: 0,
                                }}
                            >
                                ⚠
                            </span>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "#EF4444",
                                    fontWeight: 500,
                                    margin: 0,
                                }}
                            >
                                {error}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Username Field */}
                        <div style={{ marginBottom: "20px" }}>
                            <label
                                htmlFor="login-username"
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#1E293B",
                                    marginBottom: "8px",
                                }}
                            >
                                Username
                            </label>
                            <div style={{ position: "relative" }}>
                                <div
                                    style={{
                                        position: "absolute",
                                        left: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#94A3B8",
                                        display: "flex",
                                        alignItems: "center",
                                        pointerEvents: "none",
                                    }}
                                >
                                    <User size={18} strokeWidth={1.8} />
                                </div>
                                <input
                                    id="login-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField("username")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px 14px 46px",
                                        background: focusedField === "username" ? "#FFFFFF" : "#F8FAFC",
                                        border: `1.5px solid ${focusedField === "username" ? "#5B6CFF" : "#E6EAF2"}`,
                                        borderRadius: "14px",
                                        fontSize: "14px",
                                        color: "#1E293B",
                                        outline: "none",
                                        transition: "all 0.2s ease",
                                        fontFamily: "'Inter', sans-serif",
                                        boxShadow: focusedField === "username"
                                            ? "0 0 0 3px rgba(91, 108, 255, 0.08)"
                                            : "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: "28px" }}>
                            <label
                                htmlFor="login-password"
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#1E293B",
                                    marginBottom: "8px",
                                }}
                            >
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <div
                                    style={{
                                        position: "absolute",
                                        left: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#94A3B8",
                                        display: "flex",
                                        alignItems: "center",
                                        pointerEvents: "none",
                                    }}
                                >
                                    <Lock size={18} strokeWidth={1.8} />
                                </div>
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    style={{
                                        width: "100%",
                                        padding: "14px 50px 14px 46px",
                                        background: focusedField === "password" ? "#FFFFFF" : "#F8FAFC",
                                        border: `1.5px solid ${focusedField === "password" ? "#5B6CFF" : "#E6EAF2"}`,
                                        borderRadius: "14px",
                                        fontSize: "14px",
                                        color: "#1E293B",
                                        outline: "none",
                                        transition: "all 0.2s ease",
                                        fontFamily: "'Inter', sans-serif",
                                        boxShadow: focusedField === "password"
                                            ? "0 0 0 3px rgba(91, 108, 255, 0.08)"
                                            : "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "14px",
                                        top: "35%",
                                        transform: "translateY(-50%)",
                                        background: "transparent",
                                        border: "none",
                                        color: "#94A3B8",
                                        cursor: "pointer",
                                        padding: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        transition: "color 0.2s ease",
                                        borderRadius: "6px",
                                    }}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} strokeWidth={1.8} />
                                    ) : (
                                        <Eye size={18} strokeWidth={1.8} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "14px 24px",
                                background: "linear-gradient(135deg, #667EEA, #764BA2)",
                                border: "none",
                                borderRadius: "14px",
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#FFFFFF",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                fontFamily: "'Inter', sans-serif",
                                letterSpacing: "0.2px",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.85 : 1,
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        style={{
                                            animation: "spin 1s linear infinite",
                                        }}
                                    />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} strokeWidth={2.2} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p
                    style={{
                        textAlign: "center",
                        marginTop: "28px",
                        fontSize: "12px",
                        color: "#94A3B8",
                    }}
                >
                    Protected area · Authorized personnel only
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
