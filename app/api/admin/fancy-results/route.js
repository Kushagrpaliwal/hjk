import { NextResponse } from "next/server";
import dbPool from "../../../../lib/db";
import {
  getPendingFancyMarkets,
  upsertFancyResultDeclaration,
} from "../../../../lib/sportsResults";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pendingMarkets = await getPendingFancyMarkets(dbPool);

    return NextResponse.json(
      { success: true, data: pendingMarkets },
      { status: 200 }
    );
  } catch (error) {
    console.error("admin fancy-results GET error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  let body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { eventId, eventName, marketId, marketName, runnerName, result, declaredBy } =
    body;

  if (!marketId || !runnerName) {
    return NextResponse.json(
      { success: false, message: "marketId and runnerName are required" },
      { status: 400 }
    );
  }

  const parsedResult = Number(result);

  if (!Number.isFinite(parsedResult)) {
    return NextResponse.json(
      { success: false, message: "A numeric fancy result is required" },
      { status: 400 }
    );
  }

  try {
    const declaration = await upsertFancyResultDeclaration(
      {
        eventId: eventId ?? null,
        eventName: eventName ?? null,
        marketId,
        marketName: marketName ?? null,
        runnerName,
        resultValue: parsedResult,
        declaredBy: declaredBy ?? null,
      },
      dbPool
    );

    return NextResponse.json(
      {
        success: true,
        message: "Fancy result declared successfully",
        data: declaration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("admin fancy-results POST error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
