import pool from "../../../../lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || "2023-08-01";

const getCashfreeBaseUrl = () => {
  const env = (process.env.CASHFREE_ENV || "sandbox").toLowerCase();
  return env === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
};

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

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing order ID" }, { status: 400 });
    }

    const [rechargeRows] = await pool.query(
      "SELECT id, status, amount FROM recharges WHERE order_no = ? AND user_id = ?",
      [orderId, userId]
    );
    if (!rechargeRows.length) {
      return NextResponse.json({ success: false, error: "Recharge not found" }, { status: 404 });
    }

    const recharge = rechargeRows[0];

    const cashfreeResponse = await fetch(`${getCashfreeBaseUrl()}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "x-api-version": CASHFREE_API_VERSION,
      },
    });

    const cashfreeData = await cashfreeResponse.json();
    if (!cashfreeResponse.ok) {
      return NextResponse.json(
        { success: false, error: cashfreeData?.message || "Cashfree status check failed" },
        { status: 502 }
      );
    }

    const orderStatus = String(cashfreeData?.order_status || "").toUpperCase();
    const paidStatuses = ["PAID", "SUCCESS"];
    const rejectedStatuses = ["FAILED", "CANCELLED", "EXPIRED"];

    if (paidStatuses.includes(orderStatus)) {
      if (recharge.status !== "approved") {
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          await connection.query(
            "UPDATE recharges SET status = 'approved' WHERE id = ? AND status <> 'approved'",
            [recharge.id]
          );
          await connection.query("UPDATE users SET wallet = wallet + ? WHERE id = ?", [
            recharge.amount,
            userId,
          ]);
          await connection.commit();
        } catch (err) {
          await connection.rollback();
          throw err;
        } finally {
          connection.release();
        }
      }

      return NextResponse.json({ success: true, status: "approved" });
    }

    if (rejectedStatuses.includes(orderStatus)) {
      if (recharge.status !== "rejected") {
        await pool.query("UPDATE recharges SET status = 'rejected' WHERE id = ?", [recharge.id]);
      }
      return NextResponse.json({ success: true, status: "rejected" });
    }

    return NextResponse.json({ success: true, status: "pending" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
