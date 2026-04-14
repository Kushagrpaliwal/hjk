import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "../../../../lib/db";

export async function POST(req) {
  try {
    const { name, email, phone, password, confirmPassword } = await req.json();
    // username will be derived from name
    const username = name;

    // Validate required fields
    if (!name || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists (using email, derived username, or phone)
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR username = ? OR phone = ?",
      [email, username, phone]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email or username or phone already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database (username same as name)
    const [result] = await pool.query(
      "INSERT INTO users (name, username, email, phone, password, wallet, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, username, email, phone, hashedPassword, 0.0, "active"]
    );

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: result.insertId,
        user: {
          id: result.insertId,
          name,
          username,
          email,
          phone,
          wallet: 0.0,
          status: "active",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
