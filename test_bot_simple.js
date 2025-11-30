require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

async function test() {
    console.log('Testing API connection...');
    try {
        const response = await fetch(`${BASE_URL}/status`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const json = await response.json();
        console.log('API Status:', json);

        if (json.errors && Object.keys(json.errors).length > 0) {
            console.error('API Errors:', json.errors);
            return;
        }

        console.log('Fetching live fixtures...');
        const liveResponse = await fetch(`${BASE_URL}/fixtures?live=all`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const liveJson = await liveResponse.json();
        console.log(`Found ${liveJson.results} live matches.`);

        if (liveJson.response && liveJson.response.length > 0) {
            console.log('Sample Match:', liveJson.response[0].fixture.id, liveJson.response[0].teams.home.name);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
