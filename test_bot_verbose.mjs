import { BotService } from './src/lib/botService.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    console.log('Testing BotService (Verbose)...');
    const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
    console.log('API Key present:', !!API_KEY);

    try {
        console.log('Calling fetchFixtures...');
        // We can't easily modify BotService to be partial without changing code, 
        // but we can see if it even starts.
        const result = await BotService.fetchFixtures();
        console.log('Result:', result);
    } catch (error) {
        console.error('Test Error:', error);
    }
}

test();
