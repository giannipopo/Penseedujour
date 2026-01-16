import prisma from './prisma';

export interface User {
    id: string;
    email: string | null;
    displayName: string;
}

/**
 * Gets the current authenticated user.
 * In a real app, this would use Auth.js / NextAuth.
 * For now, it uses mock data from environment variables if available.
 */
export async function getCurrentUser(): Promise<User | null> {
    // DEV_AUTH logic: Mock user if real auth is not yet set up
    const devUserId = process.env.DEV_AUTH_USER_ID;
    const devDisplayName = process.env.DEV_AUTH_DISPLAYNAME;

    if (devUserId && devDisplayName) {
        // Ensure the dev user exists in the DB
        const user = await prisma.user.upsert({
            where: { id: devUserId },
            update: { displayName: devDisplayName },
            create: {
                id: devUserId,
                displayName: devDisplayName,
                email: 'dev@example.com',
            },
        });

        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        };
    }

    // --- BRACHING NEXTAUTH LATER ---
    // import { getServerSession } from "next-auth/next"
    // import { authOptions } from "@/app/api/auth/[...nextauth]/route"
    // const session = await getServerSession(authOptions)
    // if (!session?.user) return null;
    // return session.user;

    return null;
}
