import { auth } from "@/auth";
import prisma from "./prisma";

export interface User {
    id: string;
    email: string | null;
    name: string | null;
    displayName: string;
    role: string;
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

            // Fetch role from DB to ensure it's up to date
            const dbUserRole = await prisma.user.findUnique({
                where: { id },
                select: { role: true, displayName: true }
            });

            const role = dbUserRole?.role || "USER";

            // Sync displayName if needed (already existing logic, slightly refactored)
            if (dbUserRole && !dbUserRole.displayName && displayName !== "Utilisateur") {
                try {
                    await prisma.user.update({
                        where: { id },
                        data: { displayName }
                    });
                } catch (e) {
                    console.error("Failed to sync displayName to DB", e);
                }
            }

            return {
                id,
                email,
                name,
                displayName,
                role
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
                    role: "ADMIN" // Dev user is admin by default
                };
            }
        }
    } catch (error) {
        console.error("Auth check failed:", error);
        return null;
    }

    return null;
}
