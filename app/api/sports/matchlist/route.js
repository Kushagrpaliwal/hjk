import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = "http://46.202.166.160:3009/esid?sid=4&key=wwewdaUjbggsf56uibbhyunkhy7nhdrghjhhua";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

// In-memory cache
let cache = {
    data: null,
    expiresAt: 0,
};

export async function GET() {
    const now = Date.now();

    // 1. Return from cache if still valid
    if (cache.data && now < cache.expiresAt) {
        console.log('Serving from in-memory cache');
        return NextResponse.json(cache.data);
    }

    // 2. Fetch from external API
    try {
        console.log('Fetching from external API');
        const response = await fetch(EXTERNAL_API_URL);

        if (!response.ok) {
            throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // 3. Store in memory with expiry
        cache = {
            data,
            expiresAt: now + CACHE_TTL_MS,
        };
        console.log('Cached API response for 10 minutes');

        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to fetch match list:', error.message);

        // Return stale cache if available, better than nothing
        if (cache.data) {
            console.log('Returning stale cache due to API error');
            return NextResponse.json(cache.data);
        }

        return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 });
    }
}
