import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../../lib/db";

export async function GET(req) {
  try {
    // 1. Token Extraction
    let token = req.cookies.get('authToken')?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // 2. JWT Verification
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // 3. Parallel Database Queries
    // We fetch user info, recharges, withdrawals, and bets simultaneously
    const [
      [userRows],
      [recharges],
      [withdrawals],
      [bets]
    ] = await Promise.all([
      pool.query("SELECT id, name, username, email, phone, wallet, status FROM users WHERE id = ?", [userId]),
      pool.query("SELECT id, amount, status, transaction_id, created_by FROM recharges WHERE user_id = ? ORDER BY created_by DESC", [userId]),
      pool.query("SELECT id, amount, status, bank_holder, created_by FROM withdrawals WHERE user_id = ? ORDER BY created_by DESC", [userId]),
      pool.query("SELECT id, bet_amount, game_type, bet_on, status, result, created_by FROM user_bets WHERE user_id = ? ORDER BY created_by DESC", [userId])
    ]);

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRows[0];

    // 4. Return Combined Data
    return NextResponse.json(
      {
        message: "User profile and history retrieved successfully",
        user: {
          ...user,
          history: {
            recharges: recharges,
            withdrawals: withdrawals,
            bets: bets
          }
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Profile retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}