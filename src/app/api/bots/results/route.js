import { NextResponse } from 'next/server';
import { BotService } from '@/lib/botService';

export async function POST() {
    try {
        const result = await BotService.checkResults();
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
