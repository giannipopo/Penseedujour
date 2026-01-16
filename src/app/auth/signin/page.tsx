import { signIn } from "@/auth"
import { Mail } from "lucide-react"

export default function SignInPage() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-xl">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        💭
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Bienvenue</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Connectez-vous pour partager votre pensée du jour.
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    {/* Bouton Google */}
                    <form
                        action={async () => {
                            "use server"
                            await signIn("google", { redirectTo: "/" })
                        }}
                    >
                        <button
                            type="submit"
                            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold transition-all hover:bg-accent active:scale-95"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span>Continuer avec Google</span>
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground text-[10px]">Ou par lien magique</span>
                        </div>
                    </div>

                    {/* Formulaire Email */}
                    <form
                        action={async (formData) => {
                            "use server"
                            const email = formData.get("email")
                            await signIn("resend", { email, redirectTo: "/" })
                        }}
                        className="space-y-4"
                    >
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nom@exemple.com"
                            required
                            className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        />
                        <button
                            type="submit"
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                        >
                            <Mail className="h-4 w-4" />
                            <span>Recevoir l'email</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
