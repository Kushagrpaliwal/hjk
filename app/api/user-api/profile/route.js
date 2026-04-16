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
    const username = decoded.username; // ⚠️ required for new bets table

    // 3. Parallel Database Queries
    const [
      [userRows],
      [recharges],
      [withdrawals],
      [userBets],
      [newBets] // 👈 new table
    ] = await Promise.all([
      pool.query(
        "SELECT id, name, username, email, phone, wallet, status FROM users WHERE id = ?",
        [userId]
      ),
      pool.query(
        "SELECT id, amount, status, transaction_id, created_by FROM recharges WHERE user_id = ? ORDER BY created_by DESC",
        [userId]
      ),
      pool.query(
        "SELECT id, amount, status, bank_holder, created_by FROM withdrawals WHERE user_id = ? ORDER BY created_by DESC",
        [userId]
      ),
      pool.query(
        "SELECT id, bet_amount, game_type, bet_on, status, result, created_by FROM user_bets WHERE user_id = ? ORDER BY created_by DESC",
        [userId]
      ),
      pool.query(
        `SELECT id, eventName, sportName, gameType, betType, runnerName, odds, stake, status, createdAt 
         FROM bets 
         WHERE username = ? 
         ORDER BY createdAt DESC`,
        [username]
      )
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
            recharges,
            withdrawals,
            bets: userBets,       // old bets
            sportsbookBets: newBets // 👈 new bets table
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