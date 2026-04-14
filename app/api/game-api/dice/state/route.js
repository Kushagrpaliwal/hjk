import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../../../lib/db";

const BETTING_SECONDS = 10;
const ROUND_SECONDS = 15;

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

function getRemainingSeconds(gameRow) {
  if (!gameRow?.created_by) {
    return BETTING_SECONDS;
  }

  const createdAt = new Date(gameRow.created_by).getTime();
  const elapsed = Math.floor((Date.now() - createdAt) / 1000);

  if (Number(gameRow.status) === 0) {
    return Math.max(0, BETTING_SECONDS - elapsed);
  }

  return Math.max(0, ROUND_SECONDS - elapsed);
}

async function settlePendingDiceBets(connection) {
  const [pendingBets] = await connection.query(
    `SELECT
      ub.id,
      ub.user_id,
      ub.bet_amount,
      ub.bet_on,
      g.result AS game_result
    FROM user_bets ub
    INNER JOIN games g ON ub.result = g.period
    WHERE ub.game_type = 'one_dice'
      AND g.game_type = 'one_dice'
      AND ub.bet_on REGEXP '^[1-6]$'
      AND ub.status = 'pending'
      AND g.status = 1
      AND g.result IS NOT NULL`
  );

  for (const bet of pendingBets) {
    const gameResult = Number(bet.game_result);
    const betOnNumber = Number(bet.bet_on);
    const isWon = betOnNumber === gameResult;

    const [updateBet] = await connection.query(
      `UPDATE user_bets
      SET status = ?, result = ?
      WHERE id = ? AND status = 'pending'`,
      [isWon ? "won" : "lost", String(gameResult), bet.id]
    );

    if (updateBet.affectedRows > 0 && isWon) {
      const payout = Number(bet.bet_amount) * 6;
      await connection.query(
        `UPDATE users SET wallet = wallet + ? WHERE id = ?`,
        [payout, bet.user_id]
      );
    }
  }
}

export async function GET(req) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    await settlePendingDiceBets(connection);
    await connection.commit();

    const [[latestGame]] = await connection.query(
      `SELECT id, period, status, result, created_by
      FROM games
      WHERE game_type = 'one_dice'
      ORDER BY id DESC
      LIMIT 1`
    );

    const [historyRows] = await connection.query(
      `SELECT period, result
      FROM games
      WHERE game_type = 'one_dice' AND result IS NOT NULL
      ORDER BY id DESC
      LIMIT 8`
    );

    const [[userRow]] = await connection.query(
      `SELECT wallet FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const periodForCheck = latestGame?.period || "";
    const [currentBets] = await connection.query(
      `SELECT id, bet_amount, bet_on, status
      FROM user_bets
      WHERE user_id = ?
        AND game_type = 'one_dice'
        AND status = 'pending'
        AND result = ?
        AND bet_on REGEXP '^[1-6]$'
      ORDER BY id DESC`,
      [userId, periodForCheck]
    );

    const roundHistory = historyRows.map((row) => Number(row.result)).filter(Boolean);
    const timeLeft = getRemainingSeconds(latestGame);
    const canBet = Number(latestGame?.status) === 0 && timeLeft > 2;

    return NextResponse.json(
      {
        period: latestGame?.period || null,
        timeLeft,
        canBet,
        isRolling: Number(latestGame?.status) === 1,
        lastResult: roundHistory[0] || null,
        roundHistory,
        wallet: userRow?.wallet ? Number(userRow.wallet) : 0,
        currentBet: currentBets[0] || null,
        currentBets,
      },
      { status: 200 }
    );
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return NextResponse.json(
      { error: "Failed to fetch dice state", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
