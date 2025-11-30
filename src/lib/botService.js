import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the SERVICE ROLE key for admin access (writing to DB)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Fallback to anon (will fail if RLS blocks)

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BASE_URL = 'https://v3.football.api-sports.io';

// Helper to prepare match data (Pure function)
function prepareMatchData(match) {
    const { fixture, teams, goals, league } = match;
    const status = fixture.status;

    // Map Status
    let dbStatus = 'NOT_STARTED';
    const shortStatus = status?.short;

    if (['1H', 'HT', '2H', 'ET', 'P', 'BT'].includes(shortStatus)) dbStatus = 'LIVE';
    else if (['FT', 'AET', 'PEN'].includes(shortStatus)) dbStatus = 'FINISHED';
    else if (['PST', 'CANC', 'ABD'].includes(shortStatus)) dbStatus = 'CANCELLED';

    // Prepare Data
    return {
        id: String(fixture.id), // Use API ID as internal ID (Deterministic & Stable)
        external_id: fixture.id,
        home_team: teams.home.name,
        away_team: teams.away.name,
        home_team_logo: teams.home.logo,
        away_team_logo: teams.away.logo,
        league: league.name,
        league_logo: league.logo,
        country: league.country,
        country_flag: league.flag,
        match_time: fixture.date,
        status: dbStatus,
        minute: fixture.status.elapsed, // Live minute
        score: dbStatus === 'NOT_STARTED' ? '-' : `${goals.home ?? 0}-${goals.away ?? 0}`,
    };
}

