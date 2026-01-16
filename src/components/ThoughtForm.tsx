'use client';

// ... imports
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, AlertCircle, CheckCircle2, Palette, Bug, Lightbulb } from 'lucide-react';

const CATEGORIES = [
    { id: 'DESIGN', label: 'Design', icon: Palette, color: 'text-pink-500 bg-pink-500/10 border-pink-200' },
    { id: 'BUGS', label: 'Bugs', icon: Bug, color: 'text-red-500 bg-red-500/10 border-red-200' },
    { id: 'USABILITY', label: 'Facilité d\'utilisation', icon: Lightbulb, color: 'text-yellow-600 bg-yellow-500/10 border-yellow-200' },
];

export default function ThoughtForm() {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('DESIGN');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const maxLength = 280;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/thoughts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, category }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Une erreur est survenue.');
            }

            setSuccess(true);
            setContent('');
            router.refresh();

            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-12 text-center dark:border-green-900/30 dark:bg-green-900/10">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-400">Feedback envoyé !</h3>
                    <p className="text-green-700 dark:text-green-500">Merci de contribuer à Ranko Request.</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${category === cat.id
                                ? `border-primary bg-primary text-primary-foreground shadow-md`
                                : 'border-border bg-background hover:bg-muted'
                            }`}
                    >
                        <cat.icon size={16} />
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Partagez votre avis, bug ou idée..."
                    className="min-h-[160px] w-full resize-none rounded-2xl border border-border bg-card p-4 text-lg outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    maxLength={maxLength}
                    disabled={isSubmitting}
                />
                <div className={`absolute bottom-4 right-4 text-xs font-medium ${content.length > (maxLength - 20) ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                    {content.length} / {maxLength}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
                {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                    <>
                        <Send className="h-5 w-5" />
                        <span>Envoyer le feedback</span>
                    </>
                )}
            </button>
        </form>
    );
}
