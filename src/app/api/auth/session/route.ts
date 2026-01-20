import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                displayName: user.displayName,
                email: user.email,
                image: user.image,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ user: null });
    }
}
