import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/matches - Get match history
export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
        }

        const matches = await prisma.match.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        // Fetch all unique user IDs
        const userIds = new Set<string>();
        matches.forEach(m => {
            userIds.add(m.teamA1Id);
            if (m.teamA2Id) userIds.add(m.teamA2Id);
            userIds.add(m.teamB1Id);
            if (m.teamB2Id) userIds.add(m.teamB2Id);
        });

        // Fetch user details
        const users = await prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: { id: true, displayName: true, image: true }
        });

        const userMap = new Map(users.map(u => [u.id, u]));

        // Enrich matches with user data
        const enrichedMatches = matches.map(match => ({
            ...match,
            teamA1: userMap.get(match.teamA1Id),
            teamA2: match.teamA2Id ? userMap.get(match.teamA2Id) : null,
            teamB1: userMap.get(match.teamB1Id),
            teamB2: match.teamB2Id ? userMap.get(match.teamB2Id) : null,
        }));

        return NextResponse.json(enrichedMatches);

    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }
}
