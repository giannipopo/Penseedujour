import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Quote } from 'lucide-react';

interface ThoughtCardProps {
    displayName: string;
    content: string;
    createdAt: string | Date;
}

export default function ThoughtCard({ displayName, content, createdAt }: ThoughtCardProps) {
    const date = new Date(createdAt);

    return (
        <div className="animate-fade-in group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="absolute -right-4 -top-4 text-primary/5 transition-transform group-hover:scale-110">
                <Quote size={80} />
            </div>

            <div className="relative flex flex-col gap-4">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {displayName[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground">{displayName}</span>
                    </div>
                    <time className="text-xs text-muted-foreground">
                        {format(date, 'd MMMM yyyy HH:mm', { locale: fr })}
                    </time>
                </header>

                <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap italic">
                    "{content}"
                </p>
            </div>
        </div>
    );
}
