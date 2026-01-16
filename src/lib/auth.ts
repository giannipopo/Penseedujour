import { auth } from "@/auth";
import prisma from "./prisma";

export interface User {
    id: string;
    email: string | null;
    displayName: string;
}

/**
 * Gets the current authenticated user.
 * Bridges Auth.js and our app logic.
 */
export async function getCurrentUser(): Promise<User | null> {
    // 1. Check for real session (Auth.js)
    const session = await auth();

    if (session?.user) {
        return {
            id: session.user.id!,
            email: session.user.email ?? null,
            displayName: (session.user as any).displayName || session.user.name || "Utilisateur",
        };
    }

    // 2. DEV_AUTH Fallback: Mock user if configured
    const devUserId = process.env.DEV_AUTH_USER_ID;
    const devDisplayName = process.env.DEV_AUTH_DISPLAYNAME;

    if (devUserId && devDisplayName) {
        const user = await prisma.user.upsert({
            where: { id: devUserId },
            update: { displayName: devDisplayName },
            create: {
                id: devUserId,
                displayName: devDisplayName,
                name: devDisplayName,
                email: 'dev@example.com',
            },
        });

        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName || user.name || "Dev User",
        };
    }

    return null;
}
