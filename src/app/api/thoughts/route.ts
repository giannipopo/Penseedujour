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
        const include: any = {
            user: {
                select: { displayName: true }
            },
            _count: {
                select: { likes: true }
            }
        };

        if (user) {
            include.likes = {
                where: { userId: user.id },
                select: { id: true }
            };
        }

        const thoughts = await prisma.thought.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include
        });

        const formattedThoughts = (thoughts as any[]).map(t => ({
            ...t,
            likeCount: t._count?.likes ?? 0,
            isLiked: user ? (t.likes && Array.isArray(t.likes) && t.likes.length > 0) : false,
            user: {
                displayName: t.user?.displayName || "Utilisateur"
            }
        }));

        return NextResponse.json(formattedThoughts);
    } catch (error) {
        console.error('Error fetching thoughts:', error);
        return NextResponse.json([], { status: 500 });
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

        // Validation contenu
        const validationError = validateThoughtContent(content || '');
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const dateKey = getDateKeyParis();

        // 1. Compter les pensées de l'utilisateur pour aujourd'hui
        const todayCount = await prisma.thought.count({
            where: {
                userId: user.id,
                dateKey: dateKey
            }
        });

        // 2. Limite de 10 pensées par jour
        if (todayCount >= 10) {
            return NextResponse.json(
                { error: 'Tu as atteint la limite de 10 pensées pour aujourd\'hui.' },
                { status: 429 }
            );
        }

        // 3. Création
        const thought = await prisma.thought.create({
            data: {
                userId: user.id,
                content: content!,
                dateKey,
            },
        });

        return NextResponse.json(thought, { status: 201 });
    } catch (error: any) {
        console.error('Error creating thought:', error);
        return NextResponse.json({ error: 'Une erreur est survenue lors de la création.' }, { status: 500 });
    }
}
