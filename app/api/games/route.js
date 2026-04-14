import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await pool.query(
            "SELECT id, period, game_type, status, result, created_by FROM games ORDER BY id DESC LIMIT 100"
        );
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
