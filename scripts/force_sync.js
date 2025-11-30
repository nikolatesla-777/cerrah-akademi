
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Mocking the BotService import since it uses ES modules and we are running in Node
// We will just copy the logic or use dynamic import if possible.
// Easier to just replicate the core logic here for a robust one-off script.

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
        if (dbStatus === 'FINISHED') {
            console.log(`[UPDATED] ${fixtureData.home_team} ${fixtureData.score} ${fixtureData.away_team} (ID: ${fixtureData.external_id})`);
        } else if (fixtureData.match_time.includes('2025-11-29')) {
            // Debug: Log status for yesterday's matches that are NOT finished
            console.log(`[DEBUG] ${fixtureData.home_team} vs ${fixtureData.away_team} Status: ${status?.short} (${status?.long})`);
        }
    }
}

async function sync() {
    console.log('Starting Force Sync...');

    // 1. Fetch Yesterday, Today, Tomorrow
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

    const dates = [yesterday, today, tomorrow];

    for (const date of dates) {
        console.log(`Fetching date: ${date}`);
        const url = `${BASE_URL}/fixtures?date=${date}`;
        const res = await fetch(url, { headers: { 'x-apisports-key': API_KEY } });
        const json = await res.json();

        if (json.response) {
            console.log(`Found ${json.response.length} matches for ${date}`);
            const matches = json.response;
            // Batch upsert
            for (let i = 0; i < matches.length; i += 50) {
                const batch = matches.slice(i, i + 50);
                await Promise.all(batch.map(m => upsertMatch(m)));
            }
        } else {
            console.error('API Error:', json);
        }
    }

    console.log('Sync Complete.');
}

sync();
