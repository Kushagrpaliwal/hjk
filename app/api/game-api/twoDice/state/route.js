import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../../../lib/db";

const BETTING_SECONDS = 10;
const ROUND_SECONDS = 15;

/* ---------------- AUTH ---------------- */
function getUserIdFromRequest(req) {
  let token = req.cookies.get("authToken")?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
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
  } catch {
    return null;
  }
}

/* ---------------- TIMER ---------------- */
function getRemainingSeconds(gameRow) {
  if (!gameRow?.created_by) return BETTING_SECONDS;

  const createdAt = new Date(gameRow.created_by).getTime();
  const elapsed = Math.floor((Date.now() - createdAt) / 1000);

  if (Number(gameRow.status) === 0) {
    return Math.max(0, BETTING_SECONDS - elapsed);
  }

  return Math.max(0, ROUND_SECONDS - elapsed);
}

/* ---------------- PARSER (FIXED) ---------------- */
function parseTwoDiceResult(raw) {
  if (!raw || typeof raw !== "string") return null;

  const parts = raw.split(",");

  if (parts.length !== 2) return null;

  const dice1 = Number(parts[0].trim());
  const dice2 = Number(parts[1].trim());

  if (
    !Number.isInteger(dice1) ||
    !Number.isInteger(dice2) ||
    dice1 < 1 || dice1 > 6 ||
    dice2 < 1 || dice2 > 6
  ) {
    return null;
  }

  return { dice1, dice2, sum: dice1 + dice2 };
}

/* ---------------- SETTLEMENT ---------------- */
async function settlePendingTwoDiceBets(connection) {
  const [pendingBets] = await connection.query(`
    SELECT
      ub.id,
      ub.user_id,
      ub.bet_amount,
      ub.bet_on,
      g.result AS game_result
    FROM user_bets ub
    INNER JOIN games g ON ub.result = g.period
    WHERE ub.game_type = 'two_dice'
      AND ub.status = 'pending'
      AND ub.bet_on LIKE 'sum:%'
      AND g.game_type = 'two_dice'
      AND g.status = 1
      AND g.result IS NOT NULL
  `);

  for (const bet of pendingBets) {
    const parsedResult = parseTwoDiceResult(bet.game_result);
    const betOnSum = Number(String(bet.bet_on).replace("sum:", ""));

    if (!parsedResult || !Number.isInteger(betOnSum)) {
      await connection.query(
        `UPDATE user_bets SET status = 'lost', result = '' WHERE id = ?`,
        [bet.id]
      );
      continue;
    }

    const isWon = betOnSum === parsedResult.sum;

    const [updateBet] = await connection.query(
      `UPDATE user_bets
       SET status = ?, result = ?
       WHERE id = ? AND status = 'pending'`,
      [isWon ? "won" : "lost", String(parsedResult.sum), bet.id]
    );

    if (updateBet.affectedRows > 0 && isWon) {
      const payout = Number(bet.bet_amount) * 2;
      await connection.query(
        `UPDATE users SET wallet = wallet + ? WHERE id = ?`,
        [payout, bet.user_id]
      );
    }
  }
}

/* ---------------- API ---------------- */
export async function GET(req) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    /* ✅ SETTLE FIRST */
    await connection.beginTransaction();
    await settlePendingTwoDiceBets(connection);
    await connection.commit();

    /* ✅ LATEST GAME */
    const [[latestGame]] = await connection.query(`
      SELECT id, period, status, result, created_by
      FROM games
      WHERE game_type = 'two_dice'
      ORDER BY id DESC
      LIMIT 1
    `);

    /* ✅ HISTORY */
    const [historyRows] = await connection.query(`
      SELECT period, result
      FROM games
      WHERE game_type = 'two_dice' AND result IS NOT NULL
      ORDER BY id DESC
      LIMIT 8
    `);

    /* ✅ USER WALLET */
    const [[userRow]] = await connection.query(
      `SELECT wallet FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    /* ✅ CURRENT BETS */
    const periodForCheck = latestGame?.period || "";
    const [currentBets] = await connection.query(
      `SELECT id, bet_amount, bet_on, status
       FROM user_bets
       WHERE user_id = ?
         AND game_type = 'two_dice'
         AND status = 'pending'
         AND result = ?
         AND bet_on LIKE 'sum:%'
       ORDER BY id DESC`,
      [userId, periodForCheck]
    );

    /* ✅ PARSE HISTORY */
    const parsedHistory = historyRows
      .map((row) => parseTwoDiceResult(row.result))
      .filter(Boolean);

    /* ✅ FIXED LAST RESULT LOGIC */
    let parsedLatest = null;

    if (latestGame?.result) {
      parsedLatest = parseTwoDiceResult(latestGame.result);
    }

    if (!parsedLatest && parsedHistory.length > 0) {
      parsedLatest = parsedHistory[0];
    }

    /* DEBUG */
    console.log("RAW RESULT:", latestGame?.result);
    console.log("PARSED LATEST:", parsedLatest);

    /* ✅ TIMER */
    const timeLeft = getRemainingSeconds(latestGame);
    const canBet = Number(latestGame?.status) === 0 && timeLeft > 2;

    return NextResponse.json({
      period: latestGame?.period || null,
      timeLeft,
      canBet,
      isRolling: Number(latestGame?.status) === 1,

      /* ✅ FINAL FIX */
      lastResults: parsedLatest || { dice1: 1, dice2: 1, sum: 2 },

      roundHistory: parsedHistory,

      wallet: userRow?.wallet ? Number(userRow.wallet) : 0,
      currentBet: currentBets[0] || null,
      currentBets,
    });

  } catch (error) {
    if (connection) await connection.rollback();

    return NextResponse.json(
      { error: "Failed to fetch two dice state", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}