import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { success: false, message: "username is required" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, eventId, eventName, marketId, marketName, sportName, gameType,
              betType, runnerName, oddName, odds, size, stake, status, runnerId, createdAt
       FROM bets
       WHERE username = ?
       ORDER BY createdAt DESC
       LIMIT 20`,
      [username]
    );

    return NextResponse.json({ success: true, bets: rows }, { status: 200 });
  } catch (err) {
    console.error("getBets error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
