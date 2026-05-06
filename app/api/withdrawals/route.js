import pool from "../../../lib/db";
import { NextResponse } from "next/server";
import {
    ensureTransactionLogTable,
    insertTransactionLog,
} from "../../../lib/transactionLog";

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
        await ensureTransactionLogTable(pool);
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [withdrawal] = await connection.query(
                "SELECT * FROM withdrawals WHERE id = ? FOR UPDATE",
                [id]
            );

            if (withdrawal.length === 0) {
                await connection.rollback();
                return NextResponse.json({ success: false, error: "Withdrawal not found" }, { status: 404 });
            }

            const w = withdrawal[0];

            if (w.status !== "pending") {
                await connection.rollback();
                return NextResponse.json({ success: false, error: "Already processed" }, { status: 400 });
            }

            await connection.query("UPDATE withdrawals SET status = ? WHERE id = ?", [status.toLowerCase(), id]);

            if (status.toLowerCase() === "rejected") {
                const [[userRow]] = await connection.query(
                    "SELECT username, wallet FROM users WHERE id = ? FOR UPDATE",
                    [w.user_id]
                );
                if (!userRow) throw new Error("User not found for withdrawal refund");

                const previousBalance = Number(userRow.wallet || 0);
                const profitLoss = Number(w.amount || 0);
                const currentBalance = previousBalance + profitLoss;

                await connection.query("UPDATE users SET wallet = ? WHERE id = ?", [currentBalance, w.user_id]);
                await insertTransactionLog(connection, {
                    username: userRow.username,
                    previousBalance,
                    profitLoss,
                    currentBalance,
                    transactionType: "WITHDRAWAL_REJECT_REFUND",
                    referenceSource: "withdrawal",
                });
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        return NextResponse.json({ success: true, message: `Withdrawal ${status}` });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}