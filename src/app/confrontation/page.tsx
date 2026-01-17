"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Swords, Trophy, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
    id: string;
    displayName: string;
    image: string | null;
}

export default function ConfrontationPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mode, setMode] = useState<'single' | 'double'>('single');

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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (!res.ok) {
                    if (res.status === 403) throw new Error("Accès réservé aux administrateurs");
                    throw new Error("Erreur lors du chargement des utilisateurs");
                }
                const data = await res.json();
                setUsers(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleConfrontation = async () => {
        if (!selectedWinner) return;
        setIsSubmitting(true);

        let winnerIds: string[] = [];

        if (mode === 'single') {
            if (selectedWinner === 'A') winnerIds = [userA];
            if (selectedWinner === 'B') winnerIds = [userB];
        } else {
            if (selectedWinner === 'A') winnerIds = [teamA1, teamA2];
            if (selectedWinner === 'B') winnerIds = [teamB1, teamB2];
        }

        try {
            const res = await fetch('/api/confrontation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winnerIds }),
            });

            if (!res.ok) throw new Error("Échec de la confrontation");

            // Redirect to users list to see score update
            router.push('/users');
        } catch (err: any) {
            alert(err.message);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto flex max-w-2xl justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto flex max-w-2xl flex-col items-center justify-center py-20 text-center">
                <h1 className="text-2xl font-bold text-destructive">Accès Refusé</h1>
                <p className="mt-2 text-muted-foreground">{error}</p>
                <Link href="/" className="mt-8 rounded-full bg-secondary px-6 py-2.5 font-medium">Retry</Link>
            </div>
        );
    }

    const getUser = (id: string) => users.find(u => u.id === id);

    const UserAvatar = ({ id }: { id: string }) => {
        const u = getUser(id);
        if (!u) return <div className="h-12 w-12 rounded-full bg-muted"></div>
        return (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold overflow-hidden border border-border">
                {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : u.displayName.charAt(0)}
            </div>
        )
    }

    const isValid = () => {
        if (mode === 'single') return userA && userB && userA !== userB && selectedWinner;
        return teamA1 && teamA2 && teamB1 && teamB2 &&
            new Set([teamA1, teamA2, teamB1, teamB2]).size === 4 &&
            selectedWinner;
    }

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

                <div className="mt-6 inline-flex rounded-lg border border-border bg-card p-1">
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
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Team A */}
                <div className={`rounded-xl border p-6 transition-all ${selectedWinner === 'A' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' : 'border-border bg-card'}`}>
                    <h2 className="mb-4 text-center font-bold text-lg">{mode === 'single' ? 'Joueur 1' : 'Équipe A'}</h2>

                    <div className="space-y-3">
                        {/* Player A1 */}
                        <select
                            className="w-full rounded-md border border-input bg-background p-2"
                            value={mode === 'single' ? userA : teamA1}
                            onChange={(e) => {
                                if (mode === 'single') setUserA(e.target.value);
                                else setTeamA1(e.target.value);
                                setSelectedWinner(null);
                            }}
                        >
                            <option value="">Sélectionner...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.displayName}</option>
                            ))}
                        </select>

                        {/* Player A2 (Double only) */}
                        {mode === 'double' && (
                            <select
                                className="w-full rounded-md border border-input bg-background p-2"
                                value={teamA2}
                                onChange={(e) => {
                                    setTeamA2(e.target.value);
                                    setSelectedWinner(null);
                                }}
                            >
                                <option value="">Sélectionner...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.displayName}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col items-center">
                        <div className="flex gap-2 justify-center mb-4">
                            {mode === 'single' && userA && <UserAvatar id={userA} />}
                            {mode === 'double' && (
                                <>
                                    {teamA1 && <UserAvatar id={teamA1} />}
                                    {teamA2 && <UserAvatar id={teamA2} />}
                                </>
                            )}
                        </div>
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

                {/* VS Badge */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-20 items-center justify-center">
                    <div className="bg-background rounded-full p-2 border border-border shadow-sm">
                        <span className="font-black text-xl italic text-muted-foreground">VS</span>
                    </div>
                </div>

                {/* Team B */}
                <div className={`rounded-xl border p-6 transition-all ${selectedWinner === 'B' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' : 'border-border bg-card'}`}>
                    <h2 className="mb-4 text-center font-bold text-lg">{mode === 'single' ? 'Joueur 2' : 'Équipe B'}</h2>

                    <div className="space-y-3">
                        {/* Player B1 */}
                        <select
                            className="w-full rounded-md border border-input bg-background p-2"
                            value={mode === 'single' ? userB : teamB1}
                            onChange={(e) => {
                                if (mode === 'single') setUserB(e.target.value);
                                else setTeamB1(e.target.value);
                                setSelectedWinner(null);
                            }}
                        >
                            <option value="">Sélectionner...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.displayName}</option>
                            ))}
                        </select>

                        {/* Player B2 (Double only) */}
                        {mode === 'double' && (
                            <select
                                className="w-full rounded-md border border-input bg-background p-2"
                                value={teamB2}
                                onChange={(e) => {
                                    setTeamB2(e.target.value);
                                    setSelectedWinner(null);
                                }}
                            >
                                <option value="">Sélectionner...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.displayName}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col items-center">
                        <div className="flex gap-2 justify-center mb-4">
                            {mode === 'single' && userB && <UserAvatar id={userB} />}
                            {mode === 'double' && (
                                <>
                                    {teamB1 && <UserAvatar id={teamB1} />}
                                    {teamB2 && <UserAvatar id={teamB2} />}
                                </>
                            )}
                        </div>
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
