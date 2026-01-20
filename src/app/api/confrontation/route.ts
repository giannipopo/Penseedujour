import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getDateKeyParis, validateThoughtContent } from '@/lib/utils';
import { calculateEloChange } from '@/lib/elo';

// POST /api/confrontation
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        // Security check
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
        }

        const body = await request.json();
        const { winnerIds, loserIds, message } = body;

        // Validation
        if (!winnerIds || !Array.isArray(winnerIds) || winnerIds.length === 0) {
            return NextResponse.json({ error: 'Winner IDs required' }, { status: 400 });
        }
        if (!loserIds || !Array.isArray(loserIds) || loserIds.length === 0) {
            return NextResponse.json({ error: 'Loser IDs required' }, { status: 400 });
        }

        // Fetch all participants
        const allIds = [...winnerIds, ...loserIds];
        const users = await prisma.user.findMany({
            where: { id: { in: allIds } },
            select: { id: true, elo: true }
        });

        const userMap = new Map(users.map(u => [u.id, u]));

        // Calculate Average ELOs
        let winnerEloSum = 0;
        let missingUser = false;
        for (const id of winnerIds) {
            const u = userMap.get(id);
            if (!u) missingUser = true;
            else winnerEloSum += u.elo;
        }

        let loserEloSum = 0;
        for (const id of loserIds) {
            const u = userMap.get(id);
            if (!u) missingUser = true;
            else loserEloSum += u.elo;
        }

        if (missingUser) {
            return NextResponse.json({ error: 'Some users not found' }, { status: 404 });
        }

        const winnerAvgElo = winnerEloSum / winnerIds.length;
        const loserAvgElo = loserEloSum / loserIds.length;

        // Calculate Delta
        // User said: "Si je gagne un match contre qq qui a un ELO au dessus de moi => je gagne plus de point"
        // This is standard ELO behavior (handled by calculateEloChange)
        const eloDelta = calculateEloChange(winnerAvgElo, loserAvgElo);

        const updates = [];

        // Update Winners
        for (const id of winnerIds) {
            updates.push(prisma.user.update({
                where: { id },
                data: {
                    elo: { increment: eloDelta },
                    score: { increment: 1 } // Keep tracking wins in 'score' for legacy/stats
                }
            }));
        }

        // Update Losers
        for (const id of loserIds) {
            updates.push(prisma.user.update({
                where: { id },
                data: {
                    elo: { decrement: eloDelta }
                    // Losers don't get 'score' increment
                }
            }));
        }

        // Create Message (Thought)
        if (message && typeof message === 'string' && message.trim().length > 0) {
            const validationError = validateThoughtContent(message);
            if (!validationError) {
                updates.push(prisma.thought.create({
                    data: {
                        userId: user.id,
                        content: message.trim(),
                        category: 'CONFRONTATION',
                        dateKey: getDateKeyParis(),
                    }
                }));
            }
        }

        // Save Match History
        const matchData: any = {
            teamA1Id: winnerIds[0],
            teamB1Id: loserIds[0],
            winner: 'A', // Winners are always team A in our data structure
            eloDelta,
            message: message?.trim() || null,
        };

        // Add second players if in double mode
        if (winnerIds.length > 1) matchData.teamA2Id = winnerIds[1];
        if (loserIds.length > 1) matchData.teamB2Id = loserIds[1];

        updates.push(prisma.match.create({
            data: matchData
        }));

        // Execute
        await prisma.$transaction(updates);

        return NextResponse.json({
            success: true,
            eloDelta,
            message: `Winners gained ${eloDelta} ELO`
        });

    } catch (error) {
        console.error('Error processing confrontation:', error);
        return NextResponse.json({ error: 'Failed to process confrontation' }, { status: 500 });
    }
}
