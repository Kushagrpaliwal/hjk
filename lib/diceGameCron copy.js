let started = false;

import pool from "./db.js";

const TOTAL_TIME = 15000;     // 15 sec
const BETTING_TIME = 10000;   // 10 sec

function generatePeriod(prefix = "") {
  return `${prefix}${Date.now()}`;
}

function rollOneDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function rollTwoDice() {
  return `${rollOneDice()},${rollOneDice()}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function gameEngine() {

  while (true) {

    const roundStart = Date.now();

    const onePeriod = generatePeriod("1D-");
    const twoPeriod = generatePeriod("2D-");

    try {

      // 🟢 start betting
      await pool.query(
        `INSERT INTO games (period, game_type, status) VALUES (?, 'one_dice', 0)`,
        [onePeriod]
      );

      await pool.query(
        `INSERT INTO games (period, game_type, status) VALUES (?, 'two_dice', 0)`,
        [twoPeriod]
      );

      console.log("🟢 betting started");

      // wait 10 sec
      await sleep(BETTING_TIME);

      const oneResult = rollOneDice();
      const twoResult = rollTwoDice();

      await pool.query(
        `UPDATE games SET status=1,result=? WHERE period=?`,
        [oneResult, onePeriod]
      );

      await pool.query(
        `UPDATE games SET status=1,result=? WHERE period=?`,
        [twoResult, twoPeriod]
      );

      console.log("🎲 result", oneResult, twoResult);

    } catch (err) {
      console.error(err);
    }

    // 🔒 ensure exact 15s round
    const elapsed = Date.now() - roundStart;
    const wait = TOTAL_TIME - elapsed;

    if (wait > 0) {
      await sleep(wait);
    }

  }
}

export function startDiceGame() {

  if (started) return;
  started = true;

  console.log("🚀 Dice engine started (15s)");

  gameEngine();
}