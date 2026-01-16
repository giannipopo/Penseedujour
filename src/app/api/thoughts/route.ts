import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getDateKeyParis, validateThoughtContent } from '@/lib/utils';

// GET /api/thoughts?limit=50&category=ALL
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category') || 'ALL';
    const user = await getCurrentUser();

    try {
        const where: any = {};
        if (category !== 'ALL') {
            where.category = category;
        }

        const include: any = {
            user: {
                select: { displayName: true }
            },
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            }
        };

        if (user) {
            include.likes = {
                where: { userId: user.id },
                select: { id: true }
            };
        }

        const thoughts = await prisma.thought.findMany({
            where,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include
        });

        const formattedThoughts = (thoughts as any[]).map(t => ({
            ...t,
            likeCount: t._count?.likes ?? 0,
            commentCount: t._count?.comments ?? 0,
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
        return NextResponse.json({ error: 'Session absente ou expirée. Déconnecte-toi et reconnecte-toi.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const content = body.content?.trim();
        const category = body.category || 'GENERAL';

        // Validation contenu
        const validationError = validateThoughtContent(content || '');
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const dateKey = getDateKeyParis();

        // 1. Vérification que l'utilisateur existe bien en base
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        });

        if (!dbUser) {
            return NextResponse.json({ error: 'Profil introuvable en base. Déconnecte-toi et reconnecte-toi.' }, { status: 403 });
        }

        // 2. Compter les pensées pour aujourd'hui
        const todayCount = await prisma.thought.count({
            where: {
                userId: user.id,
                dateKey: dateKey
            }
        });

        if (todayCount >= 10) {
            return NextResponse.json(
                { error: 'Limite quotidienne (10) atteinte.' },
                { status: 429 }
            );
        }

        // 3. Création
        const thought = await prisma.thought.create({
            data: {
                userId: user.id,
                content: content!,
                category,
                dateKey,
            },
        });

        return NextResponse.json(thought, { status: 201 });
    } catch (error: any) {
        console.error('CRITICAL POST ERROR:', error);
        return NextResponse.json({
            error: `Erreur serveur: ${error.message || 'Inconnue'}`
        }, { status: 500 });
    }
}
