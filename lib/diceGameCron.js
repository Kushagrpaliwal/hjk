import cron from "node-cron";
import pool from "./db.js";

const BETTING_TIME = 10000;

// prevent multiple runs (VERY IMPORTANT)
if (!global.diceCronStarted) {

  global.diceCronStarted = true;

  function emitDiceUpdate(payload) {
    const io = globalThis.io;
    if (io) {
      io.emit("dice:state", payload);
    }
  }

  function generatePeriod(prefix = "") {
    return `${prefix}${Date.now()}`;
  }

  function rollOneDice() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function rollTwoDice() {
    return `${rollOneDice()},${rollOneDice()}`;
  }

  cron.schedule('*/15 * * * * *', async () => {

    const onePeriod = generatePeriod("1D-");
    const twoPeriod = generatePeriod("2D-");

    console.log("🟢 Betting start", onePeriod);

    try {
      await pool.query(
        `INSERT INTO games (period, game_type, status) VALUES (?, 'one_dice', 0)`,
        [onePeriod]
      );

      await pool.query(
        `INSERT INTO games (period, game_type, status) VALUES (?, 'two_dice', 0)`,
        [twoPeriod]
      );

      emitDiceUpdate({ phase: "betting", onePeriod, twoPeriod });

      setTimeout(async () => {
        try {
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

          emitDiceUpdate({
            phase: "result",
            onePeriod,
            twoPeriod,
            oneResult,
            twoResult,
          });

          console.log("🎲 Result", oneResult, twoResult);

        } catch (err) {
          console.error(err);
        }
      }, BETTING_TIME);

    } catch (err) {
      console.error(err);
    }

  });

  console.log("🚀 Dice cron started inside Next.js");
}
