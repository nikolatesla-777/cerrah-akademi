import { supabase } from './supabase';

// Mock Data Generator
const generateMockFixtures = () => {
    const teams = [
        'Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor',
        'Real Madrid', 'Barcelona', 'Man City', 'Liverpool',
        'Bayern Munich', 'Dortmund', 'PSG', 'Milan'
    ];

    const fixtures = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
        const home = teams[Math.floor(Math.random() * teams.length)];
        let away = teams[Math.floor(Math.random() * teams.length)];
        while (home === away) away = teams[Math.floor(Math.random() * teams.length)];

        const hour = 18 + Math.floor(Math.random() * 4); // 18:00 - 21:00
        const matchTime = new Date(today);
        matchTime.setHours(hour, 0, 0, 0);

        fixtures.push({
            id: `mock_${Date.now()}_${i}`,
            home_team: home,
            away_team: away,
            league: 'Süper Lig', // Simplified
            match_time: matchTime.toISOString(),
            odds: {
                '1': (1 + Math.random() * 2).toFixed(2),
                'X': (2 + Math.random() * 2).toFixed(2),
                '2': (1 + Math.random() * 3).toFixed(2)
            },
            status: 'NOT_STARTED',
            score: null
        });
    }
    return fixtures;
};

export const BotService = {
    // 1. Fixture Bot
    async fetchFixtures() {
        console.log('Bot: Fetching fixtures...');
        // In real implementation, fetch from API here
        const fixtures = generateMockFixtures();

        const { data, error } = await supabase
            .from('fixtures')
            .upsert(fixtures, { onConflict: 'id' }) // In real app, use external ID
            .select();

        if (error) throw error;
        return { message: `${fixtures.length} fixtures synced.`, data };
    },

    // 2. Odds Bot
    async updateOdds() {
        console.log('Bot: Updating odds...');
        // Fetch active fixtures
        const { data: activeFixtures } = await supabase
            .from('fixtures')
            .select('*')
            .eq('status', 'NOT_STARTED');

        if (!activeFixtures || activeFixtures.length === 0) return { message: 'No active fixtures to update.' };

        const updates = activeFixtures.map(f => ({
            ...f,
            odds: {
                '1': (parseFloat(f.odds['1']) + (Math.random() - 0.5) * 0.1).toFixed(2),
                'X': (parseFloat(f.odds['X']) + (Math.random() - 0.5) * 0.1).toFixed(2),
                '2': (parseFloat(f.odds['2']) + (Math.random() - 0.5) * 0.1).toFixed(2)
            }
        }));

        const { error } = await supabase.from('fixtures').upsert(updates);
        if (error) throw error;
        return { message: 'Odds updated.', count: updates.length };
    },

    // 3. Score Bot
    async checkResults() {
        console.log('Bot: Checking results...');
        // Mock: Finish random matches
        const { data: liveFixtures } = await supabase
            .from('fixtures')
            .select('*')
            .neq('status', 'FINISHED');

        if (!liveFixtures || liveFixtures.length === 0) return { message: 'No matches to result.' };

        const updates = [];
        for (const f of liveFixtures) {
            // 30% chance to finish a match
            if (Math.random() > 0.7) {
                const homeScore = Math.floor(Math.random() * 4);
                const awayScore = Math.floor(Math.random() * 3);
                updates.push({
                    ...f,
                    status: 'FINISHED',
                    score: `${homeScore}-${awayScore}`
                });
            }
        }

        if (updates.length > 0) {
            const { error } = await supabase.from('fixtures').upsert(updates);
            if (error) throw error;
        }

        return { message: 'Results checked.', finished: updates.length };
    }
};
