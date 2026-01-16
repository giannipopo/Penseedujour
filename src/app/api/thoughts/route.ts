import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getDateKeyParis, validateThoughtContent } from '@/lib/utils';

// GET /api/thoughts?limit=50
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const user = await getCurrentUser();

    try {
        const thoughts = await prisma.thought.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { displayName: true }
                },
                _count: {
                    select: { likes: true }
                },
                likes: user ? {
                    where: { userId: user.id },
                    select: { id: true }
                } : false
            }
        });

        const formattedThoughts = thoughts.map(t => ({
            ...t,
            likeCount: t._count.likes,
            isLiked: user ? (t.likes as any[]).length > 0 : false
        }));

        return NextResponse.json(formattedThoughts);
    } catch (error) {
        console.error('Error fetching thoughts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/thoughts
export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const content = body.content?.trim();

        // Validation
        const validationError = validateThoughtContent(content || '');
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const dateKey = getDateKeyParis();

        // Create thought with unique constraint handling
        const thought = await prisma.thought.create({
            data: {
                userId: user.id,
                content: content!,
                dateKey,
            },
        });

        return NextResponse.json(thought, { status: 201 });
    } catch (error: any) {
        // Prisma P2002 is Unique constraint failed
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Tu as déjà posté ta pensée du jour.' },
                { status: 409 }
            );
        }
        console.error('Error creating thought:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
