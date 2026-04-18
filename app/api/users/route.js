import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await pool.query("SELECT id, name, username, phone, email, wallet, status, created_by, updated_by FROM users");
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { id, status, walletAction, amount } = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
        }

        if (typeof status !== "undefined") {
            const normalizedStatus = String(status).toLowerCase();
            const allowed = ["active", "suspended"];
            if (!allowed.includes(normalizedStatus)) {
                return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
            }

            await pool.query("UPDATE users SET status = ? WHERE id = ?", [normalizedStatus, id]);

            return NextResponse.json({ success: true, data: { id, status: normalizedStatus } });
        }

        if (typeof walletAction !== "undefined" || typeof amount !== "undefined") {
            const normalizedAction = String(walletAction || "").toLowerCase();
            const parsedAmount = Number(amount);
            const allowedActions = ["credit", "debit"];

            if (!allowedActions.includes(normalizedAction)) {
                return NextResponse.json({ success: false, error: "Invalid wallet action" }, { status: 400 });
            }

            if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                return NextResponse.json({ success: false, error: "Enter a valid amount" }, { status: 400 });
            }

            const [rows] = await pool.query("SELECT wallet FROM users WHERE id = ? LIMIT 1", [id]);
            if (rows.length === 0) {
                return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
            }

            const currentWallet = Number(rows[0].wallet || 0);
            if (normalizedAction === "debit" && currentWallet < parsedAmount) {
                return NextResponse.json({ success: false, error: "Insufficient wallet balance for debit" }, { status: 400 });
            }

            const nextWallet = normalizedAction === "credit"
                ? currentWallet + parsedAmount
                : currentWallet - parsedAmount;

            await pool.query("UPDATE users SET wallet = ? WHERE id = ?", [nextWallet, id]);

            return NextResponse.json({
                success: true,
                data: {
                    id,
                    wallet: nextWallet,
                    walletAction: normalizedAction,
                    amount: parsedAmount,
                },
            });
        }

        return NextResponse.json(
            { success: false, error: "Nothing to update" },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
