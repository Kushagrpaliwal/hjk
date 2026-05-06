import dbPool from "../../../lib/db";
import {
  ensureTransactionLogTable,
  insertSportsTransactionLog,
} from "../../../lib/transactionLog";

export const dynamic = "force-dynamic";

const AUTO_RUN_INTERVAL_MS = 60_000;
const AUTO_RUN_META_KEY = "__diceResultAutoRunMeta";

const autoRunMeta =
  globalThis[AUTO_RUN_META_KEY] ||
  (globalThis[AUTO_RUN_META_KEY] = { interval: undefined, started: false });

let lastRunResult = { success: true, processed: 0, results: [] };
let cycleRunning = false;

function getStandardProfitLoss(bet, winnerName) {
  const betOdds = Number(bet.odds);
  const stakeAmt = Number(bet.stake);
  const normalizedGameType = String(
    bet.gameType ?? bet.gametype ?? ""
  ).toLowerCase();
  const betSideNormalized = String(
    bet.betType ?? bet.bettype ?? ""
  ).toLowerCase();

  if (!Number.isFinite(betOdds) || !Number.isFinite(stakeAmt)) {
    throw new Error("Invalid bet odds or stake");
  }

  const isWinner = bet.runnerName === winnerName;
  const isMatchOdds =
    normalizedGameType === "matchodds" ||
    normalizedGameType === "match odds";
  const isBookmaker = normalizedGameType === "bookmaker";

  if (isWinner) {
    if (betSideNormalized === "back") {
      if (isMatchOdds) {
        return ((betOdds - 1) * stakeAmt) + stakeAmt;
      }

      if (isBookmaker) {
        return (stakeAmt * betOdds) / 100 + stakeAmt;
      }
    } else if (betSideNormalized === "lay") {
      return -0;
    }
  } else {
    if (betSideNormalized === "back") {
      return -0;
    }

    if (betSideNormalized === "lay") {
      return stakeAmt;
    }
  }

  throw new Error(
    `Unsupported standard market settlement: ${bet.gameType}/${bet.betType}`
  );
}

