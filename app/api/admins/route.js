import pool from "../../../lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET() {
    try {
        const [rows] = await pool.query("SELECT id, username,password, qr_code, upi_id, created_by, updated_by FROM admins");
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { username, password } = await request.json();
        const [rows] = await pool.query(
            "SELECT id, username, password FROM admins WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
        }

        const admin = rows[0];
        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
        }

        return NextResponse.json({ success: true, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { username, oldPassword, newPassword } = await request.json();

        const [rows] = await pool.query(
            "SELECT id, password FROM admins WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: false, error: "Invalid current password" }, { status: 401 });
        }

        const admin = rows[0];
        const isValid = await bcrypt.compare(oldPassword, admin.password);
        if (!isValid) {
            return NextResponse.json({ success: false, error: "Invalid current password" }, { status: 401 });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await pool.query(
            "UPDATE admins SET password = ? WHERE username = ?",
            [hashed, username]
        );

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const formData = await request.formData();
        const username = formData.get("username");
        const adminId = formData.get("adminId");
        const upiId = formData.get("upiId");
        const file = formData.get("qrCode");

        if (!username && !adminId) {
            return NextResponse.json({ success: false, error: "Admin identifier required" }, { status: 400 });
        }

        let qrCodePath = null;
        if (file && file.size > 0 && file.name) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = path.join(process.cwd(), "public/uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            qrCodePath = `/uploads/${fileName}`;
        }

        let result;
        if (qrCodePath) {
            if (adminId) {
                [result] = await pool.query(
                    "UPDATE admins SET upi_id = ?, qr_code = ? WHERE id = ?",
                    [upiId, qrCodePath, adminId]
                );
            } else {
                [result] = await pool.query(
                    "UPDATE admins SET upi_id = ?, qr_code = ? WHERE username = ?",
                    [upiId, qrCodePath, username]
                );
            }
        } else {
            if (adminId) {
                [result] = await pool.query(
                    "UPDATE admins SET upi_id = ? WHERE id = ?",
                    [upiId, adminId]
                );
            } else {
                [result] = await pool.query(
                    "UPDATE admins SET upi_id = ? WHERE username = ?",
                    [upiId, username]
                );
            }
        }

        if (!result || result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: "Admin not found or no changes applied" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Payment settings updated", qr_code: qrCodePath });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
