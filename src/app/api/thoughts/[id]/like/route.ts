import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: thoughtId } = await params;

    try {
        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_thoughtId: {
                    userId: user.id,
                    thoughtId: thoughtId,
                },
            },
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    userId: user.id,
                    thoughtId: thoughtId,
                },
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
