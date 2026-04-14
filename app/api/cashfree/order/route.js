import pool from "../../../../lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || "2023-08-01";

const getCashfreeBaseUrl = () => {
  const env = (process.env.CASHFREE_ENV || "sandbox").toLowerCase();
  return env === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
};

const getAppBaseUrl = () =>
  process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const getAuthUserId = (request) => {
  let token = request.cookies.get("authToken")?.value;
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

export async function POST(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, error: "Cashfree configuration missing" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const amount = Number(body?.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Enter a valid amount" }, { status: 400 });
    }

    const [userRows] = await pool.query(
      "SELECT id, name, email, phone FROM users WHERE id = ?",
      [userId]
    );
    if (!userRows.length) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const user = userRows[0];
    const orderId = `CF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const returnUrl = `${getAppBaseUrl()}/deposit?order_id=${orderId}`;

    const orderPayload = {
      order_id: orderId,
      order_amount: Number(amount.toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: String(user.id),
        customer_name: user.name || "Player",
        customer_email: user.email || "support@example.com",
        customer_phone: user.phone || "9999999999",
      },
      order_meta: {
        return_url: returnUrl,
      },
      order_note: "Wallet top-up",
    };

    const cashfreeResponse = await fetch(`${getCashfreeBaseUrl()}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "x-api-version": CASHFREE_API_VERSION,
      },
      body: JSON.stringify(orderPayload),
    });

    const cashfreeData = await cashfreeResponse.json();
    if (!cashfreeResponse.ok) {
      return NextResponse.json(
        { success: false, error: cashfreeData?.message || "Cashfree order failed" },
        { status: 502 }
      );
    }

    await pool.query(
      "INSERT INTO recharges (user_id, transaction_id, order_no, amount, status, payment_mode, screenshot) VALUES (?, ?, ?, ?, 'pending', ?, NULL)",
      [userId, orderId, orderId, amount, "cashfree_upi"]
    );

    return NextResponse.json({
      success: true,
      order_id: cashfreeData.order_id,
      payment_session_id: cashfreeData.payment_session_id,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
