const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    // 1. Get a LIVE match
    const { data: matches, error } = await supabase
        .from('fixtures')
        .select('id, external_id, home_team, away_team, minute, status')
        .eq('status', 'LIVE')
        .limit(1);

    if (error || !matches || matches.length === 0) {
        console.log('No LIVE matches found to test.');
        return;
    }

    const match = matches[0];
    console.log(`Found match: ${match.home_team} vs ${match.away_team} (ID: ${match.id})`);
    console.log(`Current Minute: ${match.minute}`);

    // 2. Update the minute
    const newMinute = (parseInt(match.minute) || 0) + 1;
    console.log(`Updating to Minute: ${newMinute}...`);

    const { error: updateError } = await supabase
        .from('fixtures')
        .update({ minute: newMinute })
        .eq('id', match.id);

    if (updateError) {
        console.error('Update failed:', updateError);
    } else {
        console.log('Update successful!');
    }
}

testUpdate();
