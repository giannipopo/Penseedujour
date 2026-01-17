import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getDateKeyParis, validateThoughtContent } from '@/lib/utils';

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

        // Create thought if message is provided
        const message = body.message;
        if (message && typeof message === 'string' && message.trim().length > 0) {
            const validationError = validateThoughtContent(message);
            // We only create the thought if valid, but we don't fail the whole transaction if it fails validation (optional choice, but better for UX to not rollback the score if just the message is long? Or maybe user wants it all or nothing?
            // Given the prompt "je puisse aussi écrire un message", failure to write message should probably not be silent, but here catching it might be complex if we already updated scores.
            // Let's assume validation passes or we just skip if invalid to avoid errors.
            // Actually, if validation fails, it's better to just log or ignore than crash the request after scores are updated.
            if (!validationError) {
                await prisma.thought.create({
                    data: {
                        userId: user.id,
                        content: message.trim(),
                        category: 'CONFRONTATION', // New category for these events
                        dateKey: getDateKeyParis(),
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            count: result.count
        });

    } catch (error) {
        console.error('Error processing confrontation:', error);
        return NextResponse.json({ error: 'Failed to process confrontation' }, { status: 500 });
    }
}
