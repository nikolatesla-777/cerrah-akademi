import { BotService } from './src/lib/botService.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    console.log('Testing BotService...');
    try {
        const result = await BotService.fetchFixtures();
        console.log('Result:', result);
    } catch (error) {
        console.error('Test Error:', error);
    }
}

test();
