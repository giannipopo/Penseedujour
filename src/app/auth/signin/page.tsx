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

                <form
                    action={async (formData) => {
                        "use server"
                        const email = formData.get("email")
                        await signIn("resend", { email, redirectTo: "/" })
                    }}
                    className="mt-8 space-y-6"
                >
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none">
                            Adresse email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nom@exemple.com"
                            required
                            className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95"
                    >
                        <Mail className="h-4 w-4" />
                        <span>Recevoir un lien magique</span>
                    </button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                    En vous connectant, vous recevrez un email avec un lien de connexion sécurisé.
                </p>
            </div>
        </div>
    )
}
