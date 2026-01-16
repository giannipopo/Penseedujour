import { auth } from "@/auth";
import prisma from "./prisma";

export interface User {
    id: string;
    email: string | null;
    name: string | null;
    displayName: string;
}

export async function getCurrentUser(): Promise<User | null> {
    // SÉCURITÉ BUILD : Si on est en train de compiler sur Vercel, on ignore l'auth
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === 'production' && !process.env.DATABASE_URL) {
        return null;
    }

    try {
        // 1. Check for real session (Auth.js)
        const session = await auth();

        if (session?.user) {
            return {
                id: session.user.id!,
                email: session.user.email ?? null,
                name: session.user.name ?? null,
                displayName: (session.user as any).displayName || session.user.name || "Utilisateur",
            };
        }

        // 2. DEV_AUTH Fallback (Uniquement en local)
        if (process.env.NODE_ENV === 'development') {
            const devUserId = process.env.DEV_AUTH_USER_ID;
            const devDisplayName = process.env.DEV_AUTH_DISPLAYNAME;

            if (devUserId && devDisplayName) {
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
                    name: null,
                    displayName: user.displayName || "Dev User",
                };
            }
        }
    } catch (error) {
        // En cas d'erreur (surtout pendant le build), on ne fait pas planter le site
        console.warn("Auth check skipped or failed during build/runtime:", error);
        return null;
    }

    return null;
}
