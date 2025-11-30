
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;

if (!supabaseUrl || !supabaseServiceKey || !API_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BASE_URL = 'https://v3.football.api-sports.io';

function prepareMatchData(match) {
    const { fixture, teams, goals, league } = match;
    const status = fixture.status;
    let dbStatus = 'NOT_STARTED';
    const shortStatus = status?.short;

    if (['1H', 'HT', '2H', 'ET', 'P', 'BT'].includes(shortStatus)) dbStatus = 'LIVE';
    else if (['FT', 'AET', 'PEN'].includes(shortStatus)) dbStatus = 'FINISHED';
    else if (['PST', 'CANC', 'ABD'].includes(shortStatus)) dbStatus = 'CANCELLED';

    return {
        id: String(fixture.id),
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
        minute: fixture.status.elapsed,
        score: dbStatus === 'NOT_STARTED' ? '-' : `${goals.home ?? 0}-${goals.away ?? 0}`,
    };
}

async function bulkUpsertMatches(matches) {
    if (!matches || matches.length === 0) return;

    const fixtureDataArray = matches.map(m => prepareMatchData(m));

    const { error } = await supabase
        .from('fixtures')
        .upsert(fixtureDataArray, { onConflict: 'external_id' });

    if (error) {
        console.error('Supabase Bulk Upsert Error:', error.message);
    } else {
        console.log(`[${new Date().toLocaleTimeString()}] Upserted ${matches.length} matches.`);
        // Add console log to print match status updates.
        // fixtureDataArray.forEach(match => {
        //     console.log(`[${new Date().toLocaleTimeString()}] Match ${match.home_team} vs ${match.away_team} (ID: ${match.external_id}) status: ${match.status} (${match.minute}')`);
        // });
    }
}

async function syncLive() {
    console.log(`[${new Date().toLocaleTimeString()}] Checking for LIVE matches...`);

    try {
        // 1. Fetch Global Live Matches
        const response = await fetch(`${BASE_URL}/fixtures?live=all`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const json = await response.json();
        const liveMatches = json.response || [];

        // 2. Identify matches that were LIVE in DB but are missing from Global Live (Finished?)
        const { data: dbLiveMatches } = await supabase
            .from('fixtures')
            .select('external_id')
            .eq('status', 'LIVE');

        const dbLiveIds = new Set((dbLiveMatches || []).map(f => f.external_id));
        const apiLiveIds = new Set(liveMatches.map(m => m.fixture.id));

        const finishedIds = [...dbLiveIds].filter(id => !apiLiveIds.has(id));

        // 3. Upsert Global Live Matches (Bulk)
        if (liveMatches.length > 0) {
            await bulkUpsertMatches(liveMatches);
        }

        // 4. Fetch & Update Finished Matches
        if (finishedIds.length > 0) {
            console.log(`Found ${finishedIds.length} matches that just finished.`);
            // Fetch in batches of 10
            for (let i = 0; i < finishedIds.length; i += 10) {
                const batch = finishedIds.slice(i, i + 10).join('-');
                const url = `${BASE_URL}/fixtures?ids=${batch}`;
                const res = await fetch(url, { headers: { 'x-apisports-key': API_KEY } });
                const json = await res.json();

                if (json.response && json.response.length > 0) {
                    await bulkUpsertMatches(json.response);
                }
            }
        }

    } catch (error) {
        console.error('Sync Error:', error);
    }
}

// Run immediately
syncLive();

// Then run every 10 seconds
setInterval(syncLive, 10 * 1000);
