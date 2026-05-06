import dbPool from "./db";

const TRANSACTION_LOG_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS transaction_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    betId INT DEFAULT NULL,
    username VARCHAR(100) NOT NULL,
    eventId VARCHAR(100) DEFAULT NULL,
    eventName VARCHAR(255) DEFAULT NULL,
    marketId VARCHAR(100) DEFAULT NULL,
    marketName VARCHAR(255) DEFAULT NULL,
    gameType VARCHAR(50) DEFAULT NULL,
    betType VARCHAR(20) DEFAULT NULL,
    runnerName VARCHAR(255) DEFAULT NULL,
    odds DECIMAL(10,2) DEFAULT NULL,
    stake DECIMAL(10,2) DEFAULT NULL,
    previousBalance DECIMAL(12,2) NOT NULL DEFAULT 0,
    profitLoss DECIMAL(12,2) NOT NULL DEFAULT 0,
    currentBalance DECIMAL(12,2) NOT NULL DEFAULT 0,
    transactionType VARCHAR(40) NOT NULL,
    betStatus VARCHAR(20) DEFAULT NULL,
    referenceSource VARCHAR(40) NOT NULL DEFAULT 'sports',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_transaction_log_username (username),
    KEY idx_transaction_log_betId (betId),
    KEY idx_transaction_log_market (marketId),
    KEY idx_transaction_log_createdAt (createdAt)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
`;

export async function ensureTransactionLogTable(pool = dbPool) {
  await pool.query(TRANSACTION_LOG_TABLE_SQL);
}

export async function insertSportsTransactionLog(
  connection,
  payload
) {
  return insertTransactionLog(connection, { ...payload, referenceSource: "sports" });
}

export async function insertTransactionLog(
  connection,
  {
    betId = null,
    username,
    eventId = null,
    eventName = null,
    marketId = null,
    marketName = null,
    gameType = null,
    betType = null,
    runnerName = null,
    odds = null,
    stake = null,
    previousBalance = 0,
    profitLoss = 0,
    currentBalance = 0,
    transactionType,
    betStatus = null,
    referenceSource = "sports",
  }
) {
  await connection.query(
    `INSERT INTO transaction_log
      (betId, username, eventId, eventName, marketId, marketName, gameType, betType, runnerName, odds, stake,
       previousBalance, profitLoss, currentBalance, transactionType, betStatus, referenceSource)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      betId,
      username,
      eventId,
      eventName,
      marketId,
      marketName,
      gameType,
      betType,
      runnerName,
      odds,
      stake,
      previousBalance,
      profitLoss,
      currentBalance,
      transactionType,
      betStatus,
      referenceSource,
    ]
  );
}
