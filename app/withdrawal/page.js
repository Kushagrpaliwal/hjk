"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "../../components/BottomNav";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  IndianRupee,
  Smartphone,
  Wallet,
} from "lucide-react";

const MIN_WITHDRAWAL = 100;

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WithdrawalPage() {
  const [loadingPage, setLoadingPage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("withdraw");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [toasts, setToasts] = useState([]);

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  function pushToast(type, text) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }

  const balanceAfter = useMemo(() => {
    const amountNumber = Number(amount || 0);
    if (!Number.isFinite(amountNumber)) return balance;
    return balance - amountNumber;
  }, [amount, balance]);

  async function loadWithdrawalData() {
    try {
      const res = await fetch("/api/user-api/withdrawal", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load withdrawal data");
      }

      setBalance(Number(data?.user?.wallet || 0));
      setHistory(Array.isArray(data?.withdrawals) ? data.withdrawals : []);
      if (data?.user?.name) {
        setBankHolder((prev) => prev || data.user.name);
      }
    } catch (error) {
      pushToast("error", error.message);
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    loadWithdrawalData();
  }, []);

  async function handleWithdraw() {
    const amountNumber = Number(amount);

    if (!Number.isFinite(amountNumber) || amountNumber < MIN_WITHDRAWAL) {
      pushToast("error", `Minimum withdrawal amount is Rs ${MIN_WITHDRAWAL}`);
      return;
    }

    if (amountNumber > balance) {
      pushToast("error", "Insufficient balance");
      return;
    }

    if (paymentMethod === "bank" && (!bankHolder || !bankAccount || !ifsc)) {
      pushToast("error", "Bank holder, account number and IFSC are required");
      return;
    }

    if (paymentMethod === "upi" && !upiId) {
      pushToast("error", "UPI ID is required");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/user-api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: amountNumber,
          paymentMethod,
          bankHolder,
          bankAccount,
          bankIfsc: ifsc,
          upiId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit withdrawal");
      }

      pushToast("success", "Withdrawal request submitted");
      setAmount("");
      setBankAccount("");
      setIfsc("");
      setUpiId("");
      await loadWithdrawalData();
      setActiveTab("history");
    } catch (error) {
      pushToast("error", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingPage) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] flex flex-col items-center justify-between p-3 font-sans">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto border rounded-xl px-3 py-2 text-sm shadow-lg backdrop-blur-sm ${
              toast.type === "success"
                ? "bg-green-500/20 border-green-400/50 text-green-200"
                : "bg-red-500/20 border-red-400/50 text-red-200"
            }`}
          >
            {toast.text}
          </div>
        ))}
      </div>

      <div className="flex-1 w-full overflow-y-auto hide-scrollbar">
        <div className="w-full max-w-md mx-auto rounded-3xl p-4 relative pb-24 pt-8">
          <div className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 px-8 py-2 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-white/20">
            <h1 className="text-white font-bold tracking-widest text-sm">WITHDRAWAL</h1>
          </div>

          <div
            className="mb-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-2xl p-4 shadow-lg"
            style={{ marginTop: "50px" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-cyan-400" />
              <p className="text-xs text-slate-300 uppercase tracking-wider">Available Balance</p>
            </div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Rs {balance.toLocaleString("en-IN")}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Withdrawals are processed within 24-48 hours</p>
          </div>

          <div className="flex gap-2 mb-4">
            {[
              { key: "withdraw", label: "Withdraw" },
              { key: "history", label: "History" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    : "bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "withdraw" && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <p className="text-xs text-slate-300 uppercase font-semibold mb-2">Payment Method</p>
                <div className="flex gap-2">
                  {[
                    { key: "bank", label: "Bank Transfer", icon: CreditCard },
                    { key: "upi", label: "UPI", icon: Smartphone },
                  ].map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                        paymentMethod === method.key
                          ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <method.icon size={14} />
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <p className="text-xs text-slate-300 uppercase font-semibold mb-2">Quick Amount</p>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => setAmount(String(value))}
                      className="bg-white/10 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/30 text-white text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      {value >= 1000 ? `${value / 1000}k` : value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <label className="text-xs font-semibold text-slate-300 uppercase">Withdrawal Amount</label>
                <div className="flex items-center gap-2 mt-2">
                  <IndianRupee size={20} className="text-cyan-400" />
                  <input
                    type="number"
                    min={MIN_WITHDRAWAL}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Enter amount (min ${MIN_WITHDRAWAL})`}
                    className="flex-1 bg-white/5 text-white placeholder-slate-500 px-3 py-2 rounded-lg focus:outline-none border border-white/10 focus:border-cyan-400/50"
                  />
                </div>
                {amount && (
                  <p className="text-xs text-slate-400 mt-1">
                    Balance after: Rs {Math.max(0, balanceAfter).toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              {paymentMethod === "bank" && (
                <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase">Account Holder Name</label>
                    <input
                      type="text"
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      placeholder="e.g., John Doe"
                      className="w-full mt-1 bg-white/5 text-white placeholder-slate-500 px-3 py-2 rounded-lg focus:outline-none border border-white/10 focus:border-cyan-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase">Account Number</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Account number"
                      className="w-full mt-1 bg-white/5 text-white placeholder-slate-500 px-3 py-2 rounded-lg focus:outline-none border border-white/10 focus:border-cyan-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g., SBIN0001234"
                      className="w-full mt-1 bg-white/5 text-white placeholder-slate-500 px-3 py-2 rounded-lg focus:outline-none border border-white/10 focus:border-cyan-400/50"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g., yourname@upi"
                      className="w-full mt-2 bg-white/5 text-white placeholder-slate-500 px-3 py-2 rounded-lg focus:outline-none border border-white/10 focus:border-cyan-400/50"
                    />
                  </div>
                </div>
              )}

              <div className="bg-white/5 border border-blue-400/20 rounded-2xl p-3">
                <p className="text-xs text-slate-300 uppercase font-semibold mb-2">Process</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-slate-300">Request enters pending queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-cyan-400" />
                    <span className="text-slate-300">Review and transfer in 24-48 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-yellow-400" />
                    <span className="text-slate-300">Money reaches your selected account</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] disabled:opacity-50 transition-all"
              >
                {submitting ? "Processing..." : "Submit Withdrawal"}
              </button>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-2 flex items-start gap-2">
                <AlertCircle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-300">
                  Minimum withdrawal: Rs {MIN_WITHDRAWAL} | Once submitted, the amount is deducted from wallet.
                </p>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 uppercase font-semibold">Withdrawal History</p>
              {history.length === 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-300">
                  No withdrawals yet.
                </div>
              )}

              {history.map((txn) => {
                const isApproved = txn.status === "approved";
                const isRejected = txn.status === "rejected";
                return (
                  <div
                    key={txn.id}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/10"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center">
                      <Wallet size={18} className="text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        Rs {Number(txn.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(txn.created_by)} | {txn.upi_id ? "UPI" : "Bank"}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full border ${
                        isApproved
                          ? "bg-green-500/20 border-green-500/40"
                          : isRejected
                          ? "bg-red-500/20 border-red-500/40"
                          : "bg-yellow-500/20 border-yellow-500/40"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold ${
                          isApproved
                            ? "text-green-400"
                            : isRejected
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {txn.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md pb-2 fixed bottom-0 left-1/2 -translate-x-1/2">
        <BottomNav />
      </div>
    </div>
  );
}