async function processPendingMarkets() {
  const pool = dbPool;
  await ensureTransactionLogTable(pool);

  const pendingQuery = `
    SELECT DISTINCT eventId, eventName, marketId, marketName, gameType, runnerName
    FROM bets
    WHERE status = 'Pending'
  `;

  const [pendingMarkets] = await pool.query(pendingQuery);

  if (pendingMarkets.length === 0) {
    return {
      success: true,
      message: "No pending bets.",
      processed: 0,
      results: [],
    };
  }

  const results = [];

  for (const market of pendingMarkets) {
    const marketId = market.marketId;

    try {
      const eventId = market.eventId;
      const eventName = market.eventName;
      const marketName = market.marketName;
      const marketType = market.gameType;
      const normalizedMarketType = String(marketType ?? "").toLowerCase();
      const apiMarketType = normalizedMarketType
        ? normalizedMarketType.toUpperCase()
        : marketType ?? "";

      const runnerName = market.runnerName;
      const isFancyMarket = normalizedMarketType === "fancy";

      const apiMarketName = isFancyMarket
        ? runnerName ?? marketName
        : marketName;

      const externalRes = await fetch(
        `https://dia-results.cricketid.xyz/api/get-result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: eventId,
            event_name: eventName,
            market_id: marketId,
            market_name: apiMarketName,
            market_type: apiMarketType,
            client_ref: "dicerush99.com",
          }),
        }
      );

      const data = await externalRes.json();

      console.log(`[getResult] API response for marketId=${marketId}:`, data);

      if (!externalRes.ok || !data) {
        results.push({ market_id: marketId, action: "invalid_api" });
        continue;
      }

      const winnerName =
        data?.winner ??
        data?.data?.winner ??
        data?.final_result ??
        data?.data?.final_result ??
        null;

      if (!winnerName) {
        results.push({ market_id: marketId, action: "no_winner" });
        continue;
      }
      const connection = await pool.getConnection();
      let settledCount = 0;

      try {
        await connection.beginTransaction();
        const marketFilter =
          isFancyMarket && runnerName ? " AND runnerName = ?" : "";
        const betParams =
          isFancyMarket && runnerName ? [marketId, runnerName] : [marketId];
        const [bets] = await connection.query(
          `SELECT * FROM bets WHERE marketId = ?${marketFilter} AND status = 'Pending' FOR UPDATE`,
          betParams
        );

        if (!bets.length) {
          await connection.rollback();
          results.push({ market_id: marketId, action: "no_bets" });
          continue;
        }

        for (const bet of bets) {
          const betTypeNormalized = String(
            bet.gameType ?? bet.gametype ?? ""
          ).toLowerCase();

          const betSideNormalized = String(
            bet.betType ?? bet.bettype ?? ""
          ).toLowerCase();

          let profitLoss = 0;

          if (betTypeNormalized === "fancy") {
            const betOdds = Number(bet.odds);
            const stakeAmt = Number(bet.stake);
            const marketSize = Number(bet.marketSize || bet.size || bet.odds);
            const winnerValue = Number(winnerName);

            if (isNaN(winnerValue)) {
              results.push({
                market_id: marketId,
                action: "invalid_fancy_result",
              });
              continue;
            }

            const isBackWin =
              betSideNormalized === "back" && betOdds <= winnerValue;
            const isLayWin = betSideNormalized === "lay" && betOdds > winnerValue;

            if (isBackWin || isLayWin) {
              const profitWithoutStake = (marketSize / 100) * stakeAmt;
              profitLoss = profitWithoutStake + stakeAmt;
            } else {
              profitLoss = -0;
            }
          } else {
            profitLoss = getStandardProfitLoss(bet, winnerName);
          }

          const [[userWalletRow]] = await connection.query(
            `SELECT wallet FROM users WHERE username = ? FOR UPDATE`,
            [bet.username]
          );

          if (!userWalletRow) {
            throw new Error(`User not found for settlement: ${bet.username}`);
          }

          const previousBalance = Number(userWalletRow.wallet || 0);
          const currentBalance = previousBalance + Number(profitLoss || 0);

          await connection.query(
            `UPDATE users SET wallet = ? WHERE username = ?`,
            [currentBalance, bet.username]
          );

          const nextStatus = profitLoss > 0 ? "Won" : "Lost";
          await connection.query(`UPDATE bets SET status = ? WHERE id = ?`, [
            nextStatus,
            bet.id,
          ]);

          await insertSportsTransactionLog(connection, {
            betId: bet.id,
            username: bet.username,
            eventId: bet.eventId ?? null,
            eventName: bet.eventName ?? null,
            marketId: bet.marketId ?? null,
            marketName: bet.marketName ?? null,
            gameType: bet.gameType ?? null,
            betType: bet.betType ?? null,
            runnerName: bet.runnerName ?? null,
            odds: Number(bet.odds || 0),
            stake: Number(bet.stake || 0),
            previousBalance,
            profitLoss: Number(profitLoss || 0),
            currentBalance,
            transactionType: "BET_SETTLED",
            betStatus: nextStatus,
          });

          settledCount += 1;
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      results.push({
        market_id: marketId,
        action: "settled",
        winner: winnerName,
        settledCount,
      });
    } catch (err) {
      console.error("Market error:", err);
      results.push({ market_id: marketId, error: err.message });
    }
  }

  return {
    success: true,
    processed: pendingMarkets.length,
    results,
  };
}

async function executeCycle() {
  if (cycleRunning) {
    return lastRunResult;
  }

  cycleRunning = true;

  try {
    lastRunResult = await processPendingMarkets();
  } catch (err) {
    console.error("Cron cycle error:", err);
    lastRunResult = { success: false, message: err.message, results: [] };
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
      console.log("[getResult cron] starting cycle");
      const result = await executeCycle();
      console.log(
        `[getResult cron] done: processed=${result?.processed ?? 0}`
      );
    } catch (err) {
      console.error("Auto-run error:", err);
    }
  };

  autoRunMeta.interval = setInterval(runSafely, AUTO_RUN_INTERVAL_MS);
  autoRunMeta.interval?.unref?.();

  runSafely();
}

scheduleAutoRun();

export async function GET() {
  console.log("[manual trigger]");
  const result = await executeCycle();
  return Response.json(result);
}
