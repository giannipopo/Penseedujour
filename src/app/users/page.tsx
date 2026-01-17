"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UserData {
    id: string;
    displayName: string;
    image: string | null;
    createdAt: string;
    thoughtCount: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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
                <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                    <Shield size={40} />
                </div>
                <h1 className="text-2xl font-bold text-destructive">Accès Refusé</h1>
                <p className="mt-2 text-muted-foreground">{error}</p>
                <Link href="/" className="mt-8 rounded-full bg-secondary px-6 py-2.5 font-medium transition-colors hover:bg-secondary/80">
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Retour au flux
            </Link>

            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <Users className="text-primary" />
                        Utilisateurs
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Liste des {users.length} membres de la communauté.
                    </p>
                </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                            {user.image ? (
                                <img src={user.image} alt={user.displayName} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                user.displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{user.displayName}</h3>
                            <div className="flex flex-col text-xs text-muted-foreground">
                                <span>Inscrit le {format(new Date(user.createdAt), 'd MMMM yyyy', { locale: fr })}</span>
                                <span className="text-primary font-medium mt-0.5">{user.thoughtCount} feedback{user.thoughtCount > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
