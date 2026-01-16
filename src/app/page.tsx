import prisma from '@/lib/prisma';
import ThoughtCard from '@/components/ThoughtCard';
import { Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

// Force dynamic to ensure we get fresh data and don't fail during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getThoughts(currentUserId?: string) {
  // On construit l'objet include proprement
  const include: any = {
    user: {
      select: { displayName: true }
    },
    _count: {
      select: { likes: true }
    }
  };

  // On n'ajoute la vérification du like que si on a un utilisateur
  if (currentUserId) {
    include.likes = {
      where: { userId: currentUserId },
      select: { id: true }
    };
  }

  const thoughts = await prisma.thought.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include
  });

  return thoughts.map(thought => ({
    ...thought,
    likeCount: thought._count?.likes ?? 0,
    isLiked: currentUserId ? (thought.likes && (thought.likes as any[]).length > 0) : false
  }));
}

export default async function Home() {
  const user = await getCurrentUser();
  const thoughts = await getThoughts(user?.id);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Le flux des inspirations</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Les pensées du jour
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Chaque jour, une nouvelle chance de partager ce qui compte.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {thoughts.length > 0 ? (
          thoughts.map((thought: any) => (
            <ThoughtCard
              key={thought.id}
              id={thought.id}
              displayName={thought.user.displayName}
              content={thought.content}
              createdAt={thought.createdAt}
              initialLikeCount={thought.likeCount}
              initialIsLiked={thought.isLiked}
              isAuthenticated={!!user}
            />
          ))
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border p-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              💭
            </div>
            <h3 className="text-lg font-bold">Aucune pensée pour le moment</h3>
            <p className="text-muted-foreground">Soyez le premier à partager la vôtre !</p>
          </div>
        )}
      </div>
    </div>
  );
}
