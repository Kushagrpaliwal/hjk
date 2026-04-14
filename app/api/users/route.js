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
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, error: "id and status are required" }, { status: 400 });
        }

        const normalizedStatus = String(status).toLowerCase();
        const allowed = ["active", "suspended"];
        if (!allowed.includes(normalizedStatus)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        await pool.query("UPDATE users SET status = ? WHERE id = ?", [normalizedStatus, id]);

        return NextResponse.json({ success: true, data: { id, status: normalizedStatus } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
