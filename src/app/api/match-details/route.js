import { NextResponse } from 'next/server';
import { BotService } from '@/lib/botService';

export async function POST(request) {
    try {
        const { fixtureId } = await request.json();

        if (!fixtureId) {
            return NextResponse.json({ success: false, message: 'Fixture ID is required' }, { status: 400 });
        }

        const result = await BotService.fetchMatchDetails(fixtureId);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
