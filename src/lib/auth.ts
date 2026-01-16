import { auth } from "@/auth";
import prisma from "./prisma";

export interface User {
    id: string;
    email: string | null;
    name: string | null;
    displayName: string;
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        // 1. Check for real session (Auth.js)
        const session = await auth();

        if (session?.user) {
            const id = session.user.id!;
            const email = session.user.email ?? null;
            const name = session.user.name ?? null;
            const displayName = (session.user as any).displayName || session.user.name || "Utilisateur";

            // SÉCURITÉ : On s'assure que le displayName est en base pour le feed
            // On ne le fait que si on a un ID valide et que c'est une requête réelle
            try {
                // On vérifie si l'utilisateur a déjà un displayName en base
                const dbUser = await prisma.user.findUnique({
                    where: { id },
                    select: { displayName: true }
                });

                if (dbUser && !dbUser.displayName && displayName !== "Utilisateur") {
                    await prisma.user.update({
                        where: { id },
                        data: { displayName }
                    });
                }
            } catch (e) {
                console.error("Failed to sync displayName to DB", e);
            }

            return {
                id,
                email,
                name,
                displayName,
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
        console.error("Auth check failed:", error);
        return null;
    }

    return null;
}
