import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        betId,
        username,
        eventId,
        eventName,
        marketId,
        marketName,
        gameType,
        betType,
        runnerName,
        odds,
        stake,
        previousBalance,
        profitLoss,
        currentBalance,
        transactionType,
        referenceSource,
        createdAt
      FROM transaction_log
      ORDER BY createdAt DESC
    `);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transaction log" },
      { status: 500 }
    );
  }
}
