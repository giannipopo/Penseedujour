import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Nodemailer from "next-auth/providers/nodemailer"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHub,
        Google,
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // @ts-ignore
                session.user.displayName = user.displayName || user.name || "Utilisateur";
            }
            return session;
        },
    },
})
