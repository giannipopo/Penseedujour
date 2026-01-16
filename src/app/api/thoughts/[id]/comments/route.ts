import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET comments for a thought
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: thoughtId } = await params;

    try {
        const comments = await prisma.comment.findMany({
            where: { thoughtId },
            include: {
                user: {
                    select: { displayName: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Safe response
        const safeComments = comments.map(c => ({
            ...c,
            user: {
                displayName: c.user?.displayName || "Utilisateur"
            }
        }));

        return NextResponse.json(safeComments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
    }
}

// POST a new comment
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Vous devez être connecté pour commenter.' }, { status: 401 });
    }

    try {
        const { id: thoughtId } = await params;
        const body = await request.json();
        const content = body.content?.trim();

        if (!content || content.length > 500) {
            return NextResponse.json({ error: 'Le commentaire doit faire entre 1 et 500 caractères.' }, { status: 400 });
        }

        // Verify thought exists
        const thought = await prisma.thought.findUnique({
            where: { id: thoughtId }
        });

        if (!thought) {
            return NextResponse.json({ error: 'Pensée introuvable.' }, { status: 404 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                userId: user.id,
                thoughtId,
            },
            include: {
                user: {
                    select: { displayName: true }
                }
            }
        });

        return NextResponse.json({
            ...comment,
            user: {
                displayName: comment.user?.displayName || "Utilisateur"
            }
        });

    } catch (error: any) {
        console.error('Error posting comment:', error);
        return NextResponse.json({ error: `Erreur serveur: ${error.message}` }, { status: 500 });
    }
}
