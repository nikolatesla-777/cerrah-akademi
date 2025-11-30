import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the SERVICE ROLE key for admin access (writing to DB)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Fallback to anon (will fail if RLS blocks)

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BASE_URL = 'https://v3.football.api-sports.io';

// League IDs (API-Football)
const LEAGUES = [
    203, // Süper Lig (TR)
    39,  // Premier League (EN)
    140, // La Liga (ES)
    78,  // Bundesliga (DE)
    135, // Serie A (IT)
    61   // Ligue 1 (FR)
];

// Helper to upsert match into DB
async function upsertMatch(match) {
    const { fixture, teams, goals, league } = match;
    const status = fixture.status;

    // Map Status
    let dbStatus = 'NOT_STARTED';
    const shortStatus = status?.short;

    if (['1H', 'HT', '2H', 'ET', 'P', 'BT'].includes(shortStatus)) dbStatus = 'LIVE';
    else if (['FT', 'AET', 'PEN'].includes(shortStatus)) dbStatus = 'FINISHED';
    else if (['PST', 'CANC', 'ABD'].includes(shortStatus)) dbStatus = 'CANCELLED';

    // Prepare Data
    const fixtureData = {
        id: String(fixture.id), // Use API ID as internal ID (Deterministic & Stable)
        external_id: fixture.id,
        home_team: teams.home.name,
        away_team: teams.away.name,
        home_team_logo: teams.home.logo,
        away_team_logo: teams.away.logo,
        league: league.name,
        league_logo: league.logo,
        match_time: fixture.date,
        status: dbStatus,
        minute: fixture.status.elapsed, // Live minute
        score: dbStatus === 'NOT_STARTED' ? '-' : `${goals.home ?? 0}-${goals.away ?? 0}`,
    };

    // Upsert into DB
    const { error } = await supabase
        .from('fixtures')
        .upsert(fixtureData, { onConflict: 'external_id' });

    if (error) {
        console.error('Supabase Upsert Error:', error.message, fixtureData);
    } else {
        if (dbStatus === 'FINISHED') {
            console.log(`[UPDATED] ${fixtureData.home_team} ${fixtureData.score} ${fixtureData.away_team} (ID: ${fixtureData.external_id})`);
        }
    }
}

