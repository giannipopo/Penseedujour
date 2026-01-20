import prisma from '@/lib/prisma';
import { Trophy, Medal, Award, TrendingUp, ArrowRight, LayoutDashboard } from 'lucide-react';
import { getDivision } from '@/lib/elo';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getUserRank(userId: string) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        image: true,
        elo: true,
        score: true,
      },
      orderBy: {
        elo: 'desc'
      }
    });

    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    const user = users[index];
    return {
      ...user,
      rank: index + 1,
      division: getDivision(user.elo),
      displayName: user.displayName || 'Utilisateur',
      totalPlayers: users.length
    };
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return null;
  }
}

function getDivisionColor(division: number): string {
  const colors = [
    'bg-slate-500/10 text-slate-600 border-slate-300', // Div 0
    'bg-amber-500/10 text-amber-600 border-amber-300', // Div 1
    'bg-blue-500/10 text-blue-600 border-blue-300',    // Div 2
    'bg-purple-500/10 text-purple-600 border-purple-300', // Div 3
    'bg-red-500/10 text-red-600 border-red-300',       // Div 4
    'bg-emerald-500/10 text-emerald-600 border-emerald-300', // Div 5+
  ];
  return colors[Math.min(division, colors.length - 1)];
}

export default async function Home() {
  const currentUser = await getCurrentUser();
  const userRank = currentUser ? await getUserRank(currentUser.id) : null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 flex flex-col items-center">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-1.5 text-sm font-bold text-yellow-600 mb-4 border border-yellow-200">
          <TrendingUp className="h-4 w-4" />
          <span>Tableau de Bord</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-yellow-500">
          Ranko Request
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Gérez vos matchs et suivez votre progression.
        </p>
      </header>

      {userRank ? (
        <div className="w-full max-w-lg mb-8">
          <div className={`rounded-2xl border-2 p-8 transition-all hover:shadow-lg ${userRank.rank <= 3
            ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent'
            : 'border-border bg-card'
            }`}>
            <div className="flex flex-col items-center text-center">

              {/* Avatar */}
              <div className="mb-4">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-background shadow-xl">
                  {userRank.image ? (
                    <img src={userRank.image} className="w-full h-full object-cover" alt={userRank.displayName} />
                  ) : (
                    userRank.displayName.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">{userRank.displayName}</h2>

              <div className={`inline-flex px-4 py-1.5 rounded-full border font-bold text-sm mb-6 ${getDivisionColor(userRank.division)}`}>
                Division {userRank.division}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mb-6">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Classement</div>
                  <div className="text-2xl font-extrabold">#{userRank.rank}<span className="text-sm text-muted-foreground font-medium">/{userRank.totalPlayers}</span></div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">ELO Score</div>
                  <div className="text-2xl font-extrabold text-yellow-500">{userRank.elo}</div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {userRank.score} victoire{userRank.score !== 1 ? 's' : ''} au total
              </div>
            </div>
          </div>
        </div>
      ) : (
        !currentUser && (
          <div className="mb-10 text-center">
            <Link href="/auth/signin" className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-lg font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all">
              Se connecter pour voir mon rang
            </Link>
          </div>
        )
      )}

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <Link href="/divisions" className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-accent transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold">Toutes les Divisions</span>
              <span className="text-xs text-muted-foreground">Voir le classement global</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/confrontation" className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-accent transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold">Nouveau Match</span>
              <span className="text-xs text-muted-foreground">Enregistrer un score</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
