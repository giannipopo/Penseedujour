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
    const [userA, setUserA] = useState<string>("");
    const [userB, setUserB] = useState<string>("");
    const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
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
        try {
            const res = await fetch('/api/confrontation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winnerId: selectedWinner }),
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

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
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
                <p className="mt-2 text-muted-foreground">Sélectionnez deux adversaires et désignez le vainqueur.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* User A Selection */}
                <div className={`rounded-xl border p-6 transition-all ${selectedWinner === userA && userA ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' : 'border-border bg-card'}`}>
                    <label className="mb-2 block text-sm font-medium">Adversaire 1</label>
                    <select
                        className="w-full rounded-md border border-input bg-background p-2"
                        value={userA}
                        onChange={(e) => {
                            setUserA(e.target.value);
                            if (selectedWinner === userA) setSelectedWinner(null);
                        }}
                    >
                        <option value="">Sélectionner...</option>
                        {users.filter(u => u.id !== userB).map(u => (
                            <option key={u.id} value={u.id}>{u.displayName}</option>
                        ))}
                    </select>

                    {userA && (
                        <div className="mt-6 flex flex-col items-center">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold mb-4">
                                {getUser(userA)?.image ? <img src={getUser(userA)?.image!} className="w-full h-full rounded-full object-cover" /> : getUser(userA)?.displayName.charAt(0)}
                            </div>
                            <button
                                onClick={() => setSelectedWinner(userA)}
                                className={`w-full py-2 px-4 rounded-full font-bold transition-all ${selectedWinner === userA
                                    ? 'bg-amber-500 text-white shadow-lg scale-105'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                            >
                                {selectedWinner === userA ? 'Vainqueur ! 🏆' : 'Désigner Vainqueur'}
                            </button>
                        </div>
                    )}
                </div>

                {/* VS Badge */}
                <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:translate-y-12 flex justify-center py-4 md:py-0">
                    <span className="font-black text-2xl italic text-muted-foreground/30">VS</span>
                </div>

                {/* User B Selection */}
                <div className={`rounded-xl border p-6 transition-all ${selectedWinner === userB && userB ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' : 'border-border bg-card'}`}>
                    <label className="mb-2 block text-sm font-medium">Adversaire 2</label>
                    <select
                        className="w-full rounded-md border border-input bg-background p-2"
                        value={userB}
                        onChange={(e) => {
                            setUserB(e.target.value);
                            if (selectedWinner === userB) setSelectedWinner(null);
                        }}
                    >
                        <option value="">Sélectionner...</option>
                        {users.filter(u => u.id !== userA).map(u => (
                            <option key={u.id} value={u.id}>{u.displayName}</option>
                        ))}
                    </select>

                    {userB && (
                        <div className="mt-6 flex flex-col items-center">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold mb-4">
                                {getUser(userB)?.image ? <img src={getUser(userB)?.image!} className="w-full h-full rounded-full object-cover" /> : getUser(userB)?.displayName.charAt(0)}
                            </div>
                            <button
                                onClick={() => setSelectedWinner(userB)}
                                className={`w-full py-2 px-4 rounded-full font-bold transition-all ${selectedWinner === userB
                                    ? 'bg-amber-500 text-white shadow-lg scale-105'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                            >
                                {selectedWinner === userB ? 'Vainqueur ! 🏆' : 'Désigner Vainqueur'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleConfrontation}
                    disabled={!selectedWinner || isSubmitting}
                    className="w-full max-w-sm rounded-full bg-gradient-to-r from-red-500 to-orange-500 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSubmitting ? 'Validation...' : 'Valider le Match 🥊'}
                </button>
            </div>
        </div>
    );
}
