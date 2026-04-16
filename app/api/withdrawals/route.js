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

        // Get withdrawal details first
        const [withdrawal] = await pool.query(
            "SELECT * FROM withdrawals WHERE id = ?",
            [id]
        );

        if (withdrawal.length === 0) {
            return NextResponse.json({ success: false, error: "Withdrawal not found" }, { status: 404 });
        }

        const w = withdrawal[0];

        // Prevent re-processing
        if (w.status !== 'pending') {
            return NextResponse.json({ success: false, error: "Already processed" }, { status: 400 });
        }

        // Update status
        await pool.query(
            "UPDATE withdrawals SET status = ? WHERE id = ?",
            [status.toLowerCase(), id]
        );

        if (status.toLowerCase() === 'approved') {
            // If you already deducted earlier → do nothing here
        }

        if (status.toLowerCase() === 'rejected') {
            // Refund wallet
            await pool.query(
                "UPDATE users SET wallet = wallet + ? WHERE id = ?",
                [w.amount, w.user_id]
            );
        }

        return NextResponse.json({ success: true, message: `Withdrawal ${status}` });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}