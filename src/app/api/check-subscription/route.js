import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = '@cerrahvip';

export async function POST(request) {
    try {
        const { telegramId } = await request.json();

        if (!telegramId) {
            return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 });
        }
        // Bypass for Localhost or Mock Users
        if (process.env.NODE_ENV === 'development' || telegramId.toString() === '123') {
            console.log('Bypassing subscription check for localhost/mock user');
            return NextResponse.json({ isSubscribed: true });
        }

        if (!BOT_TOKEN) {
            console.error('TELEGRAM_BOT_TOKEN is not set');
            // For development/demo purposes, if token is missing, we might want to bypass or fail.
            // Failing is safer to ensure configuration.
            return NextResponse.json({ error: 'Server configuration error: Bot token missing' }, { status: 500 });
        }

        // Telegram API: getChatMember
        // https://core.telegram.org/bots/api#getchatmember
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_ID}&user_id=${telegramId}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API Error:', data);
            // If bot is not admin, it might return "Bad Request: user not found" or similar if it can't check.
            // Or "Bad Request: chat not found" if channel is wrong.
            return NextResponse.json({ isSubscribed: false, error: data.description });
        }

        const status = data.result.status;
        // Valid statuses for a member
        const isSubscribed = ['creator', 'administrator', 'member', 'restricted'].includes(status);

        return NextResponse.json({ isSubscribed });

    } catch (error) {
        console.error('Subscription check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
