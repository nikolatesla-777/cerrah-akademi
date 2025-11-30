const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
    console.log('Verifying schema...');
    // Try to select the new columns. If they don't exist, this should error.
    const { data, error } = await supabase
        .from('fixtures')
        .select('id, statistics, lineups, h2h, standings, predictions')
        .limit(1);

    if (error) {
        console.error('❌ Schema Check Failed:', error.message);
        console.log('It seems the columns have NOT been added yet.');
    } else {
        console.log('✅ Schema Check Passed: New columns (statistics, lineups, etc.) exist.');
    }
}

checkColumns();
