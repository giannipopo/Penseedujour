import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/users/search?q=query
export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (query.length < 1) {
            return NextResponse.json([]);
        }

        const users = await prisma.user.findMany({
            where: {
                displayName: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                displayName: true,
                image: true,
                elo: true,
            },
            take: 10,
            orderBy: {
                displayName: 'asc'
            }
        });

        return NextResponse.json(users);

    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }
}
