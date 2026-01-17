import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/leaderboard
// Public endpoint for divisions
export async function GET(request: Request) {
    try {
        // Fetch all users with score > -1 (everyone)
        const users = await prisma.user.findMany({
            select: {
                id: true,
                displayName: true,
                image: true,
                score: true,
            },
            orderBy: [
                { score: 'desc' },
                { displayName: 'asc' }
            ]
        });

        // Format for frontend
        const formattedUsers = users.map(u => ({
            id: u.id,
            displayName: u.displayName || 'Utilisateur',
            image: u.image,
            score: u.score || 0,
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
    }
}
