'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Target, Calendar, Award } from 'lucide-react';
import { getDivision } from '@/lib/elo';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserStats {
    user: {
        id: string;
        displayName: string;
        image: string | null;
        elo: number;
        score: number;
        createdAt: string;
    };
    stats: {
        totalMatches: number;
        wins: number;
        losses: number;
        winRate: number;
        eloProgression: number;
        currentElo: number;
    };
    eloHistory: { date: string; elo: number; delta: number }[];
    recentMatches: any[];
}

function getDivisionColor(division: number): string {
    const colors = [
        'bg-slate-500/10 text-slate-600 border-slate-300',
        'bg-amber-500/10 text-amber-600 border-amber-300',
        'bg-blue-500/10 text-blue-600 border-blue-300',
        'bg-purple-500/10 text-purple-600 border-purple-300',
        'bg-red-500/10 text-red-600 border-red-300',
        'bg-emerald-500/10 text-emerald-600 border-emerald-300',
    ];
    return colors[Math.min(division, colors.length - 1)];
}

export default function ProfileView({ userId, isOwnProfile }: { userId: string; isOwnProfile: boolean }) {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/users/${userId}/stats`);
                if (!res.ok) throw new Error('Erreur lors du chargement des statistiques');
                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="container mx-auto flex max-w-4xl justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center py-20 text-center">
                <h1 className="text-2xl font-bold text-destructive">Erreur</h1>
                <p className="mt-2 text-muted-foreground">{error || 'Impossible de charger les statistiques'}</p>
                <Link href="/" className="mt-8 rounded-full bg-secondary px-6 py-2.5 font-medium">
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    const division = getDivision(stats.user.elo);

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Retour au leaderboard
            </Link>

            {/* Header */}
            <div className="mb-8 rounded-2xl border-2 border-border bg-gradient-to-br from-card to-muted/20 p-8">
                <div className="flex items-center gap-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold overflow-hidden border-4 border-border">
                        {stats.user.image ? (
                            <img src={stats.user.image} className="w-full h-full object-cover" alt={stats.user.displayName} />
                        ) : (
                            stats.user.displayName.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold">{stats.user.displayName}</h1>
                        <div className="mt-2 flex items-center gap-3">
                            <div className={`inline-flex px-4 py-1.5 rounded-full border font-bold text-sm ${getDivisionColor(division)}`}>
                                Division {division}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Membre depuis {formatDistanceToNow(new Date(stats.user.createdAt), { addSuffix: true, locale: fr })}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-extrabold text-yellow-500">{stats.user.elo}</div>
                        <div className="text-sm text-muted-foreground font-medium">ELO</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                    <Target className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                    <div className="text-2xl font-bold">{stats.stats.totalMatches}</div>
                    <div className="text-sm text-muted-foreground">Matchs joués</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 text-center">
                    <Trophy className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <div className="text-2xl font-bold text-green-600">{stats.stats.wins}</div>
                    <div className="text-sm text-muted-foreground">Victoires</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 text-center">
                    <Award className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                    <div className="text-2xl font-bold">{stats.stats.winRate}%</div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 text-center">
                    {stats.stats.eloProgression >= 0 ? (
                        <TrendingUp className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    ) : (
                        <TrendingDown className="mx-auto h-8 w-8 text-red-500 mb-2" />
                    )}
                    <div className={`text-2xl font-bold ${stats.stats.eloProgression >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.stats.eloProgression >= 0 ? '+' : ''}{stats.stats.eloProgression}
                    </div>
                    <div className="text-sm text-muted-foreground">Progression ELO</div>
                </div>
            </div>

            {/* Match History */}
            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Historique des matchs
                </h2>

                {stats.recentMatches.length > 0 ? (
                    <div className="space-y-3">
                        {stats.recentMatches.map((match) => (
                            <div
                                key={match.id}
                                className={`rounded-lg border p-4 ${match.isWinner
                                        ? 'border-green-500/30 bg-green-500/5'
                                        : 'border-red-500/30 bg-red-500/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">
                                            <span className={match.winner === 'A' ? 'font-bold' : ''}>
                                                {match.teamA1?.displayName}
                                                {match.teamA2 && ` & ${match.teamA2.displayName}`}
                                            </span>
                                            {' vs '}
                                            <span className={match.winner === 'B' ? 'font-bold' : ''}>
                                                {match.teamB1?.displayName}
                                                {match.teamB2 && ` & ${match.teamB2.displayName}`}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true, locale: fr })}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-bold ${match.isWinner ? 'text-green-600' : 'text-red-600'}`}>
                                            {match.isWinner ? 'VICTOIRE' : 'DÉFAITE'}
                                        </div>
                                        <div className={`text-sm font-medium ${match.userDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {match.userDelta >= 0 ? '+' : ''}{match.userDelta} ELO
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Aucun match joué pour le moment
                    </div>
                )}
            </div>
        </div>
    );
}
