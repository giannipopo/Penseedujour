"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, Shield, Award, Crown } from 'lucide-react';

interface UserData {
    id: string;
    displayName: string;
    image: string | null;
    score: number;
}

// Logic: 0->Div5, 2->Div4...
const getDivision = (score: number) => {
    if (score >= 8) return 1;
    if (score >= 6) return 2;
    if (score >= 4) return 3;
    if (score >= 2) return 4;
    return 5;
};

const DivisionSection = ({ division, users, icon: Icon, color, title }: { division: number, users: UserData[], icon: any, color: string, title: string }) => {
    return (
        <div className={`mb-8 w-full rounded-2xl border ${color} bg-card overflow-hidden shadow-sm`}>
            <div className={`px-6 py-4 ${color.replace('border-', 'bg-').replace('-500', '-500/10')} flex items-center gap-3 border-b ${color}`}>
                <Icon className={`h-6 w-6 ${color.replace('border-', 'text-')}`} />
                <h2 className="text-xl font-bold">{title}</h2>
                <span className="ml-auto rounded-full bg-background px-3 py-1 text-xs font-bold text-muted-foreground">
                    {users.length} Joueur{users.length > 1 ? 's' : ''}
                </span>
            </div>
            <div className="p-4">
                {users.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground italic">
                        Aucun joueur dans cette division.
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                                    {user.image ? (
                                        <img src={user.image} alt={user.displayName} className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        user.displayName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="truncate font-semibold text-sm">{user.displayName}</div>
                                    <div className="text-xs text-muted-foreground">Score: {user.score} points</div>
                                </div>
                                {division === 1 && (
                                    <Crown className="h-4 w-4 text-yellow-500 animate-pulse" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function DivisionsPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/leaderboard');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setUsers(data);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const usersByDivision = {
        1: users.filter(u => getDivision(u.score) === 1),
        2: users.filter(u => getDivision(u.score) === 2),
        3: users.filter(u => getDivision(u.score) === 3),
        4: users.filter(u => getDivision(u.score) === 4),
        5: users.filter(u => getDivision(u.score) === 5),
    };

    if (isLoading) {
        return (
            <div className="container mx-auto flex max-w-2xl justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Retour au flux
            </Link>

            <header className="mb-10 text-center">
                <h1 className="text-4xl font-black tracking-tight mb-2">Classement</h1>
                <p className="text-muted-foreground">Montez les échelons et dominez le Ranko !</p>
            </header>

            <DivisionSection
                division={1}
                users={usersByDivision[1]}
                icon={Trophy}
                color="border-yellow-500"
                title="Division 1 - Élite"
            />
            <DivisionSection
                division={2}
                users={usersByDivision[2]}
                icon={Medal}
                color="border-slate-400"
                title="Division 2 - Challenger"
            />
            <DivisionSection
                division={3}
                users={usersByDivision[3]}
                icon={Award}
                color="border-amber-700"
                title="Division 3 - Vétéran"
            />
            <DivisionSection
                division={4}
                users={usersByDivision[4]}
                icon={Shield}
                color="border-blue-500"
                title="Division 4 - Confirmé"
            />
            <DivisionSection
                division={5}
                users={usersByDivision[5]}
                icon={Shield}
                color="border-slate-200"
                title="Division 5 - Rookie"
            />
        </div>
    );
}
