import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getDateKeyParis } from '@/lib/utils';
import ThoughtForm from '@/components/ThoughtForm';
import ThoughtCard from '@/components/ThoughtCard';
import Link from 'next/link';
import { LogIn, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getUserTodayThought(userId: string) {
    const dateKey = getDateKeyParis();
    const thought = await prisma.thought.findUnique({
        where: {
            userId_dateKey: {
                userId,
                dateKey,
            },
        },
        include: {
            _count: {
                select: { likes: true }
            },
            likes: {
                where: { userId },
                select: { id: true }
            }
        }
    });

    if (!thought) return null;

    return {
        ...thought,
        likeCount: thought._count.likes,
        isLiked: thought.likes.length > 0
    };
}

export default async function PostPage() {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="container mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
                <div className="rounded-2xl border border-border bg-card p-12 shadow-xl">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <LogIn className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold">Connexion requise</h2>
                    <p className="mt-4 text-muted-foreground">
                        Vous devez être connecté pour partager votre pensée du jour.
                    </p>
                    <div className="mt-8 flex flex-col gap-3">
                        <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 text-sm border border-yellow-100 dark:bg-yellow-900/10 dark:text-yellow-500 dark:border-yellow-900/30">
                            Note: En mode développement, assurez-vous de configurer <code>DEV_AUTH_USER_ID</code> dans votre fichier .env
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const todayThought = await getUserTodayThought(user.id);

    return (
        <div className="container mx-auto max-w-xl px-4 py-12">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Retour au feed
            </Link>

            <header className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight">
                    Ma pensée du jour
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Partagez une inspiration, un moment ou une idée. Une seule fois par jour.
                </p>
            </header>

            {todayThought ? (
                <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400">
                        <p className="font-medium">Tu as déjà posté ta pensée du jour.</p>
                        <p className="text-sm opacity-80">Reviens demain pour une nouvelle inspiration !</p>
                    </div>
                    <ThoughtCard
                        id={todayThought.id}
                        displayName={user.displayName}
                        content={todayThought.content}
                        createdAt={todayThought.createdAt}
                        initialLikeCount={todayThought.likeCount}
                        initialIsLiked={todayThought.isLiked}
                        isAuthenticated={true}
                    />
                </div>
            ) : (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
                    <ThoughtForm />
                </div>
            )}
        </div>
    );
}
