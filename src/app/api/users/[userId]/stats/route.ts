import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/users/[userId]/stats
export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Fetch user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                displayName: true,
                image: true,
                elo: true,
                score: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        // Fetch all matches for this user
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { teamA1Id: userId },
                    { teamA2Id: userId },
                    { teamB1Id: userId },
                    { teamB2Id: userId },
                ]
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate stats
        let wins = 0;
        let losses = 0;
        let eloHistory: { date: string; elo: number; delta: number }[] = [];
        let currentElo = 500; // Starting ELO

        // Process matches chronologically to build ELO history
        const chronologicalMatches = [...matches].reverse();

        chronologicalMatches.forEach(match => {
            const isInTeamA = match.teamA1Id === userId || match.teamA2Id === userId;
            const isWinner = (isInTeamA && match.winner === 'A') || (!isInTeamA && match.winner === 'B');

            if (isWinner) {
                wins++;
                currentElo += match.eloDelta;
            } else {
                losses++;
                currentElo -= match.eloDelta;
            }

            eloHistory.push({
                date: match.createdAt.toISOString(),
                elo: currentElo,
                delta: isWinner ? match.eloDelta : -match.eloDelta
            });
        });

        // Reverse to get most recent first
        eloHistory.reverse();

        const totalMatches = wins + losses;
        const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
        const eloProgression = user.elo - 500; // Progression since start

        // Fetch match details for history (last 20)
        const recentMatchIds = matches.slice(0, 20).map(m => m.id);
        const recentMatches = await prisma.match.findMany({
            where: { id: { in: recentMatchIds } },
            orderBy: { createdAt: 'desc' },
        });

        // Fetch all user IDs from recent matches
        const userIds = new Set<string>();
        recentMatches.forEach(m => {
            userIds.add(m.teamA1Id);
            if (m.teamA2Id) userIds.add(m.teamA2Id);
            userIds.add(m.teamB1Id);
            if (m.teamB2Id) userIds.add(m.teamB2Id);
        });

        const users = await prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: { id: true, displayName: true, image: true }
        });

        const userMap = new Map(users.map(u => [u.id, u]));

        const enrichedMatches = recentMatches.map(match => {
            const isInTeamA = match.teamA1Id === userId || match.teamA2Id === userId;
            const isWinner = (isInTeamA && match.winner === 'A') || (!isInTeamA && match.winner === 'B');

            return {
                ...match,
                teamA1: userMap.get(match.teamA1Id),
                teamA2: match.teamA2Id ? userMap.get(match.teamA2Id) : null,
                teamB1: userMap.get(match.teamB1Id),
                teamB2: match.teamB2Id ? userMap.get(match.teamB2Id) : null,
                isWinner,
                userDelta: isWinner ? match.eloDelta : -match.eloDelta,
            };
        });

        return NextResponse.json({
            user,
            stats: {
                totalMatches,
                wins,
                losses,
                winRate: Math.round(winRate * 10) / 10,
                eloProgression,
                currentElo: user.elo,
            },
            eloHistory,
            recentMatches: enrichedMatches,
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
    }
}
