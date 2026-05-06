import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT
                id,
                username,
                eventId,
                eventName,
                sportName,
                gameType,
                marketId,
                marketName,
                betType,
                runnerName,
                odds,
                size,
                stake,
                status,
                oddName,
                runnerId,
                createdAt
            FROM bets
            ORDER BY createdAt DESC
        `);

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch sports bets" },
            { status: 500 }
        );
    }
}
