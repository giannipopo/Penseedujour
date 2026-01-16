import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getDateKeyParis } from '@/lib/utils';

export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json(null);
    }

    try {
        const today = getDateKeyParis();
        // Since we can have multiple thoughts, we fetch the latest one for today
        const thought = await prisma.thought.findFirst({
            where: {
                userId: user.id,
                dateKey: today,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(thought);
    } catch (error) {
        console.error('Error fetching today\'s thought:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
