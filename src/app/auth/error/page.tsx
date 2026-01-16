import Link from "next/link"

export default function AuthErrorPage() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-xl text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive text-2xl">
                    ⚠️
                </div>
                <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Erreur de connexion</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Il y a eu un problème technique lors de la tentative de connexion.
                    Cela arrive souvent si le service d'envoi d'emails n'est pas encore configuré sur Vercel.
                </p>
                <div className="mt-8">
                    <Link
                        href="/auth/signin"
                        className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                    >
                        Réessayer
                    </Link>
                </div>
            </div>
        </div>
    )
}
