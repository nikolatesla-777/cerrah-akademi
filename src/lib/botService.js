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
    const { fixture, teams, goals, league, status } = match;

    // Map Status
    let dbStatus = 'NOT_STARTED';
    const shortStatus = status?.short;

    if (['1H', 'HT', '2H', 'ET', 'P', 'BT'].includes(shortStatus)) dbStatus = 'LIVE';
    else if (['FT', 'AET', 'PEN'].includes(shortStatus)) dbStatus = 'FINISHED';
    else if (['PST', 'CANC', 'ABD'].includes(shortStatus)) dbStatus = 'CANCELLED';

    // Prepare Data
    const fixtureData = {
        external_id: fixture.id,
        home_team: teams.home.name,
        away_team: teams.away.name,
        league: league.name,
        match_time: fixture.date,
        status: dbStatus,
        score: dbStatus === 'NOT_STARTED' ? '-' : `${goals.home ?? 0}-${goals.away ?? 0}`,
    };

    // Upsert into DB
    const { error } = await supabase
        .from('fixtures')
        .upsert(fixtureData, { onConflict: 'external_id' });

    if (error) {
        console.error('Supabase Upsert Error:', error.message, fixtureData);
    } else {
        // console.log('Imported:', fixtureData.home_team, '-', fixtureData.away_team);
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
            // This ensures we catch everything playing right now, regardless of league filters
            const liveUrl = `${BASE_URL}/fixtures?live=all`;
            const liveResponse = await fetch(liveUrl, { headers: { 'x-apisports-key': API_KEY } });
            const liveJson = await liveResponse.json();

            if (liveJson.response) {
                for (const match of liveJson.response) {
                    // Import EVERYTHING. No filtering.
                    await upsertMatch(match);
                    totalImported++;
                }
            }

            // STRATEGY 2: Fetch Global Schedule for Today & Tomorrow
            // We fetch ALL matches for the given dates. No league filtering.
            const datesToFetch = [today, tomorrow];

            for (const date of datesToFetch) {
                // Fetch all fixtures for this date (Global)
                const url = `${BASE_URL}/fixtures?date=${date}`;
                const response = await fetch(url, {
                    headers: { 'x-apisports-key': API_KEY }
                });

                const json = await response.json();

                if (json.errors && Object.keys(json.errors).length > 0) {
                    console.error(`API Error for Date ${date}:`, json.errors);
                    continue;
                }

                const matches = json.response || [];

                for (const match of matches) {
                    await upsertMatch(match);
                    totalImported++;
                }
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

    // 3. Check Results (Live Scores)
    checkResults: async () => {
        if (!API_KEY) return { success: false, message: 'API Key missing' };

        // Get LIVE or recently started matches
        const { data: fixtures } = await supabase
            .from('fixtures')
            .select('external_id')
            .or('status.eq.LIVE,status.eq.NOT_STARTED')
            .not('external_id', 'is', null);

        // API-Football allows fetching multiple ids: id=1-2-3
        // But let's do simple loop for now or use the 'live' endpoint

        // Better approach: Fetch ALL live matches from API and update matching ones in DB
        try {
            const response = await fetch(`${BASE_URL}/fixtures?live=all`, {
                headers: { 'x-apisports-key': API_KEY }
            });
            const json = await response.json();
            const liveMatches = json.response || [];

            let updatedCount = 0;

            for (const match of liveMatches) {
                const { fixture, goals, status } = match;

                // Only update if we have this match in our DB
                const { error } = await supabase
                    .from('fixtures')
                    .update({
                        score: `${goals.home}-${goals.away}`,
                        status: 'LIVE',
                        // minute: fixture.status.elapsed // We could add a minute column later
                    })
                    .eq('external_id', fixture.id);

                if (!error) updatedCount++;
            }

            return { success: true, message: `Synced ${updatedCount} live matches.` };

        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};
