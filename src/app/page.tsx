import prisma from '@/lib/prisma';
import ThoughtCard from '@/components/ThoughtCard';
import { Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';

async function getThoughts(currentUserId?: string, category: string = 'ALL') {
  try {
    const where: any = {};
    if (category !== 'ALL') {
      where.category = category;
    }

    const include: any = {
      user: {
        select: { displayName: true }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    };

    if (currentUserId) {
      include.likes = {
        where: { userId: currentUserId },
        select: { id: true }
      };
    }

    const thoughts = await prisma.thought.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
      include
    });

    return (thoughts as any[]).map(thought => ({
      ...thought,
      likeCount: thought._count?.likes ?? 0,
      commentCount: thought._count?.comments ?? 0,
      isLiked: currentUserId ? (thought.likes && Array.isArray(thought.likes) && thought.likes.length > 0) : false
    }));
  } catch (error) {
    console.error("Error fetching thoughts:", error);
    return [];
  }
}

interface HomeProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { category = 'ALL' } = await searchParams;
  const sessionUser = await getCurrentUser();

  let userRole = 'USER';
  if (sessionUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { role: true }
    });
    userRole = dbUser?.role || 'USER';
  }

  const thoughts = await getThoughts(sessionUser?.id, category);

  const tabs = [
    { id: 'ALL', label: 'Tout' },
    { id: 'DESIGN', label: 'Design' },
    { id: 'BUGS', label: 'Bugs' },
    { id: 'USABILITY', label: 'Facilité d\'utilisation' },
  ];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-1.5 text-sm font-bold text-yellow-600 mb-4 border border-yellow-200">
          <Sparkles className="h-4 w-4" />
          <span>Ranko Request</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-yellow-500">
          Ranko Request
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Aidez-nous à améliorer l'application Padel. Signalez des bugs, proposez des designs ou donnez votre avis.
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === 'ALL' ? '/' : `/?category=${tab.id}`}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${category === tab.id
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25 scale-105'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {thoughts.length > 0 ? (
          thoughts.map((thought: any) => (
            <ThoughtCard
              key={thought.id}
              id={thought.id}
              displayName={thought.user?.displayName || "Utilisateur"}
              content={thought.content}
              createdAt={thought.createdAt}
              initialLikeCount={thought.likeCount}
              initialIsLiked={thought.isLiked}
              isAuthenticated={!!sessionUser}
              initialCommentCount={thought.commentCount}
              userRole={userRole}
              isHidden={thought.isHidden}
              category={thought.category}
            />
          ))
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border p-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              🚀
            </div>
            <h3 className="text-lg font-bold">Aucun feedback pour le moment</h3>
            <p className="text-muted-foreground">Soyez le premier à poster dans cette catégorie !</p>
          </div>
        )}
      </div>

    </div>
  );
}
