import { NextResponse } from "next/server";
import dbPool from "../../../lib/db";
import { settlePendingBetsFromDeclaredFancyResults } from "../../../lib/sportsResults";

export const dynamic = "force-dynamic";

const AUTO_RUN_INTERVAL_MS = 30_000;
const AUTO_RUN_META_KEY = "__manualFancyResultAutoRunMeta";

const autoRunMeta =
  globalThis[AUTO_RUN_META_KEY] ||
  (globalThis[AUTO_RUN_META_KEY] = { interval: undefined, started: false });

let lastRunResult = { processed: 0, results: [] };
let cycleRunning = false;

async function runManualSettlement() {
  return settlePendingBetsFromDeclaredFancyResults(dbPool);
}

async function executeCycle() {
  if (cycleRunning) {
    return lastRunResult;
  }

  cycleRunning = true;

  try {
    lastRunResult = await runManualSettlement();
  } catch (error) {
    console.error("Manual fancy cron cycle error:", error);
    lastRunResult = { processed: 0, results: [], message: error.message };
    throw error;
  } finally {
    cycleRunning = false;
  }

  return lastRunResult;
}

function scheduleAutoRun() {
  if (autoRunMeta.started) return;

  autoRunMeta.started = true;

  const runSafely = async () => {
    try {
      console.log("[getManualResult cron] starting cycle");
      const result = await executeCycle();
      console.log(
        `[getManualResult cron] done: processed=${result?.processed ?? 0}`
      );
    } catch (error) {
      console.error("Manual fancy auto-run error:", error);
    }
  };

  autoRunMeta.interval = setInterval(runSafely, AUTO_RUN_INTERVAL_MS);
  autoRunMeta.interval?.unref?.();

  runSafely();
}

scheduleAutoRun();

export async function GET() {
  try {
    const result = await executeCycle();
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("getManualResult GET error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await executeCycle();
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("getManualResult POST error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
