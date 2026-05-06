import dbPool from "./db";
import {
  ensureTransactionLogTable,
  insertSportsTransactionLog,
} from "./transactionLog";

const BET_RESULT_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS bet_result (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eventId VARCHAR(100) DEFAULT NULL,
    eventName VARCHAR(255) DEFAULT NULL,
    marketId VARCHAR(100) NOT NULL,
    marketName VARCHAR(255) DEFAULT NULL,
    runnerName VARCHAR(255) NOT NULL,
    gameType VARCHAR(20) NOT NULL DEFAULT 'fancy',
    resultValue DECIMAL(10,2) NOT NULL,
    declaredBy VARCHAR(100) DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Declared',
    settledBets INT NOT NULL DEFAULT 0,
    declaredAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    settledAt DATETIME DEFAULT NULL,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_manual_result (marketId, runnerName, gameType)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
`;

export async function ensureBetResultTable(pool = dbPool) {
  await pool.query(BET_RESULT_TABLE_SQL);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function computeFancyProfitLoss(bet, declaredResult) {
  const betOdds = toNumber(bet.odds);
  const stakeAmount = toNumber(bet.stake);
  const marketSize = toNumber(bet.size ?? bet.marketSize ?? bet.odds);
  const resultValue = toNumber(declaredResult);

  if (
    betOdds === null ||
    stakeAmount === null ||
    marketSize === null ||
    resultValue === null
  ) {
    throw new Error("Invalid fancy result or bet values");
  }

  const betSideNormalized = String(
    bet.betType ?? bet.bettype ?? ""
  ).toLowerCase();

  const isBackWin = betSideNormalized === "back" && betOdds <= resultValue;
  const isLayWin = betSideNormalized === "lay" && betOdds > resultValue;

  if (isBackWin || isLayWin) {
    const profitWithoutStake = (marketSize / 100) * stakeAmount;
    return profitWithoutStake + stakeAmount;
  }

  return -0;
}

function computeStandardProfitLoss(bet, winnerName) {
  const odds = toNumber(bet.odds);
  const stake = toNumber(bet.stake);
  const normalizedGameType = String(
    bet.gameType ?? bet.gametype ?? ""
  ).toLowerCase();

  if (odds === null || stake === null) {
    throw new Error("Invalid bet odds or stake");
  }

  const isWinner = bet.runnerName === winnerName;
  const betSideNormalized = String(
    bet.betType ?? bet.bettype ?? ""
  ).toLowerCase();
  const isMatchOdds =
    normalizedGameType === "matchodds" ||
    normalizedGameType === "match odds";
  const isBookmaker = normalizedGameType === "bookmaker";

  if (isWinner) {
    if (betSideNormalized === "back") {
      if (isMatchOdds) {
        return ((odds - 1) * stake) / 100 + stake;
      }

      if (isBookmaker) {
        return (stake * odds) / 100 + stake;
      }
    }

    if (betSideNormalized === "lay") {
      return -0;
    }
  } else {
    if (betSideNormalized === "back") {
      return -0;
    }

    if (betSideNormalized === "lay") {
      return stake;
    }
  }

  throw new Error(
    `Unsupported standard market settlement: ${bet.gameType}/${bet.betType}`
  );
}

export async function settlePendingBetsForMarket({
  marketId,
  winnerName,
  gameType,
  runnerName = null,
  pool = dbPool,
}) {
  if (!marketId) {
    throw new Error("marketId is required");
  }

  if (winnerName === undefined || winnerName === null || winnerName === "") {
    throw new Error("winnerName is required");
  }

  const normalizedGameType = String(gameType ?? "").toLowerCase();
  const isFancyMarket = normalizedGameType === "fancy";

  const connection = await pool.getConnection();

  try {
    await ensureTransactionLogTable(pool);
    await connection.beginTransaction();

    const marketFilter =
      isFancyMarket && runnerName ? " AND runnerName = ?" : "";

    const params = isFancyMarket && runnerName ? [marketId, runnerName] : [marketId];

    const [bets] = await connection.query(
      `SELECT * FROM bets WHERE marketId = ?${marketFilter} AND status = 'Pending' FOR UPDATE`,
      params
    );

    if (!bets.length) {
      await connection.rollback();
      return {
        settledCount: 0,
        winner: winnerName,
        status: "no_pending_bets",
      };
    }

    for (const bet of bets) {
      const betTypeNormalized = String(
        bet.gameType ?? bet.gametype ?? ""
      ).toLowerCase();

      const profitLoss =
        betTypeNormalized === "fancy"
          ? computeFancyProfitLoss(bet, winnerName)
          : computeStandardProfitLoss(bet, winnerName);

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
    }

    await connection.commit();

    return {
      settledCount: bets.length,
      winner: winnerName,
      status: "settled",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getPendingFancyMarkets(pool = dbPool) {
  await ensureBetResultTable(pool);

  const [rows] = await pool.query(
    `SELECT
        eventId,
        eventName,
        marketId,
        marketName,
        runnerName,
        COUNT(*) AS totalBets,
        COALESCE(SUM(stake), 0) AS totalStake,
        MIN(createdAt) AS firstBetAt,
        MAX(createdAt) AS lastBetAt
      FROM bets
      WHERE status = 'Pending'
        AND LOWER(gameType) = 'fancy'
        AND NOT EXISTS (
          SELECT 1
          FROM bet_result br
          WHERE br.marketId COLLATE utf8mb4_general_ci
                  <=> bets.marketId COLLATE utf8mb4_general_ci
            AND br.runnerName COLLATE utf8mb4_general_ci
                  <=> bets.runnerName COLLATE utf8mb4_general_ci
            AND LOWER(br.gameType) = 'fancy'
            AND br.status IN ('Declared', 'Settled')
        )
      GROUP BY eventId, eventName, marketId, marketName, runnerName
      ORDER BY lastBetAt DESC`
  );

  return rows;
}

export async function upsertFancyResultDeclaration(
  {
    eventId = null,
    eventName = null,
    marketId,
    marketName = null,
    runnerName,
    resultValue,
    declaredBy = null,
  },
  pool = dbPool
) {
  await ensureBetResultTable(pool);

  if (!marketId || !runnerName) {
    throw new Error("marketId and runnerName are required");
  }

  const parsedResultValue = toNumber(resultValue);

  if (parsedResultValue === null) {
    throw new Error("A numeric fancy result is required");
  }

  await pool.query(
    `INSERT INTO bet_result
      (eventId, eventName, marketId, marketName, runnerName, gameType, resultValue, declaredBy, status, settledBets, settledAt)
     VALUES (?, ?, ?, ?, ?, 'fancy', ?, ?, 'Declared', 0, NULL)
     ON DUPLICATE KEY UPDATE
      eventId = VALUES(eventId),
      eventName = VALUES(eventName),
      marketName = VALUES(marketName),
      resultValue = VALUES(resultValue),
      declaredBy = VALUES(declaredBy),
      status = 'Declared',
      settledBets = 0,
      settledAt = NULL`,
    [
      eventId,
      eventName,
      marketId,
      marketName,
      runnerName,
      parsedResultValue,
      declaredBy,
    ]
  );

  const [rows] = await pool.query(
    `SELECT id, eventId, eventName, marketId, marketName, runnerName, gameType,
            resultValue, declaredBy, status, declaredAt, settledAt, settledBets
     FROM bet_result
     WHERE marketId = ? AND runnerName = ? AND LOWER(gameType) = 'fancy'
     LIMIT 1`,
    [marketId, runnerName]
  );

  return rows[0] ?? null;
}

export async function getDeclaredFancyResults(pool = dbPool) {
  await ensureBetResultTable(pool);

  const [rows] = await pool.query(
    `SELECT id, eventId, eventName, marketId, marketName, runnerName, gameType,
            resultValue, declaredBy, status, declaredAt, settledAt, settledBets
     FROM bet_result
     WHERE LOWER(gameType) = 'fancy' AND status = 'Declared'
     ORDER BY declaredAt ASC`
  );

  return rows;
}

export async function settlePendingBetsFromDeclaredFancyResults(pool = dbPool) {
  await ensureBetResultTable(pool);

  const declaredResults = await getDeclaredFancyResults(pool);
  const outcomes = [];

  for (const declaredResult of declaredResults) {
    try {
      const settlement = await settlePendingBetsForMarket(
        {
          marketId: declaredResult.marketId,
          winnerName: declaredResult.resultValue,
          gameType: "fancy",
          runnerName: declaredResult.runnerName,
          pool,
        }
      );

      const nextStatus =
        settlement.status === "no_pending_bets" ? "Settled" : "Settled";

      await pool.query(
        `UPDATE bet_result
         SET status = ?, settledBets = ?, settledAt = NOW()
         WHERE id = ?`,
        [nextStatus, settlement.settledCount ?? 0, declaredResult.id]
      );

      outcomes.push({
        id: declaredResult.id,
        marketId: declaredResult.marketId,
        runnerName: declaredResult.runnerName,
        resultValue: declaredResult.resultValue,
        settledCount: settlement.settledCount ?? 0,
        status: nextStatus,
      });
    } catch (error) {
      outcomes.push({
        id: declaredResult.id,
        marketId: declaredResult.marketId,
        runnerName: declaredResult.runnerName,
        resultValue: declaredResult.resultValue,
        status: "Error",
        error: error.message,
      });
    }
  }

  return {
    processed: declaredResults.length,
    results: outcomes,
  };
}
