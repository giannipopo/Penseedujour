"use client";

import { useState } from 'react';
import { Search, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getDivision } from '@/lib/elo';

interface UserSearchResult {
    id: string;
    displayName: string;
    image: string | null;
    elo: number;
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

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.trim().length < 1) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Retour au leaderboard
            </Link>

            <header className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    <Users className="text-primary" />
                    Recherche de Joueurs
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Recherchez un joueur par son pseudo
                </p>
            </header>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Rechercher un joueur..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card pl-12 pr-4 py-4 text-lg outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
            </div>

            {/* Results */}
            {isSearching ? (
                <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : searchResults.length > 0 ? (
                <div className="grid gap-4">
                    {searchResults.map((user) => {
                        const division = getDivision(user.elo);
                        return (
                            <Link
                                key={user.id}
                                href={`/profile/${user.id}`}
                                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold overflow-hidden border-2 border-border">
                                    {user.image ? (
                                        <img src={user.image} alt={user.displayName} className="h-full w-full object-cover" />
                                    ) : (
                                        user.displayName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{user.displayName}</h3>
                                    <div className={`inline-flex mt-1 px-3 py-1 rounded-full border text-xs font-bold ${getDivisionColor(division)}`}>
                                        Division {division}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-extrabold text-yellow-500">
                                        {user.elo}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-medium">
                                        ELO
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : searchQuery.trim().length > 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        🔍
                    </div>
                    <h3 className="text-lg font-bold">Aucun joueur trouvé</h3>
                    <p className="text-muted-foreground">Essayez une autre recherche</p>
                </div>
            ) : (
                <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        👥
                    </div>
                    <h3 className="text-lg font-bold">Commencez votre recherche</h3>
                    <p className="text-muted-foreground">Tapez un pseudo dans la barre de recherche</p>
                </div>
            )}
        </div>
    );
}
