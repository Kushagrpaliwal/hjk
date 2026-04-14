import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT b.*, u.username 
            FROM user_bets b 
            JOIN users u ON b.user_id = u.id 
            ORDER BY b.created_by DESC
        `);
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
