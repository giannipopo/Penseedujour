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
        const { winnerId } = body;

        if (!winnerId) {
            return NextResponse.json({ error: 'Winner ID is required' }, { status: 400 });
        }

        // Increment score for the winner
        // We do not decrement for the loser based on user instructions ("attribuer +1 au gagnant")
        const winner = await prisma.user.update({
            where: { id: winnerId },
            data: {
                score: { increment: 1 }
            }
        });

        return NextResponse.json({
            success: true,
            winnerName: winner.displayName,
            newScore: winner.score
        });

    } catch (error) {
        console.error('Error processing confrontation:', error);
        return NextResponse.json({ error: 'Failed to process confrontation' }, { status: 500 });
    }
}
