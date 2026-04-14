import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../../lib/db";

const MIN_WITHDRAWAL = 100;

function getUserIdFromRequest(req) {
  let token = req.cookies.get("authToken")?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(req) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [[userRow]] = await pool.query(
      "SELECT id, name, wallet FROM users WHERE id = ?",
      [userId]
    );

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [withdrawals] = await pool.query(
      `SELECT id, amount, status, bank_holder, bank_account, bank_ifsc, upi_id, created_by
       FROM withdrawals
       WHERE user_id = ?
       ORDER BY id DESC`,
      [userId]
    );

    return NextResponse.json(
      {
        user: {
          id: userRow.id,
          name: userRow.name,
          wallet: Number(userRow.wallet || 0),
        },
        withdrawals,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch withdrawal data", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amount = Number(body.amount);
  const paymentMethod = body.paymentMethod === "upi" ? "upi" : "bank";
  const bankHolder = (body.bankHolder || "").trim();
  const bankAccount = (body.bankAccount || "").trim();
  const bankIfsc = (body.bankIfsc || "").trim().toUpperCase();
  const upiId = (body.upiId || "").trim().toLowerCase();

  if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) {
    return NextResponse.json(
      { error: `Minimum withdrawal amount is ${MIN_WITHDRAWAL}` },
      { status: 400 }
    );
  }

  if (paymentMethod === "bank") {
    if (!bankHolder || !bankAccount || !bankIfsc) {
      return NextResponse.json(
        { error: "Bank holder, account number and IFSC are required" },
        { status: 400 }
      );
    }
  } else if (!upiId) {
    return NextResponse.json({ error: "UPI ID is required" }, { status: 400 });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [[userRow]] = await connection.query(
      "SELECT id, name, wallet FROM users WHERE id = ? FOR UPDATE",
      [userId]
    );

    if (!userRow) {
      await connection.rollback();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentWallet = Number(userRow.wallet || 0);
    if (amount > currentWallet) {
      await connection.rollback();
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    await connection.query("UPDATE users SET wallet = wallet - ? WHERE id = ?", [
      amount,
      userId,
    ]);

    const finalBankHolder =
      paymentMethod === "bank" ? bankHolder : userRow.name || "UPI User";
    const finalBankAccount = paymentMethod === "bank" ? bankAccount : upiId;
    const finalBankIfsc = paymentMethod === "bank" ? bankIfsc : "UPI";
    const finalUpiId = paymentMethod === "upi" ? upiId : null;

    const [insertResult] = await connection.query(
      `INSERT INTO withdrawals
      (user_id, bank_holder, bank_account, bank_ifsc, upi_id, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        finalBankHolder,
        finalBankAccount,
        finalBankIfsc,
        finalUpiId,
        amount,
      ]
    );

    await connection.commit();

    return NextResponse.json(
      {
        message: "Withdrawal request submitted",
        withdrawalId: insertResult.insertId,
        walletRemaining: currentWallet - amount,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return NextResponse.json(
      { error: "Failed to submit withdrawal", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
