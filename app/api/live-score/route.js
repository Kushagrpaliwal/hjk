import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const gmid = searchParams.get("gmid");

  if (!gmid) {
    return NextResponse.json(
      { ok: false, message: "gmid is required" },
      { status: 400 }
    );
  }

  try {
    const url = `https://score.akamaized.uk/diamond-live-score?gmid=${encodeURIComponent(
      gmid
    )}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const html = await res.text();
    const hasErrorTitle =
      html.includes("<title>Error</title>") || html.includes(">Error<");

    return NextResponse.json({ ok: !hasErrorTitle }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