// Bulk Upsert Helper
async function bulkUpsertMatches(matches) {
    if (!matches || matches.length === 0) return;

    const fixtureDataArray = matches.map(m => prepareMatchData(m));

    const { error } = await supabase
        .from('fixtures')
        .upsert(fixtureDataArray, { onConflict: 'external_id' });

    if (error) {
        console.error('Supabase Bulk Upsert Error:', error.message);
    } else {
        // DEBUG LOGGING
        const finished = fixtureDataArray.filter(f => f.status === 'FINISHED');
        if (finished.length > 0) {
            console.log(`[BulkUpsert] Finalized ${finished.length} matches:`, finished.map(f => `${f.home_team}-${f.away_team} (${f.status})`));
        }
        const live = fixtureDataArray.filter(f => f.status === 'LIVE');
        if (live.length > 0) {
            // Log only first 3 to avoid spam
            console.log(`[BulkUpsert] Updated ${live.length} live matches. Sample: ${live[0].home_team} ${live[0].minute}'`);
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

        let totalImported = 0;

        try {
            // STRATEGY 1: Fetch ALL currently live matches (Global)
            const liveUrl = `${BASE_URL}/fixtures?live=all`;
            const liveResponse = await fetch(liveUrl, { headers: { 'x-apisports-key': API_KEY } });
            const liveJson = await liveResponse.json();

            if (liveJson.response && liveJson.response.length > 0) {
                await bulkUpsertMatches(liveJson.response);
                totalImported += liveJson.response.length;
            }

            // STRATEGY 2: Fetch Global Schedule for Yesterday, Today & Next 3 Days
            const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
            const dayAfterTomorrow = new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0];
            const threeDaysLater = new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0];

            const datesToFetch = [yesterday, today, tomorrow, dayAfterTomorrow, threeDaysLater];

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
                    await bulkUpsertMatches(batch);
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
        if (!process.env.NEXT_PUBLIC_API_FOOTBALL_KEY) return { success: false, message: 'API Key missing' };

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
                    headers: { 'x-apisports-key': process.env.NEXT_PUBLIC_API_FOOTBALL_KEY }
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
        const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
        if (!API_KEY) return { success: false, message: 'API Key missing' };

        // 1. Get matches that are currently LIVE in our DB
        const { data: liveFixtures } = await supabase
            .from('fixtures')
            .select('external_id')
            .eq('status', 'LIVE');

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
            if (idsToUpdate.size === 0) {
                return { success: true, message: 'No live matches to sync.' };
            }

            const liveMap = new Map(globalLive.map(m => [m.fixture.id, m]));
            const missingIds = [...idsToUpdate].filter(id => !liveMap.has(id));

            let updatedCount = 0;

            // Update from Global Live response (Fast) - Bulk Upsert
            if (globalLive.length > 0) {
                await bulkUpsertMatches(globalLive);
                updatedCount += globalLive.length;
            }

            // Fetch & Update "Missing" matches (Those that were LIVE but now Finished)
            if (missingIds.length > 0) {
                console.log(`[CheckResults] Found ${missingIds.length} potentially finished matches:`, missingIds);
                // Fetch in batches of 10
                for (let i = 0; i < missingIds.length; i += 10) {
                    const batch = missingIds.slice(i, i + 10).join('-');
                    const url = `${BASE_URL}/fixtures?ids=${batch}`;
                    const res = await fetch(url, { headers: { 'x-apisports-key': API_KEY } });
                    const json = await res.json();

                    if (json.response && json.response.length > 0) {
                        console.log(`[CheckResults] Fetched details for missing matches. Updating...`);
                        await bulkUpsertMatches(json.response);
                        updatedCount += json.response.length;
                    } else {
                        console.warn(`[CheckResults] Failed to fetch details for missing batch: ${batch}`, json);
                    }
                }
            }

            return { success: true, message: `Synced ${updatedCount} matches (Live & Recently Finished).` };

        } catch (error) {
            console.error('CheckResults Error:', error);
            return { success: false, message: error.message };
        }
    },

    // 4. Fetch Full Match Details (On Demand)
    fetchMatchDetails: async (fixtureId) => {
        const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
        if (!API_KEY) return { success: false, message: 'API Key missing' };

        try {
            // 1. Get basic info from DB to know teams and league
            const { data: fixture } = await supabase
                .from('fixtures')
                .select('*')
                .eq('external_id', fixtureId)
                .single();

            if (!fixture) return { success: false, message: 'Fixture not found in DB' };

            // We need to make parallel requests for efficiency
            const headers = { 'x-apisports-key': API_KEY };

            // Prepare promises
            const pStats = fetch(`${BASE_URL}/fixtures/statistics?fixture=${fixtureId}`, { headers }).then(r => r.json());
            const pLineups = fetch(`${BASE_URL}/fixtures/lineups?fixture=${fixtureId}`, { headers }).then(r => r.json());
            const pPredictions = fetch(`${BASE_URL}/predictions?fixture=${fixtureId}`, { headers }).then(r => r.json());

            // H2H needs team IDs. We don't store team IDs in our simplified schema, only names.
            // BUT, the `fixture` object from API has team IDs. 
            // We might need to fetch the fixture from API again if we don't have IDs.
            // Actually, let's fetch the fixture details from API first if we need IDs, 
            // OR we can rely on the fact that we might have stored them? 
            // Wait, our schema doesn't have team_id columns. 
            // We can get team IDs from the `lineups` or `statistics` response usually, or just fetch the fixture again.
            // Let's fetch the fixture from API to be safe and get IDs.
            const pFixture = fetch(`${BASE_URL}/fixtures?id=${fixtureId}`, { headers }).then(r => r.json());

            const [statsRes, lineupsRes, predictionsRes, fixtureRes] = await Promise.all([pStats, pLineups, pPredictions, pFixture]);

            let updates = {};

            if (statsRes.response) updates.statistics = statsRes.response;
            if (lineupsRes.response) updates.lineups = lineupsRes.response;
            if (predictionsRes.response) updates.predictions = predictionsRes.response;

            // Now we have team IDs from fixtureRes to fetch H2H and Standings
            if (fixtureRes.response && fixtureRes.response.length > 0) {
                const f = fixtureRes.response[0];
                const homeId = f.teams.home.id;
                const awayId = f.teams.away.id;
                const leagueId = f.league.id;
                const season = f.league.season;

                // Fetch H2H and Standings
                const pH2H = fetch(`${BASE_URL}/fixtures/headtohead?h2h=${homeId}-${awayId}`, { headers }).then(r => r.json());
                const pStandings = fetch(`${BASE_URL}/standings?league=${leagueId}&season=${season}`, { headers }).then(r => r.json());

                const [h2hRes, standingsRes] = await Promise.all([pH2H, pStandings]);

                if (h2hRes.response) updates.h2h = h2hRes.response;
                if (standingsRes.response) updates.standings = standingsRes.response;
            }

            // Update DB
            const { error } = await supabase
                .from('fixtures')
                .update(updates)
                .eq('external_id', fixtureId);

            if (error) throw error;

            return { success: true, message: 'Match details updated' };

        } catch (error) {
            console.error('Fetch Details Error:', error);
            return { success: false, message: error.message };
        }
    }
};
