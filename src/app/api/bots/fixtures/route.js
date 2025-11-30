import { NextResponse } from 'next/server';
import { BotService } from '@/lib/botService';

export async function POST() {
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasApiKey = !!process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;

    try {
        const result = await BotService.fetchFixtures();
        return NextResponse.json({
            success: true,
            debug: {
                hasServiceKey,
                hasApiKey,
                serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
            },
            ...result
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            debug: { hasServiceKey, hasApiKey },
            error: error.message
        }, { status: 500 });
    }
}
