"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

export default function DepositsPage() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("/api/recharges")
            .then(res => res.json())
            .then(resData => {
                if (resData.success) {
                    const formatted = resData.data.map(d => ({
                        id: String(d.id),
                        player: d.username || "N/A",
                        amount: Number(d.amount || 0).toLocaleString(),
                        utr: d.transaction_id || d.order_no || "N/A",
                        date: new Date(d.created_by).toLocaleString(),
                        status: d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Pending",
                        screenshot: d.screenshot || ""
                    }));
                    setData(formatted);
                }
            })
            .catch(console.error);
    }, []);
    const [rejectModal, setRejectModal] = useState({ open: false, id: null });
    const [rejectReason, setRejectReason] = useState("");
    const [previewImg, setPreviewImg] = useState(null);
    const toast = useToast();

    const handleApprove = async (id) => {
        try {
            const res = await fetch("/api/recharges", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "approved" })
            });
            const dbRef = await res.json();

            if (dbRef.success) {
                setData((prev) => prev.map((d) => (d.id === String(id) ? { ...d, status: "Approved" } : d)));
                toast("Deposit approved and wallet credited!", "success");
            } else {
                toast(dbRef.error || "Failed to approve deposit", "error");
            }
        } catch (error) {
            console.error(error);
            toast("An error occurred", "error");
        }
    };

    const handleReject = async () => {
        try {
            const res = await fetch("/api/recharges", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: rejectModal.id, status: "rejected" })
            });
            const dbRef = await res.json();

            if (dbRef.success) {
                setData((prev) => prev.map((d) => (d.id === String(rejectModal.id) ? { ...d, status: "Rejected" } : d)));
                setRejectModal({ open: false, id: null });
                setRejectReason("");
                toast("Deposit rejected.", "error");
            } else {
                toast(dbRef.error || "Failed to reject deposit", "error");
            }
        } catch (error) {
            console.error(error);
            toast("An error occurred", "error");
        }
    };

    const columns = [
        { key: "id", label: "Deposit ID", render: (v) => <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "#5B6CFF" }}>{v}</span> },
        { key: "player", label: "Player Name" },
        { key: "amount", label: "Amount", render: (v) => <span style={{ fontWeight: 700, color: "#22C55E" }}>+{v}</span> },
        { key: "utr", label: "UTR Number", render: (v) => <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "#64748B" }}>{v}</span> },
        {
            key: "screenshot",
            label: "Screenshot",
            render: (value) =>
                value ? (
                    <button
                        onClick={() => setPreviewImg(value)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 14px",
                            borderRadius: 10,
                            border: "1px solid #E6EAF2",
                            background: "#FAFBFD",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#5B6CFF",
                            cursor: "pointer",
                        }}
                    >
                        <ImageIcon size={14} /> View
                    </button>
                ) : (
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>No file</span>
                ),
        },
        { key: "date", label: "Date", render: (v) => <span style={{ color: "#94A3B8", fontSize: 13 }}>{v}</span> },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) =>
                row.status === "Pending" ? (
                    <div style={{ display: "flex", gap: 6 }}>
                        <button
                            onClick={() => handleApprove(row.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 14px",
                                borderRadius: 10,
                                border: "none",
                                background: "rgba(34,197,94,0.08)",
                                color: "#16A34A",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.15s",
                            }}
                        >
                            <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                            onClick={() => setRejectModal({ open: true, id: row.id })}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 14px",
                                borderRadius: 10,
                                border: "none",
                                background: "rgba(239,68,68,0.08)",
                                color: "#DC2626",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.15s",
                            }}
                        >
                            <XCircle size={14} /> Reject
                        </button>
                    </div>
                ) : (
                    <span style={{ fontSize: 13, color: "#94A3B8" }}>N/A</span>
                ),
        },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, minHeight: 0, minWidth: 0 }}>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>Deposit Requests</h1>
                <p style={{ fontSize: 14, color: "#94A3B8" }}>Review and process pending deposit requests</p>
            </div>

            {/* Summary Cards */}
            <div className="dep-summary-grid">
                {[
                    { label: "Pending", count: data.filter((d) => d.status === "Pending").length, color: "#F59E0B", bg: "rgba(245,158,11,0.06)" },
                    { label: "Approved", count: data.filter((d) => d.status === "Approved").length, color: "#22C55E", bg: "rgba(34,197,94,0.06)" },
                    { label: "Rejected", count: data.filter((d) => d.status === "Rejected").length, color: "#EF4444", bg: "rgba(239,68,68,0.06)" },
                ].map((s) => (
                    <div key={s.label} style={{ background: "#fff", borderRadius: 20, padding: "20px 24px", border: "1px solid #E6EAF2", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "#1E293B" }}>{s.count}</div>
                            <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{s.label} Deposits</div>
                        </div>
                    </div>
                ))}
            </div>

            <DataTable columns={columns} data={data} flexWrapper={true} />

            <style>{`
                .dep-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
                @media (max-width: 768px) { .dep-summary-grid { grid-template-columns: 1fr; gap: 12px; } }
            `}</style>

            {/* Reject Modal */}
            <Modal
                isOpen={rejectModal.open}
                onClose={() => setRejectModal({ open: false, id: null })}
                title="Reject Deposit"
            >
                <p style={{ fontSize: 14, color: "#64748B", marginBottom: 16 }}>
                    Please provide a reason for rejecting this deposit request.
                </p>
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    rows={3}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 14,
                        border: "1px solid #E6EAF2",
                        fontSize: 14,
                        color: "#1E293B",
                        outline: "none",
                        resize: "vertical",
                        marginBottom: 20,
                    }}
                />
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                        onClick={() => setRejectModal({ open: false, id: null })}
                        style={{ padding: "10px 22px", borderRadius: 12, border: "1px solid #E6EAF2", background: "#fff", fontSize: 13.5, fontWeight: 500, color: "#64748B", cursor: "pointer" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReject}
                        style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: "#EF4444", fontSize: 13.5, fontWeight: 600, color: "#fff", cursor: "pointer", transition: "background 0.15s" }}
                    >
                        Reject Deposit
                    </button>
                </div>
            </Modal>

            {/* Preview Modal */}
            <Modal isOpen={!!previewImg} onClose={() => setPreviewImg(null)} title="Payment Screenshot" maxWidth={400}>
                <div style={{ textAlign: "center", padding: 20 }}>
                    <div
                        style={{
                            width: "100%",
                            height: 240,
                            borderRadius: 16,
                            background: "#F5F7FB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #E6EAF2",
                            overflow: "hidden",
                        }}
                    >
                        {previewImg ? (
                            <img src={previewImg} alt="Payment screenshot" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        ) : (
                            <div style={{ textAlign: "center", color: "#94A3B8" }}>
                                <ImageIcon size={48} strokeWidth={1.2} />
                                <div style={{ fontSize: 13, marginTop: 8 }}>Payment Receipt</div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
