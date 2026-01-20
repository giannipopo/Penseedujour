"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Swords, History, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserSearchInput from '@/components/UserSearchInput';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MatchHistory {
    id: string;
    teamA1Id: string;
    teamA2Id: string | null;
    teamB1Id: string;
    teamB2Id: string | null;
    winner: string;
    eloDelta: number;
    message: string | null;
    createdAt: string;
    teamA1: { displayName: string; image: string | null } | null;
    teamA2: { displayName: string; image: string | null } | null;
    teamB1: { displayName: string; image: string | null } | null;
    teamB2: { displayName: string; image: string | null } | null;
}

export default function ConfrontationPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'single' | 'double'>('single');
    const [showHistory, setShowHistory] = useState(false);
    const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);

    // Single Mode
    const [userA, setUserA] = useState<string>("");
    const [userB, setUserB] = useState<string>("");

    // Double Mode
    const [teamA1, setTeamA1] = useState<string>("");
    const [teamA2, setTeamA2] = useState<string>("");
    const [teamB1, setTeamB1] = useState<string>("");
    const [teamB2, setTeamB2] = useState<string>("");

    const [selectedWinner, setSelectedWinner] = useState<'A' | 'B' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<{ id: string; displayName: string; image: string | null } | null>(null);

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const session = await res.json();
                    if (session?.user) {
                        setCurrentUser({
                            id: session.user.id,
                            displayName: session.user.displayName || session.user.name,
                            image: session.user.image
                        });
                        // Pre-fill with current user
                        setUserA(session.user.id);
                        setTeamA1(session.user.id);
                    }
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    // Fetch match history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/matches');
                if (res.ok) {
                    const data = await res.json();
                    setMatchHistory(data);
                }
            } catch (error) {
                console.error('Error fetching match history:', error);
            }
        };
        fetchHistory();
    }, []);

    const handleConfrontation = async () => {
        if (!selectedWinner) return;
        setIsSubmitting(true);

        let winnerIds: string[] = [];
        let loserIds: string[] = [];

        if (mode === 'single') {
            if (selectedWinner === 'A') {
                winnerIds = [userA];
                loserIds = [userB];
            } else {
                winnerIds = [userB];
                loserIds = [userA];
            }
        } else {
            if (selectedWinner === 'A') {
                winnerIds = [teamA1, teamA2];
                loserIds = [teamB1, teamB2];
            } else {
                winnerIds = [teamB1, teamB2];
                loserIds = [teamA1, teamA2];
            }
        }

        try {
            const res = await fetch('/api/confrontation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winnerIds, loserIds, message }),
            });

            if (!res.ok) throw new Error("Échec de la confrontation");

            router.push('/');
        } catch (err: any) {
            alert(err.message);
            setIsSubmitting(false);
        }
    };

    const loadMatchFromHistory = (match: MatchHistory) => {
        // Determine mode
        const isDouble = match.teamA2Id !== null && match.teamB2Id !== null;
        setMode(isDouble ? 'double' : 'single');

        // Load players
        if (isDouble) {
            setTeamA1(match.teamA1Id);
            setTeamA2(match.teamA2Id!);
            setTeamB1(match.teamB1Id);
            setTeamB2(match.teamB2Id!);
        } else {
            setUserA(match.teamA1Id);
            setUserB(match.teamB1Id);
        }

        setSelectedWinner(null);
        setMessage('');
        setShowHistory(false);
    };

    const isValid = () => {
        if (mode === 'single') return userA && userB && userA !== userB && selectedWinner;
        return teamA1 && teamA2 && teamB1 && teamB2 &&
            new Set([teamA1, teamA2, teamB1, teamB2]).size === 4 &&
            selectedWinner;
    };

    const getExcludedIds = () => {
        if (mode === 'single') {
            return [userA, userB].filter(Boolean);
        }
        return [teamA1, teamA2, teamB1, teamB2].filter(Boolean);
    };

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Retour
            </Link>

            <header className="mb-10 text-center">
                <div className="flex justify-center mb-4">
                    <span className="p-3 bg-red-500/10 rounded-full text-red-500">
                        <Swords size={40} />
                    </span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Nouvelle Confrontation</h1>
                <p className="mt-2 text-muted-foreground">Sélectionnez les adversaires et désignez le vainqueur.</p>

                <div className="mt-6 flex gap-3 justify-center">
                    <div className="inline-flex rounded-lg border border-border bg-card p-1">
                        <button
                            onClick={() => { setMode('single'); setSelectedWinner(null); }}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'single' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
                        >
                            1 VS 1
                        </button>
                        <button
                            onClick={() => { setMode('double'); setSelectedWinner(null); }}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'double' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
                        >
                            2 VS 2
                        </button>
                    </div>

                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
                    >
                        <History className="h-4 w-4" />
                        Historique
                    </button>
                </div>
            </header>

            {/* Match History */}
            {showHistory && (
                <div className="mb-8 rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Matchs récents
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {matchHistory.length > 0 ? matchHistory.map((match) => (
                            <button
                                key={match.id}
                                onClick={() => loadMatchFromHistory(match)}
                                className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">
                                            {match.teamA1?.displayName || 'Joueur 1'}
                                            {match.teamA2 && ` & ${match.teamA2.displayName}`}
                                            {' vs '}
                                            {match.teamB1?.displayName || 'Joueur 2'}
                                            {match.teamB2 && ` & ${match.teamB2.displayName}`}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true, locale: fr })}
                                            {' • '}
                                            +{match.eloDelta} ELO
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucun match enregistré</p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Team A */}
                <div className={`rounded-xl border p-6 transition-all ${selectedWinner === 'A' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' : 'border-border bg-card'}`}>
                    <h2 className="mb-4 text-center font-bold text-lg">{mode === 'single' ? 'Joueur 1' : 'Équipe A'}</h2>

                    <div className="space-y-3">
                        <UserSearchInput
                            value={mode === 'single' ? userA : teamA1}
                            onChange={(id) => {
                                if (mode === 'single') setUserA(id);
                                else setTeamA1(id);
                                setSelectedWinner(null);
                            }}
                            placeholder="Joueur 1..."
                            excludeIds={getExcludedIds()}
                        />

                        {mode === 'double' && (
                            <UserSearchInput
                                value={teamA2}
                                onChange={(id) => {
                                    setTeamA2(id);
                                    setSelectedWinner(null);
                                }}
                                placeholder="Joueur 2..."
                                excludeIds={getExcludedIds()}
                            />
                        )}
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => setSelectedWinner('A')}
                            className={`w-full py-2 px-4 rounded-full font-bold transition-all ${selectedWinner === 'A'
                                ? 'bg-amber-500 text-white shadow-lg scale-105'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                        >
                            {selectedWinner === 'A' ? 'Vainqueurs ! 🏆' : 'Désigner Vainqueurs'}
                        </button>
                    </div>
                </div>

                {/* Team B */}
                <div className={`rounded-xl border p-6 transition-all ${selectedWinner === 'B' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' : 'border-border bg-card'}`}>
                    <h2 className="mb-4 text-center font-bold text-lg">{mode === 'single' ? 'Joueur 2' : 'Équipe B'}</h2>

                    <div className="space-y-3">
                        <UserSearchInput
                            value={mode === 'single' ? userB : teamB1}
                            onChange={(id) => {
                                if (mode === 'single') setUserB(id);
                                else setTeamB1(id);
                                setSelectedWinner(null);
                            }}
                            placeholder="Joueur 1..."
                            excludeIds={getExcludedIds()}
                        />

                        {mode === 'double' && (
                            <UserSearchInput
                                value={teamB2}
                                onChange={(id) => {
                                    setTeamB2(id);
                                    setSelectedWinner(null);
                                }}
                                placeholder="Joueur 2..."
                                excludeIds={getExcludedIds()}
                            />
                        )}
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => setSelectedWinner('B')}
                            className={`w-full py-2 px-4 rounded-full font-bold transition-all ${selectedWinner === 'B'
                                ? 'bg-amber-500 text-white shadow-lg scale-105'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                        >
                            {selectedWinner === 'B' ? 'Vainqueurs ! 🏆' : 'Désigner Vainqueurs'}
                        </button>
                    </div>
                </div>
            </div>

            {selectedWinner && (
                <div className="mb-8 max-w-2xl mx-auto">
                    <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                        Un petit message pour charrier les perdants ? (Optionnel)
                    </label>
                    <textarea
                        className="w-full rounded-xl border border-input bg-card p-4 text-base shadow-sm focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] resize-none"
                        placeholder="Ex: C'était trop facile..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={280}
                    />
                    <div className="mt-1 text-right text-xs text-muted-foreground">
                        {message.length} / 280
                    </div>
                </div>
            )}

            <div className="flex justify-center">
                <button
                    onClick={handleConfrontation}
                    disabled={!isValid() || isSubmitting}
                    className="w-full max-w-sm rounded-full bg-gradient-to-r from-red-500 to-orange-500 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSubmitting ? 'Validation...' : 'Valider le Match 🥊'}
                </button>
            </div>
        </div>
    );
}
