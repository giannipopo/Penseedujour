'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Users, Swords, Menu, X, LogOut } from 'lucide-react';

interface User {
    id: string;
    role: string;
    displayName?: string | null;
    image?: string | null;
    name?: string | null;
}

interface NavbarContentProps {
    user: User | null;
    logoutAction: () => Promise<void>;
}

export default function NavbarContent({ user, logoutAction }: NavbarContentProps) {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    // Initial used for avatar
    const userInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.name?.charAt(0).toUpperCase() || "U");

    return (
        <>
            {/* Desktop Navigation - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <Trophy className="h-4 w-4" />
                    <span className="hidden lg:inline">Leaderboard</span>
                </Link>
                {user?.role === 'ADMIN' && (
                    <Link
                        href="/users"
                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Users className="h-4 w-4" />
                        <span className="hidden lg:inline">Utilisateurs</span>
                    </Link>
                )}
                {user && (
                    <Link
                        href="/profile"
                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Users className="h-4 w-4" />
                        <span className="hidden lg:inline">Profil</span>
                    </Link>
                )}
                {user?.role === 'ADMIN' && (
                    <Link
                        href="/confrontation"
                        className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                    >
                        <Swords className="h-4 w-4" />
                        <span>Nouveau Match</span>
                    </Link>
                )}

                {user ? (
                    <div className="flex items-center gap-4 border-l border-border pl-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold ring-1 ring-border overflow-hidden">
                                {user.image ? (
                                    <img src={user.image} alt="User" className="h-full w-full object-cover" />
                                ) : (
                                    userInitial
                                )}
                            </div>
                            <span className="hidden text-sm font-medium lg:inline">{user.displayName || user.name}</span>
                        </div>
                        <button
                            onClick={() => logoutAction()}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Se déconnecter"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth/signin"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Se connecter
                    </Link>
                )}
            </div>

            {/* Mobile Navigation Toggle - Visible only on Mobile */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-foreground active:scale-95 transition-transform"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-16 left-0 w-full border-b border-border bg-background/95 backdrop-blur-xl p-4 flex flex-col gap-2 shadow-2xl md:hidden animate-in slide-in-from-top-5 z-50">
                    <Link
                        href="/"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-md p-3 text-sm font-medium hover:bg-muted transition-colors"
                    >
                        <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500">
                            <Trophy className="h-5 w-5" />
                        </div>
                        Leaderboard
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <>
                            <Link
                                href="/users"
                                onClick={closeMenu}
                                className="flex items-center gap-3 rounded-md p-3 text-sm font-medium hover:bg-muted transition-colors"
                            >
                                <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                                    <Users className="h-5 w-5" />
                                </div>
                                Utilisateurs
                            </Link>
                            <Link
                                href="/confrontation"
                                onClick={closeMenu}
                                className="flex items-center gap-3 rounded-md p-3 text-sm font-medium hover:bg-muted transition-colors"
                            >
                                <div className="p-2 bg-red-500/10 rounded-full text-red-500">
                                    <Swords className="h-5 w-5" />
                                </div>
                                Nouveau Match
                            </Link>
                        </>
                    )}
                    {user && (
                        <Link
                            href="/profile"
                            onClick={closeMenu}
                            className="flex items-center gap-3 rounded-md p-3 text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                                <Users className="h-5 w-5" />
                            </div>
                            Mon Profil
                        </Link>
                    )}

                    <div className="my-2 border-t border-border" />

                    {user ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 px-3 py-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-base font-bold ring-2 ring-border overflow-hidden">
                                    {user.image ? (
                                        <img src={user.image} alt="User" className="h-full w-full object-cover" />
                                    ) : (
                                        userInitial
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">{user.displayName || user.name}</span>
                                    <span className="text-xs text-muted-foreground">Connecté</span>
                                </div>
                            </div>
                            <button
                                onClick={() => { logoutAction(); closeMenu(); }}
                                className="flex w-full items-center gap-3 rounded-md p-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                Se déconnecter
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/signin"
                            onClick={closeMenu}
                            className="flex w-full items-center justify-center rounded-xl bg-secondary py-3 text-sm font-bold text-secondary-foreground"
                        >
                            Se connecter
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}
