import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../../../lib/db";

const BETTING_SECONDS = 10;

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

function getRemainingBetTime(gameRow) {
  if (!gameRow?.created_by) {
    return 0;
  }

  const createdAt = new Date(gameRow.created_by).getTime();
  const elapsed = Math.floor((Date.now() - createdAt) / 1000);
  return Math.max(0, BETTING_SECONDS - elapsed);
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

  const betAmount = Number(body.betAmount);
  const betOnSum = Number(body.betOnSum);

  if (!Number.isFinite(betAmount) || betAmount <= 0) {
    return NextResponse.json({ error: "Invalid bet amount" }, { status: 400 });
  }

  if (!Number.isInteger(betOnSum) || betOnSum < 2 || betOnSum > 12) {
    return NextResponse.json(
      { error: "Invalid two dice sum. Use 2 to 12" },
      { status: 400 }
    );
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [[latestGame]] = await connection.query(
      `SELECT id, period, status, created_by
       FROM games
       WHERE game_type = 'two_dice'
       ORDER BY id DESC
       LIMIT 1`
    );

    if (!latestGame) {
      await connection.rollback();
      return NextResponse.json(
        { error: "No active two dice game found" },
        { status: 400 }
      );
    }

    const timeLeft = getRemainingBetTime(latestGame);
    if (Number(latestGame.status) !== 0 || timeLeft <= 2) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Bet window closed for this period" },
        { status: 400 }
      );
    }

    const [[userRow]] = await connection.query(
      `SELECT wallet FROM users WHERE id = ? FOR UPDATE`,
      [userId]
    );

    const wallet = Number(userRow?.wallet || 0);
    if (wallet < betAmount) {
      await connection.rollback();
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    await connection.query(`UPDATE users SET wallet = wallet - ? WHERE id = ?`, [
      betAmount,
      userId,
    ]);

    await connection.query(
      `INSERT INTO user_bets (user_id, bet_amount, game_type, bet_on, status, result)
       VALUES (?, ?, 'two_dice', ?, 'pending', ?)`,
      [userId, betAmount, `sum:${betOnSum}`, latestGame.period]
    );

    await connection.commit();

    return NextResponse.json(
      {
        message: "Two dice bet placed successfully",
        period: latestGame.period,
        betAmount,
        betOnSum,
        wallet: wallet - betAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return NextResponse.json(
      { error: "Failed to place two dice bet", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
