
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

async function upsertMatch(match) {
    const { fixture, teams, goals, league } = match;
    const status = fixture.status;
    let dbStatus = 'NOT_STARTED';
    const shortStatus = status?.short;

    if (['1H', 'HT', '2H', 'ET', 'P', 'BT'].includes(shortStatus)) dbStatus = 'LIVE';
    else if (['FT', 'AET', 'PEN'].includes(shortStatus)) dbStatus = 'FINISHED';
    else if (['PST', 'CANC', 'ABD'].includes(shortStatus)) dbStatus = 'CANCELLED';

    const fixtureData = {
        id: String(fixture.id),
        external_id: fixture.id,
        home_team: teams.home.name,
        away_team: teams.away.name,
        home_team_logo: teams.home.logo,
        away_team_logo: teams.away.logo,
        league: league.name,
        league_logo: league.logo,
        match_time: fixture.date,
        status: dbStatus,
        minute: fixture.status.elapsed,
        score: dbStatus === 'NOT_STARTED' ? '-' : `${goals.home ?? 0}-${goals.away ?? 0}`,
    };

    const { error } = await supabase.from('fixtures').upsert(fixtureData, { onConflict: 'external_id' });
    if (error) console.error('Error upserting:', error.message);
    else {
        // Log only significant updates
        console.log(`[${new Date().toLocaleTimeString()}] ${fixtureData.home_team} ${fixtureData.score} ${fixtureData.away_team} (${fixtureData.minute}')`);
    }
}

async function syncLive() {
    console.log(`[${new Date().toLocaleTimeString()}] Checking for LIVE matches...`);

    try {
        const response = await fetch(`${BASE_URL}/fixtures?live=all`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const json = await response.json();

        if (json.response) {
            const matches = json.response;
            console.log(`Found ${matches.length} LIVE matches.`);

            if (matches.length > 0) {
                await Promise.all(matches.map(m => upsertMatch(m)));
            }
        } else {
            console.error('API Error:', json);
        }
    } catch (error) {
        console.error('Sync Error:', error);
    }
}

// Run immediately
syncLive();

// Then run every 60 seconds
setInterval(syncLive, 60 * 1000);
