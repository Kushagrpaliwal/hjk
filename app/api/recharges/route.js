import pool from "../../../lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, u.username 
            FROM recharges r 
            JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_by DESC
        `);
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        let token = request.cookies.get("authToken")?.value;
        if (!token) {
            const authHeader = request.headers.get("authorization");
            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "your-secret-key-change-in-production"
            );
        } catch (err) {
            return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
        }

        const userId = decoded.userId;
        const formData = await request.formData();
        const amount = Number(formData.get("amount"));
        const transactionId = String(formData.get("transactionId") || "").trim();
        const paymentMode = String(formData.get("paymentMode") || "manual").trim();
        const screenshot = formData.get("screenshot");

        if (!amount || amount <= 0 || !transactionId) {
            return NextResponse.json({ success: false, error: "Amount and transaction ID are required" }, { status: 400 });
        }

        let screenshotPath = null;
        if (screenshot && screenshot.size > 0 && screenshot.name) {
            const bytes = await screenshot.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = path.join(process.cwd(), "public/uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const safeName = screenshot.name.replace(/\s+/g, "-");
            const fileName = `${Date.now()}-${safeName}`;
            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            screenshotPath = `/uploads/${fileName}`;
        }

        const orderNo = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await pool.query(
            "INSERT INTO recharges (user_id, transaction_id, order_no, amount, status, payment_mode, screenshot) VALUES (?, ?, ?, ?, 'pending', ?, ?)",
            [userId, transactionId, orderNo, amount, paymentMode, screenshotPath]
        );

        return NextResponse.json({ success: true, message: "Deposit request submitted" });
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
            "UPDATE recharges SET status = ? WHERE id = ?",
            [status.toLowerCase(), id]
        );

        // If approved, you can also add logic here later to increase user wallet
        if (status.toLowerCase() === 'approved') {
            await pool.query(
                "UPDATE users u JOIN recharges r ON u.id = r.user_id SET u.wallet = u.wallet + r.amount WHERE r.id = ?",
                [id]
            );
        }

        return NextResponse.json({ success: true, message: `Deposit ${status}` });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
