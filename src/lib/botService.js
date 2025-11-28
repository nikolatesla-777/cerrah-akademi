import { supabase } from './supabase';

const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
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

export const BotService = {
    // 1. Fetch Fixtures (Daily Program)
    fetchFixtures: async () => {
        if (!API_KEY) {
            console.error('API Key missing! Add NEXT_PUBLIC_API_FOOTBALL_KEY to .env.local');
            return { success: false, message: 'API Key missing' };
        }

        const today = new Date().toISOString().split('T')[0];
        // Removed: let totalImported = 0; // This is now declared inside the try block

        try {
            // FREE PLAN STRATEGY: Fetch ONLY currently live matches
            // The Free plan blocks 'season=2025' for full schedule, but allows 'live=all'.

            const url = `${BASE_URL}/fixtures?live=all`;
            const response = await fetch(url, {
                headers: { 'x-apisports-key': API_KEY }
            });

            const json = await response.json();

            // Debug log
            const fs = require('fs');
            const path = require('path');
            try {
                fs.writeFileSync(path.join(process.cwd(), 'debug_log.json'), JSON.stringify(json, null, 2));
            } catch (e) { console.error(e); }

            if (json.errors && Object.keys(json.errors).length > 0) {
                console.error('API Error:', json.errors);
                return { success: false, message: 'API Error', errors: json.errors };
            }

            const matches = json.response || [];
            let totalImported = 0;

            for (const match of matches) {
                const { fixture, teams, goals, league, status } = match;

                // Optional: Filter by specific leagues if needed, but for now let's import all to show data
                // if (!LEAGUES.includes(league.id)) continue;

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
                    score: `${goals.home ?? 0}-${goals.away ?? 0}`,
                };

                // Upsert into DB
                const { error } = await supabase
                    .from('fixtures')
                    .upsert(fixtureData, { onConflict: 'external_id' });

                if (!error) totalImported++;
            }

            return { success: true, message: `Imported ${totalImported} LIVE matches.` };
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
                        const matchWinner = bet365.bets.find(b => b.id === 1); // Id 1 is usually Match Winner
                        if (matchWinner) {
                            const odds = {
                                '1': matchWinner.values.find(v => v.value === 'Home')?.odd,
                                'X': matchWinner.values.find(v => v.value === 'Draw')?.odd,
                                '2': matchWinner.values.find(v => v.value === 'Away')?.odd
                            };

                            await supabase
                                .from('fixtures')
                                .update({ odds })
                                .eq('external_id', f.external_id);

                            updatedCount++;
                        }
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
