import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/users
export async function GET(request: Request) {
    const user = await getCurrentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès réservé, petit curieux ! 🚫' }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                displayName: true,
                image: true,
                createdAt: true,
                _count: {
                    select: { thoughts: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format for frontend
        const formattedUsers = users.map(u => ({
            id: u.id,
            displayName: u.displayName || 'Utilisateur',
            image: u.image,
            createdAt: u.createdAt,
            thoughtCount: u._count.thoughts
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
    }
}
