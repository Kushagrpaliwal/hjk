import pool from "../../../lib/db";

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return Response.json(
      { success: false, message: "username is required" },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  try {
    const {
      event_id,
      event_name,
      market_id,
      market_name,
      sportName = "Cricket",
      match_type,
      betType,
      runnerName,
      oddName,
      odds,
      size,
      stake,
      runnerId,
      client_ref,
      sport_id,
    } = body;

    // ✅ Validation
    if (!match_type || !betType || !runnerName || !odds || !stake) {
      return Response.json(
        { success: false, message: "Missing required bet fields" },
        { status: 400 }
      );
    }

    const stakeAmount = Number(stake);
    if (!Number.isFinite(stakeAmount) || stakeAmount <= 0) {
      return Response.json(
        { success: false, message: "Invalid stake amount" },
        { status: 400 }
      );
    }

    if (stakeAmount < 10) {
      return Response.json(
        { success: false, message: "Minimum bet amount is 10" },
        { status: 400 }
      );
    }

    const parsedOdds = Number(odds);
    if (!Number.isFinite(parsedOdds)) {
      return Response.json(
        { success: false, message: "Invalid odds value" },
        { status: 400 }
      );
    }

    const normalizedMatchType = String(match_type || "").toLowerCase();
    const normalizedBetType = String(betType || "").toLowerCase();

    let walletDeductionAmount = stakeAmount;

    if (normalizedBetType === "lay") {
      if (normalizedMatchType === "matchodds") {
        walletDeductionAmount = ((parsedOdds - 1) * stakeAmount) / 100;
      } else if (normalizedMatchType === "bookmaker") {
        walletDeductionAmount = (stakeAmount * parsedOdds) / 100;
      }
    }

    if (
      !Number.isFinite(walletDeductionAmount) ||
      walletDeductionAmount <= 0
    ) {
      return Response.json(
        { success: false, message: "Invalid wallet deduction amount" },
        { status: 400 }
      );
    }

    const normalizeNumber = (value) => {
      if (value === undefined || value === null || value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const eventIdValue = normalizeNumber(event_id);
    const marketIdValue = normalizeNumber(market_id);
    const sizeValue = normalizeNumber(size);
    const normalizedMarketName =
      market_name || (match_type === "FANCY" ? runnerName : null);

    let connection;

    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // 🔒 Lock user row
      const [[userRow]] = await connection.query(
        "SELECT id, wallet FROM users WHERE username = ? FOR UPDATE",
        [username]
      );

      if (!userRow) {
        await connection.rollback();
        return Response.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      const wallet = Number(userRow.wallet || 0);

      if (wallet < walletDeductionAmount) {
        await connection.rollback();
        return Response.json(
          { success: false, message: "Insufficient balance" },
          { status: 400 }
        );
      }

      // ✅ Duplicate check ONLY for external API
      const [existingBets] = await connection.query(
       `SELECT id FROM bets
        WHERE eventId <=> ?
        AND marketName <=> ?
        AND gameType = ?
        LIMIT 1`,
        [
        eventIdValue,
        runnerName,
        match_type
        ]
      );

      const isDuplicateBet = existingBets.length > 0;

      // 💰 Deduct wallet
      await connection.query(
        "UPDATE users SET wallet = wallet - ? WHERE id = ?",
        [walletDeductionAmount, userRow.id]
      );

      // 📝 Insert bet (ALWAYS)
      const [result] = await connection.query(
        `INSERT INTO bets 
          (username, eventId, eventName, sportName, gameType, betType, runnerName, marketName, oddName, odds, size, stake, marketId, runnerId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          username,
          eventIdValue,
          event_name || null,
          sportName,
          match_type,
          betType,
          runnerName,
          normalizedMarketName,
          oddName || null,
          parsedOdds,
          sizeValue,
          stakeAmount,
          marketIdValue,
          runnerId || null,
        ]
      );

      await connection.commit();

      // 🌐 External API Call (only if NOT duplicate)
      let externalOk = false;

      if (!isDuplicateBet) {
        const externalApiUrl =
          "https://dia-results.cricketid.xyz/api/bet-incoming";

        const externalApiKey =
          process.env.DIA_RESULTS_API_KEY ||
          process.env.NEXT_PUBLIC_SPORTS_API_KEY;

        if (externalApiKey) {
          const payload = {
            ...(eventIdValue !== null ? { event_id: eventIdValue } : {}),
            ...(event_name ? { event_name } : {}),
            ...(marketIdValue !== null ? { market_id: marketIdValue } : {}),
            ...(normalizedMarketName
              ? { market_name: normalizedMarketName }
              : {}),
            market_type: match_type,
            client_ref: "dicerush99.com",
            api_key: externalApiKey,
            sport_id: sport_id ? String(sport_id) : "4",
          };

          try {
            const externalRes = await fetch(externalApiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

            externalOk = externalRes.ok;
          } catch (e) {
            console.error("External API error:", e);
          }
        } else {
          console.warn("API key missing");
        }
      } else {
        console.log("Duplicate bet → external API skipped");
      }

      // ✅ Final Response
      return Response.json(
        {
          success: true,
          betId: result.insertId,
          externalOk,
          duplicate: isDuplicateBet,
          message: "Bet placed successfully",
          walletRemaining: wallet - walletDeductionAmount,
        },
        { status: 201 }
      );
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) connection.release();
    }
  } catch (err) {
    console.error("addBets error:", err);
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
