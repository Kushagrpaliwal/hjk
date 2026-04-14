import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
    try {
        // Await params if you are using Next.js 15+
        const { id } = await params; 

        if (!id) {
            return NextResponse.json({ success: false, error: "User id required" }, { status: 400 });
        }

        const [rows] = await pool.query(
            "SELECT id, name, username, phone, email, wallet, status, created_by, updated_by FROM users WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const [[gameStats], [winStats], [depositStats], [withdrawStats]] = await Promise.all([
            pool.query("SELECT COUNT(*) AS total_games FROM user_bets WHERE user_id = ?", [id]),
            pool.query("SELECT COUNT(*) AS total_wins FROM user_bets WHERE user_id = ? AND status = 'won'", [id]),
            pool.query("SELECT COALESCE(SUM(amount), 0) AS total_deposits FROM recharges WHERE user_id = ? AND status = 'approved'", [id]),
            pool.query("SELECT COALESCE(SUM(amount), 0) AS total_withdrawals FROM withdrawals WHERE user_id = ? AND status = 'approved'", [id]),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                ...rows[0],
                stats: {
                    totalGames: Number(gameStats[0]?.total_games || 0),
                    totalWins: Number(winStats[0]?.total_wins || 0),
                    totalDeposits: Number(depositStats[0]?.total_deposits || 0),
                    totalWithdrawals: Number(withdrawStats[0]?.total_withdrawals || 0),
                },
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
