"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { Upload, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import BottomNav from "../../components/BottomNav";

export default function DepositPage() {
  const [method, setMethod] = useState("manual");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedQuick, setSelectedQuick] = useState(null);
  const [adminPayment, setAdminPayment] = useState({ upi_id: "", qr_code: "" });
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cashfreeReady, setCashfreeReady] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState(false);
  const [verifiedOrderId, setVerifiedOrderId] = useState("");
  const [notice, setNotice] = useState({ type: "", message: "" });
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("order_id");
  const cashfreeMode =
    process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox";

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  useEffect(() => {
    let mounted = true;
    fetch("/api/admins")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.success && data.data.length > 0) {
          const admin = data.data[0];
          setAdminPayment({ upi_id: admin.upi_id || "", qr_code: admin.qr_code || "" });
        }
      })
      .catch(console.error)
      .finally(() => mounted && setLoadingPayment(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  useEffect(() => {
    if (!orderIdParam || orderIdParam === verifiedOrderId) return;
    setVerifiedOrderId(orderIdParam);
    setMethod("gateway");
    setVerifyingOrder(true);
    setNotice({ type: "", message: "" });

    const verifyOrder = async () => {
      try {
        const res = await fetch("/api/cashfree/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderIdParam }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Payment verification failed");
        }

        if (data.status === "approved") {
          setNotice({ type: "success", message: "Payment successful. Wallet updated." });
        } else if (data.status === "rejected") {
          setNotice({ type: "error", message: "Payment failed or cancelled." });
        } else {
          setNotice({ type: "error", message: "Payment pending. Please refresh later." });
        }
      } catch (err) {
        setNotice({ type: "error", message: err.message });
      } finally {
        setVerifyingOrder(false);
      }
    };

    verifyOrder();
  }, [orderIdParam, verifiedOrderId]);

  const formattedAmount = useMemo(() => {
    const numeric = Number(amount || 0);
    if (!numeric) return "Rs. 0";
    return `Rs. ${numeric.toLocaleString()}`;
  }, [amount]);

  const handleCopy = async () => {
    if (!adminPayment.upi_id) return;
    try {
      await navigator.clipboard.writeText(adminPayment.upi_id);
      setNotice({ type: "success", message: "UPI ID copied" });
    } catch (err) {
      setNotice({ type: "error", message: "Copy failed" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice({ type: "", message: "" });

    if (!amount || Number(amount) <= 0) {
      setNotice({ type: "error", message: "Enter a valid amount" });
      return;
    }

    if (method === "gateway") {
      const gatewayError = await handleGateway();
      if (gatewayError) {
        setNotice({ type: "error", message: gatewayError });
      }
      return;
    }

    if (method === "manual") {
      if (!transactionId.trim()) {
        setNotice({ type: "error", message: "Transaction ID is required" });
        return;
      }

      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("amount", amount);
        formData.append("transactionId", transactionId.trim());
        formData.append("paymentMode", "manual");
        if (screenshot) formData.append("screenshot", screenshot);

        const res = await fetch("/api/recharges", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to submit deposit");
        }

        setNotice({ type: "success", message: "Deposit request submitted" });
        setAmount("");
        setTransactionId("");
        setScreenshot(null);
        setSelectedQuick(null);
      } catch (err) {
        setNotice({ type: "error", message: err.message });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleGateway = async () => {
    if (!cashfreeReady || typeof window === "undefined" || typeof window.Cashfree !== "function") {
      return "Cashfree gateway is still loading. Please try again.";
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cashfree/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to start Cashfree payment");
      }

      const cashfree = window.Cashfree({ mode: cashfreeMode });
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self",
      });
      return "";
    } catch (err) {
      return err.message;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
        onLoad={() => setCashfreeReady(true)}
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_55%)]" />

      <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-10">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Wallet Top-up</p>
          <h1 className="text-3xl font-extrabold text-slate-900">Deposit Funds</h1>
          <p className="text-sm text-slate-500">Choose a method and submit your payment details securely.</p>
        </div>

        <div className="mb-6 flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {[
            { key: "manual", label: "Manual UPI" },
            { key: "gateway", label: "Instant Gateway" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setMethod(item.key)}
              className={`flex-1 rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                method === item.key
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</label>
              <div className="mt-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-2xl font-semibold text-slate-900 outline-none"
                  placeholder="0"
                />
                <span className="text-xs font-semibold uppercase text-slate-400">INR</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {quickAmounts.map((amt) => {
                  const active = selectedQuick === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(String(amt));
                        setSelectedQuick(amt);
                      }}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-700"
                      }`}
                    >
                      +Rs. {amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {method === "manual" ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="h-28 w-28 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {loadingPayment ? (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Loading...</div>
                      ) : adminPayment.qr_code ? (
                        <img src={adminPayment.qr_code} alt="QR" className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No QR</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <p className="text-xs font-semibold uppercase text-slate-400">UPI ID</p>
                      <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                        {adminPayment.upi_id || "Not available"}
                      </p>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600"
                        disabled={!adminPayment.upi_id}
                      >
                        <Copy size={14} /> Copy UPI ID
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Enter your transaction reference"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upload Screenshot (optional)</label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex h-14 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600">
                      <Upload size={16} /> Choose file
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        className="hidden"
                        onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      />
                    </label>
                    {previewUrl && (
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Cashfree UPI Gateway</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Complete your deposit instantly using any UPI app through the Cashfree
                    payment page.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span
                    className={`rounded-full px-3 py-1 ${
                      cashfreeReady
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {cashfreeReady ? "Gateway ready" : "Loading gateway..."}
                  </span>
                  {verifyingOrder && (
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
                      Verifying payment...
                    </span>
                  )}
                </div>
              </div>
            )}

            {notice.message && (
              <div
                className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
                  notice.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {notice.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{notice.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || verifyingOrder}
              className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? "Submitting..."
                : method === "gateway"
                  ? `Pay via Cashfree UPI (${formattedAmount})`
                  : `Submit Deposit (${formattedAmount})`}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          Make sure your transaction ID matches the payment you made. Deposits are reviewed and approved by the admin.
        </div>
      </div>

      <div className="fixed bottom-0 w-full">
        <div className="mx-auto max-w-2xl border-t border-slate-200 bg-white/90 px-4 pb-6 pt-3 backdrop-blur">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
