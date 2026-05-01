// Per-gmid in-memory cache: odds refresh every 5 seconds
const oddsCache = new Map(); // gmid -> { data, time }
const ODDS_TTL = 5_000; // 5 seconds

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

  // Return cached data if it's less than 5 seconds old
  if (cached && now - cached.time < ODDS_TTL) {
    return Response.json(cached.data, { status: 200 });
  }

  try {
    // Wait for the upstream API, but timeout at 4.5 seconds to prevent polling lag
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `http://46.202.166.160:3009/getPriveteData?gmid=${gmid}&sid=4&key=wwewdaUjbggsf56uibbhyunkhy7nhdrghjhhua`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (cached) return Response.json(cached.data, { status: 200 });
      return Response.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (Array.isArray(data?.data)) {
      data.data = data.data.filter(
        (m) => m.gtype === 'match' || m.gtype === 'match1' || m.gtype === 'fancy'
      );
    }

    // Update cache with new valid data
    oddsCache.set(gmid, { data, time: Date.now() });

    return Response.json(data, { status: 200 });

  } catch (err) {
    // If the 4.5s timeout is hit or network fails, fallback to cache
    if (cached) return Response.json(cached.data, { status: 200 });

    return Response.json(
      { error: 'Upstream timeout or error', details: err.message },
      { status: 500 }
    );
  }
}