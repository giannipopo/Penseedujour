import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import NavbarContent from './NavbarContent';

export default async function Navbar() {
    const user = await getCurrentUser();

    async function logoutAction() {
        "use server";
        const { signOut } = await import("@/auth");
        await signOut();
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white/90">
                    <span className="rounded-lg bg-yellow-500/20 p-1.5 grayscale-0">
                        🚀
                    </span>
                    <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">Ranko Request</span>
                </Link>

                <NavbarContent user={user as any} logoutAction={logoutAction} />
            </div>
        </nav>
    );
}
