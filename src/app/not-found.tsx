import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-4xl font-bold">404</h2>
            <p className="text-muted-foreground">Oups ! Cette page n'existe pas.</p>
            <Link
                href="/"
                className="rounded-full bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
            >
                Retour à l'accueil
            </Link>
        </div>
    );
}
