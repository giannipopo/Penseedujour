import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHub,
        Google,
        Resend({
            apiKey: process.env.AUTH_RESEND_KEY || process.env.EMAIL_SERVER_PASSWORD,
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // @ts-ignore
                session.user.displayName = (user as any).displayName || user.name || "Utilisateur";
            }
            return session;
        },
    },
    trustHost: true,
    secret: process.env.AUTH_SECRET,
})
