
import prisma from '@/lib/prisma';
import { Trophy, Medal, Award, TrendingUp, ArrowLeft } from 'lucide-react';
import { getDivision } from '@/lib/elo';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLeaderboard() {
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

        return users.map((user, index) => ({
            ...user,
            rank: index + 1,
            division: getDivision(user.elo),
            displayName: user.displayName || 'Utilisateur'
        }));
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
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

function getRankIcon(rank: number) {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
}

export default async function DivisionsPage() {
    const leaderboard = await getLeaderboard();

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Retour
            </Link>
            <header className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-1.5 text-sm font-bold text-yellow-600 mb-4 border border-yellow-200">
                    <TrendingUp className="h-4 w-4" />
                    <span>Classement ELO</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-yellow-500">
                    Toutes les Divisions
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Classement complet de tous les joueurs inscrits
                </p>
            </header>

            <div className="flex flex-col gap-3">
                {leaderboard.length > 0 ? (
                    leaderboard.map((player) => (
                        <div
                            key={player.id}
                            className={`rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${player.rank <= 3
                                ? 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-transparent'
                                : 'border-border bg-card'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank */}
                                <div className="flex-shrink-0 w-12 flex justify-center">
                                    {getRankIcon(player.rank)}
                                </div>

                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold overflow-hidden border-2 border-border">
                                        {player.image ? (
                                            <img src={player.image} className="w-full h-full object-cover" alt={player.displayName} />
                                        ) : (
                                            player.displayName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </div>

                                {/* Name & Stats */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold truncate">{player.displayName}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-muted-foreground">
                                            {player.score} victoire{player.score !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Division Badge */}
                                <div className={`flex-shrink-0 px-4 py-2 rounded-full border font-bold text-sm ${getDivisionColor(player.division)}`}>
                                    Division {player.division}
                                </div>

                                {/* ELO Score */}
                                <div className="flex-shrink-0 text-right">
                                    <div className="text-2xl font-extrabold text-yellow-500">
                                        {player.elo}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-medium">
                                        ELO
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border-2 border-dashed border-border p-20 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            🏆
                        </div>
                        <h3 className="text-lg font-bold">Aucun joueur pour le moment</h3>
                        <p className="text-muted-foreground">Le classement apparaîtra dès les premiers matchs.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
