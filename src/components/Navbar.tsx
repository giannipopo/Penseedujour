import Link from 'next/link';
import { PenSquare, Home, User } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default async function Navbar() {
    const user = await getCurrentUser();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
                    <span className="rounded-lg bg-primary/10 p-1.5">
                        💭
                    </span>
                    <span>Pensée du Jour</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">Feed</span>
                    </Link>
                    <Link
                        href="/post"
                        className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                    >
                        <PenSquare className="h-4 w-4" />
                        <span>Poster</span>
                    </Link>
                    {user ? (
                        <div className="flex items-center gap-4 border-l border-border pl-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                                    {user.displayName[0].toUpperCase()}
                                </div>
                                <span className="hidden text-sm font-medium sm:inline">{user.displayName}</span>
                            </div>
                            <form action={async () => {
                                "use server"
                                const { signOut } = await import("@/auth")
                                await signOut()
                            }}>
                                <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                                    Déconnexion
                                </button>
                            </form>
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
            </div>
        </nav>
    );
}