export const BotService = {
    // 1. Fetch Fixtures (Daily Program)
    fetchFixtures: async () => {
        const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
        if (!API_KEY) {
            console.error('API Key missing! Add NEXT_PUBLIC_API_FOOTBALL_KEY to .env.local');
            return { success: false, message: 'API Key missing' };
        }

        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

        let totalImported = 0;

        try {
            // STRATEGY 1: Fetch ALL currently live matches (Global)
            const liveUrl = `${BASE_URL}/fixtures?live=all`;
            const liveResponse = await fetch(liveUrl, { headers: { 'x-apisports-key': API_KEY } });
            const liveJson = await liveResponse.json();

            if (liveJson.response) {
                // Parallel Upsert for Live Matches
                await Promise.all(liveJson.response.map(match => upsertMatch(match)));
                totalImported += liveJson.response.length;
            }

            // STRATEGY 2: Fetch Global Schedule for Yesterday, Today & Tomorrow
            // We fetch ALL matches for the given dates. No league filtering.
            const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
            const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
            const datesToFetch = [yesterday, today, tomorrow]; // Fetch all 3 days as requested

            for (const date of datesToFetch) {
                const url = `${BASE_URL}/fixtures?date=${date}`;
                const response = await fetch(url, { headers: { 'x-apisports-key': API_KEY } });
                const json = await response.json();

                if (json.errors && Object.keys(json.errors).length > 0) {
                    console.error(`API Error for Date ${date}:`, json.errors);
                    continue;
                }

                const matches = json.response || [];

                // Parallel Upsert (Batch of 50 to avoid DB connection limit)
                const batchSize = 50;
                for (let i = 0; i < matches.length; i += batchSize) {
                    const batch = matches.slice(i, i + batchSize);
                    await Promise.all(batch.map(m => upsertMatch(m)));
                }

                totalImported += matches.length;
            }

            return { success: true, message: `Imported ${totalImported} matches (Global).` };
        } catch (error) {
            console.error('Bot Error:', error);
            return { success: false, message: error.message };
        }
    },

    // 2. Update Odds (Periodically)
    updateOdds: async () => {
        if (!API_KEY) return { success: false, message: 'API Key missing' };

        // Get upcoming matches from DB
        const { data: fixtures } = await supabase
            .from('fixtures')
            .select('external_id')
            .eq('status', 'NOT_STARTED')
            .not('external_id', 'is', null)
            .limit(10); // Batch limit to save API calls

        let updatedCount = 0;

        for (const f of fixtures || []) {
            try {
                const response = await fetch(`${BASE_URL}/odds?fixture=${f.external_id}`, {
                    headers: { 'x-apisports-key': API_KEY }
                });
                const json = await response.json();

                if (json.response && json.response.length > 0) {
                    const bookmakers = json.response[0].bookmakers;
                    const bet365 = bookmakers.find(b => b.id === 1) || bookmakers[0]; // Prefer Bet365

                    if (bet365) {
                        const getMarket = (id) => bet365.bets.find(b => b.id === id);

                        // 1: Match Winner
                        const matchWinner = getMarket(1);
                        // 5: Goals Over/Under (usually 2.5 is the standard line, but API returns all lines. We need to find 2.5)
                        const goalsOverUnder = getMarket(5);
                        // 8: Both Teams Score
                        const btts = getMarket(8);
                        // 12: Double Chance
                        const doubleChance = getMarket(12);

                        const odds = {};

                        if (matchWinner) {
                            odds['MS 1'] = matchWinner.values.find(v => v.value === 'Home')?.odd;
                            odds['MS X'] = matchWinner.values.find(v => v.value === 'Draw')?.odd;
                            odds['MS 2'] = matchWinner.values.find(v => v.value === 'Away')?.odd;
                        }

                        if (goalsOverUnder) {
                            // Find 2.5 line
                            const over25 = goalsOverUnder.values.find(v => v.value === 'Over 2.5');
                            const under25 = goalsOverUnder.values.find(v => v.value === 'Under 2.5');
                            if (over25) odds['2.5 Üst'] = over25.odd;
                            if (under25) odds['2.5 Alt'] = under25.odd;
                        }

                        if (btts) {
                            odds['KG Var'] = btts.values.find(v => v.value === 'Yes')?.odd;
                            odds['KG Yok'] = btts.values.find(v => v.value === 'No')?.odd;
                        }

                        if (doubleChance) {
                            odds['1X'] = doubleChance.values.find(v => v.value === 'Home/Draw')?.odd;
                            odds['12'] = doubleChance.values.find(v => v.value === 'Home/Away')?.odd;
                            odds['X2'] = doubleChance.values.find(v => v.value === 'Draw/Away')?.odd;
                        }

                        await supabase
                            .from('fixtures')
                            .update({ odds })
                            .eq('external_id', f.external_id);

                        updatedCount++;
                    }
                }
            } catch (e) {
                console.error(`Error updating odds for ${f.external_id}`, e);
            }
        }

        return { success: true, message: `Updated odds for ${updatedCount} matches.` };
    },

    // 3. Check Results (Live Scores & Finalize Finished Matches)
    checkResults: async () => {
        if (!API_KEY) return { success: false, message: 'API Key missing' };

        // 1. Get matches that are currently LIVE in our DB
        const { data: liveFixtures } = await supabase
            .from('fixtures')
            .select('external_id')
            .eq('status', 'LIVE');

        // 2. Also fetch global live matches to catch NEWLY started games
        // But to be robust, let's just fetch the specific IDs of our LIVE matches + Global Live

        let idsToUpdate = new Set();
        if (liveFixtures) liveFixtures.forEach(f => idsToUpdate.add(f.external_id));

        // Fetch Global Live to find new games
        try {
            const liveResponse = await fetch(`${BASE_URL}/fixtures?live=all`, {
                headers: { 'x-apisports-key': API_KEY }
            });
            const liveJson = await liveResponse.json();
            const globalLive = liveJson.response || [];

            globalLive.forEach(m => idsToUpdate.add(m.fixture.id));

            // If we have nothing to update, return
            if (idsToUpdate.size === 0) return { success: true, message: 'No live matches to sync.' };

            // 3. Fetch details for ALL these IDs (Batching if needed)
            // API-Football allows up to 20 IDs per call usually, or we can just loop.
            // For safety and simplicity in this context, let's loop or use Promise.all
            // But wait, we can just use the `upsertMatch` function for each!

            // We need to fetch the *latest* data for these IDs. 
            // The `globalLive` array already has data for currently live ones.
            // But for those in `idsToUpdate` that are NOT in `globalLive` (meaning they just finished),
            // we need to fetch them individually.

            const liveMap = new Map(globalLive.map(m => [m.fixture.id, m]));
            const missingIds = [...idsToUpdate].filter(id => !liveMap.has(id));

            let updatedCount = 0;

            // Update from Global Live response (Fast)
            for (const match of globalLive) {
                await upsertMatch(match);
                updatedCount++;
            }

            // Fetch & Update "Missing" matches (Those that were LIVE but now Finished)
            if (missingIds.length > 0) {
                // Fetch in batches of 10
                for (let i = 0; i < missingIds.length; i += 10) {
                    const batch = missingIds.slice(i, i + 10).join('-');
                    const url = `${BASE_URL}/fixtures?ids=${batch}`;
                    const res = await fetch(url, { headers: { 'x-apisports-key': API_KEY } });
                    const json = await res.json();

                    if (json.response) {
                        for (const match of json.response) {
                            await upsertMatch(match);
                            updatedCount++;
                        }
                    }
                }
            }

            return { success: true, message: `Synced ${updatedCount} matches (Live & Recently Finished).` };

        } catch (error) {
            console.error('Check Results Error:', error);
            return { success: false, message: error.message };
        }
    }
};
