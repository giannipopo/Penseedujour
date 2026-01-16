import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getDateKeyParis } from '@/lib/utils';
import ThoughtForm from '@/components/ThoughtForm';
import ThoughtCard from '@/components/ThoughtCard';
import Link from 'next/link';
import { LogIn, ArrowLeft, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getUserTodayState(userId: string) {
    try {
        const dateKey = getDateKeyParis();

        // On récupère toutes les pensées du jour pour cet utilisateur
        const thoughts = await prisma.thought.findMany({
            where: {
                userId,
                dateKey,
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                likes: {
                    where: { userId },
                    select: { id: true }
                }
            }
        });

        return {
            count: thoughts.length,
            thoughts: thoughts.map(t => ({
                ...t,
                likeCount: (t as any)._count?.likes ?? 0,
                commentCount: (t as any)._count?.comments ?? 0,
                isLiked: ((t as any).likes && Array.isArray((t as any).likes) && (t as any).likes.length > 0)
            }))
        };
    } catch (error) {
        console.error("Error fetching user today thought:", error);
        return { count: 0, thoughts: [] };
    }
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
                </div>
            </div>
        );
    }

    const { count, thoughts } = await getUserTodayState(user.id);
    const canPost = count < 10;

    return (
        <div className="container mx-auto max-w-xl px-4 py-12">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Retour au flux
            </Link>

            <header className="mb-10">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                    <span>{count} / 10 pensées aujourd'hui</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                    Mes pensées du jour
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Partagez jusqu'à 10 inspirations par jour.
                </p>
            </header>

            <div className="space-y-12">
                {/* Formulaire - s'affiche s'il reste des quotas */}
                {canPost ? (
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
                        <ThoughtForm />
                    </div>
                ) : (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400">
                        <div className="flex items-center gap-2 mb-2 font-bold">
                            <Sparkles className="h-5 w-5" />
                            <span>Limite atteinte !</span>
                        </div>
                        <p>Tu as déjà partagé 10 pensées aujourd'hui. Reviens demain pour de nouvelles inspirations !</p>
                    </div>
                )}

                {/* Historique du jour */}
                {thoughts.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            Mes publications du jour
                        </h3>
                        <div className="flex flex-col gap-6">
                            {thoughts.map((thought) => (
                                <ThoughtCard
                                    key={thought.id}
                                    id={thought.id}
                                    displayName={user.displayName}
                                    content={thought.content}
                                    createdAt={thought.createdAt}
                                    initialLikeCount={thought.likeCount}
                                    initialIsLiked={thought.isLiked}
                                    isAuthenticated={true}
                                    initialCommentCount={thought.commentCount}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
