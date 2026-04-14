// Per-gmid in-memory cache: odds refresh every 3 seconds
const oddsCache = new Map(); // gmid -> { data, time }
const ODDS_TTL = 3_000; // 3 seconds

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const gmid = searchParams.get('gmid');

  if (!gmid) {
    return Response.json(
      { error: 'gmid query parameter is required' },
      { status: 400 }
    );
  }

  const now = Date.now();
  const cached = oddsCache.get(gmid);

  // ✅ Return cached data if still fresh
  if (cached && now - cached.time < ODDS_TTL) {
    return Response.json(cached.data, { status: 200 });
  }

  try {
    const res = await fetch(
      `http://46.202.166.160:3009/getPriveteData?gmid=${gmid}&sid=4&key=knkwdnwqusqnsqlnlnslqnle5557878dwdwdwd`
    );

    // ✅ Fallback to cache if API fails
    if (!res.ok) {
      if (cached) return Response.json(cached.data, { status: 200 });

      return Response.json(
        { error: `Upstream error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // ✅ KEEP ONLY MATCH_ODDS & Bookmaker
    if (Array.isArray(data?.data)) {
      data.data = data.data.filter(
        (m) =>
          m.gtype === 'match' ||       // MATCH_ODDS
          m.gtype === 'match1' ||    // Bookmaker
          m.gtype === 'fancy'
      );
    }

    // ✅ Store in cache
    oddsCache.set(gmid, { data, time: now });

    return Response.json(data, { status: 200 });

  } catch (err) {
    // ✅ Serve stale cache on error
    if (cached) return Response.json(cached.data, { status: 200 });

    return Response.json(
      {
        error: 'Failed to fetch matchbook data',
        details: err.message,
      },
      { status: 500 }
    );
  }
}