import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/thoughts/[id]/moderate
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();

    // 1. Check strict authentication and ADMIN role
    if (!user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
    });

    if (dbUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès refusé. Rôle ADMIN requis.' }, { status: 403 });
    }

    try {
        const { id: thoughtId } = await params;
        const { action } = await request.json(); // 'hide' | 'delete'

        if (!['hide', 'delete'].includes(action)) {
            return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
        }

        if (action === 'delete') {
            await prisma.thought.delete({
                where: { id: thoughtId }
            });
            return NextResponse.json({ message: 'Feedback supprimé définitivement' });
        }

        if (action === 'hide') {
            const thought = await prisma.thought.findUnique({ where: { id: thoughtId } });
            const newState = !thought?.isHidden;

            await prisma.thought.update({
                where: { id: thoughtId },
                data: { isHidden: newState }
            });
            return NextResponse.json({
                message: newState ? 'Feedback masqué' : 'Feedback visible',
                isHidden: newState
            });
        }

    } catch (error: any) {
        console.error('Moderation Error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
