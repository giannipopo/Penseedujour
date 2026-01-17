import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/confrontation
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        // Security check
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
        }

        const body = await request.json();
        const { winnerId, winnerIds } = body;

        // Determine list of winners
        let winners: string[] = [];
        if (winnerIds && Array.isArray(winnerIds)) {
            winners = winnerIds;
        } else if (winnerId) {
            winners = [winnerId];
        }

        if (winners.length === 0) {
            return NextResponse.json({ error: 'Winner ID(s) required' }, { status: 400 });
        }

        // Increment score for all winners
        const result = await prisma.user.updateMany({
            where: { id: { in: winners } },
            data: {
                score: { increment: 1 }
            }
        });

        return NextResponse.json({
            success: true,
            count: result.count
        });

    } catch (error) {
        console.error('Error processing confrontation:', error);
        return NextResponse.json({ error: 'Failed to process confrontation' }, { status: 500 });
    }
}
