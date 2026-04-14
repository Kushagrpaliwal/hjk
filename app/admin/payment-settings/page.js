"use client";
import { useState, useEffect } from "react";
import { Upload, Save, Clock } from "lucide-react";
import { useToast } from "../components/Toast";

export default function PaymentSettingsPage() {
    const [upiId, setUpiId] = useState("");
    const [depositsEnabled, setDepositsEnabled] = useState(true);
    const [qrFile, setQrFile] = useState(null);
    const [currentQr, setCurrentQr] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetch("/api/admins")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data.length > 0) {
                    const adminUserRaw = localStorage.getItem("adminUser");
                    const adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null;
                    const admin = data.data.find(a => a.id === adminUser?.id) ||
                        data.data.find(a => a.username === adminUser?.username) ||
                        data.data[0];
                    if (admin) {
                        setUpiId(admin.upi_id || "");
                        setCurrentQr(admin.qr_code || null);
                        setLastUpdated(admin.updated_by);
                    }
                }
            })
            .catch(console.error);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const adminUserRaw = localStorage.getItem("adminUser");
            const adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null;
            const username = adminUser?.username || "admin";

            const formData = new FormData();
            formData.append("username", username);
            if (adminUser?.id) {
                formData.append("adminId", adminUser.id);
            }
            formData.append("upiId", upiId);
            if (qrFile) {
                formData.append("qrCode", qrFile);
            }

            const res = await fetch("/api/admins", {
                method: "PUT",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                toast("Payment settings updated successfully!", "success");
                if (data.qr_code) {
                    setCurrentQr(data.qr_code);
                    setQrFile(null);
                }
                setLastUpdated(new Date().toISOString());
            } else {
                toast(data.error || "Failed to update", "error");
            }
        } catch (error) {
            console.error(error);
            toast("An error occurred", "error");
        }
        setIsSaving(false);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setQrFile(e.target.files[0]);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>Payment Settings</h1>
                <p style={{ fontSize: 14, color: "#94A3B8" }}>Configure payment methods and options</p>
            </div>

            <div className="payment-grid">
                {/* QR Code */}
                <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E6EAF2", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", padding: 28 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>QR Code</h3>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>Upload payment QR code for deposits</p>

                    {currentQr && !qrFile && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
                            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8, fontWeight: 500 }}>Current QR Code</div>
                            <img src={currentQr} alt="Current QR" style={{ width: 140, height: 140, objectFit: "contain", borderRadius: 12, border: "1px solid #E6EAF2" }} />
                        </div>
                    )}

                    <div style={{ position: "relative" }}>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                            style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                opacity: 0,
                                cursor: "pointer",
                                zIndex: 10
                            }}
                        />
                        <div
                            style={{
                                width: "100%",
                                height: currentQr && !qrFile ? 140 : 260,
                                borderRadius: 20,
                                border: "2px dashed #E6EAF2",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                                transition: "all 0.2s",
                                background: qrFile ? "#F0F9FF" : "#FAFBFD",
                                borderColor: qrFile ? "#3B82F6" : "#E6EAF2",
                            }}
                        >
                            <div style={{ width: 56, height: 56, borderRadius: 16, background: qrFile ? "rgba(59,130,246,0.1)" : "rgba(91,108,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Upload size={24} color={qrFile ? "#3B82F6" : "#5B6CFF"} />
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: qrFile ? "#1E3A8A" : "#1E293B", marginBottom: 2 }}>
                                    {qrFile ? qrFile.name : (currentQr ? "Click to replace QR code" : "Click to upload QR code")}
                                </div>
                                {!qrFile && <div style={{ fontSize: 12, color: "#94A3B8" }}>PNG, JPG up to 5MB</div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* UPI Settings */}
                <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E6EAF2", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", padding: 28 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>Payment Configuration</h3>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>Update your payment details</p>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>UPI ID</label>
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            style={{ width: "100%", height: 48, padding: "0 16px", borderRadius: 14, border: "1px solid #E6EAF2", fontSize: 14, color: "#1E293B", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
                            onFocus={(e) => { e.target.style.borderColor = "#5B6CFF"; e.target.style.boxShadow = "0 0 0 3px rgba(91,108,255,0.1)"; }}
                            onBlur={(e) => { e.target.style.borderColor = "#E6EAF2"; e.target.style.boxShadow = "none"; }}
                        />
                    </div>
                    <div style={{ marginBottom: 32 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 12 }}>Deposits</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <button
                                onClick={() => setDepositsEnabled(!depositsEnabled)}
                                style={{ width: 52, height: 28, borderRadius: 14, border: "none", background: depositsEnabled ? "#5B6CFF" : "#E6EAF2", position: "relative", cursor: "pointer", transition: "background 0.25s" }}
                            >
                                <div style={{ width: 22, height: 22, borderRadius: 11, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", position: "absolute", top: 3, left: depositsEnabled ? 27 : 3, transition: "left 0.25s" }} />
                            </button>
                            <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>{depositsEnabled ? "Deposits Enabled" : "Deposits Disabled"}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 14, border: "none", background: "#5B6CFF", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#4C5DF4")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#5B6CFF")}
                    >
                        <Save size={16} /> Save Settings
                    </button>
                </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E6EAF2", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", padding: "18px 24px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Clock size={16} color="#94A3B8" />
                <span style={{ fontSize: 13, color: "#94A3B8" }}>
                    Last updated: <strong style={{ color: "#1E293B" }}>{lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}</strong>
                </span>
            </div>

            <style>{`
        .payment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .payment-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
        </div>
    );
}
