import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT w.*, u.username 
            FROM withdrawals w 
            JOIN users u ON w.user_id = u.id 
            ORDER BY w.created_by DESC
        `);
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        await pool.query(
            "UPDATE withdrawals SET status = ? WHERE id = ?",
            [status.toLowerCase(), id]
        );

        // If approved, you can subtract from the user's wallet
        if (status.toLowerCase() === 'approved') {
            await pool.query(
                "UPDATE users u JOIN withdrawals w ON u.id = w.user_id SET u.wallet = u.wallet - w.amount WHERE w.id = ?",
                [id]
            );
        }

        return NextResponse.json({ success: true, message: `Withdrawal ${status}` });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
