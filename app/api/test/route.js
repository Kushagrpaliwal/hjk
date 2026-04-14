import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await pool.query("SELECT 1");
    return NextResponse.json({ status: "connected" });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}