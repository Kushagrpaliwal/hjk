import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [legacyBetsResult, sportsBetsResult] = await Promise.all([
            pool.query(`
                SELECT b.*, u.username
                FROM user_bets b
                JOIN users u ON b.user_id = u.id
                ORDER BY b.created_by DESC
            `),
            pool.query(`
                SELECT
                    id,
                    username,
                    eventName,
                    sportName,
                    gameType,
                    betType,
                    runnerName,
                    marketName,
                    odds,
                    stake,
                    status,
                    createdAt
                FROM bets
                ORDER BY createdAt DESC
            `),
        ]);

        const legacyBets = legacyBetsResult[0].map((bet) => ({
            ...bet,
            bet_amount: Number(bet.bet_amount || 0),
            status: String(bet.status || "").toLowerCase(),
            created_by: bet.created_by,
            source: "casino",
            sourceLabel: "Casino",
            details: `${bet.game_type || "Game"} (${bet.bet_on || "N/A"})`,
        }));

        const sportsBets = sportsBetsResult[0].map((bet) => ({
            ...bet,
            bet_amount: Number(bet.stake || 0),
            status: String(bet.status || "").toLowerCase(),
            created_by: bet.createdAt,
            source: "sports",
            sourceLabel: "Sports",
            details: [bet.eventName, bet.runnerName, bet.betType]
                .filter(Boolean)
                .join(" | "),
        }));

        const rows = [...legacyBets, ...sportsBets].sort(
            (a, b) =>
                new Date(b.created_by || 0).getTime() -
                new Date(a.created_by || 0).getTime()
        );

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
