"use client";

// ... imports
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Quote, Heart, ShieldAlert, Trash2, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import CommentSection from './CommentSection';

interface ThoughtCardProps {
    id: string;
    displayName: string | null;
    content: string;
    createdAt: string | Date;
    initialLikeCount: number;
    initialIsLiked: boolean;
    isAuthenticated: boolean;
    initialCommentCount: number;
    userRole?: string; // "ADMIN" | "USER"
    isHidden?: boolean;
    category?: string;
}

export default function ThoughtCard({
    id,
    displayName,
    content,
    createdAt,
    initialLikeCount,
    initialIsLiked,
    isAuthenticated,
    initialCommentCount,
    userRole = "USER",
    isHidden = false,
    category = "GENERAL",
}: ThoughtCardProps) {
    const router = useRouter();
    const date = new Date(createdAt);
    const safeDisplayName = displayName || "Utilisateur";
    const initialChar = safeDisplayName.charAt(0).toUpperCase();

    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiking, setIsLiking] = useState(false);
    const [hidden, setHidden] = useState(isHidden);

    const handleLike = async () => {
        if (!isAuthenticated) {
            router.push('/auth/signin');
            return;
        }

        if (isLiking) return;

        setIsLiking(true);
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            const res = await fetch(`/api/thoughts/${id}/like`, { method: 'POST' });
            if (!res.ok) {
                setIsLiked(!newIsLiked);
                setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
            }
        } catch (error) {
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
        } finally {
            setIsLiking(false);
        }
    };

    const handleModerate = async (action: 'hide' | 'delete') => {
        if (!confirm(`Etes-vous sûr de vouloir ${action === 'hide' ? 'masquer' : 'supprimer'} ce feedback ?`)) return;

        try {
            const res = await fetch(`/api/thoughts/${id}/moderate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            if (res.ok) {
                if (action === 'delete') {
                    router.refresh();
                } else {
                    setHidden(!hidden);
                }
            } else {
                alert("Erreur lors de la modération.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (hidden && userRole !== 'ADMIN') return null;

    const isConfrontation = category === 'CONFRONTATION';
    const cardStyle = isConfrontation
        ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-red-500/5 hover:border-orange-500 hover:shadow-orange-500/20'
        : hidden
            ? 'border-red-200 bg-red-50 opacity-75'
            : 'border-border bg-card';

    return (
        <div className={`animate-fade-in group relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${cardStyle}`}>
            <div className="absolute -right-4 -top-4 text-primary/5 transition-transform group-hover:scale-110 pointer-events-none">
                <Quote size={80} />
            </div>

            <div className="relative flex flex-col gap-4">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {initialChar}
                        </div>
                        <span className="font-semibold text-foreground">{safeDisplayName}</span>
                        {isConfrontation && <span className="text-lg" title="Match Trash Talk">🥊</span>}
                        {hidden && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-2">MASQUÉ</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        <time className="text-[10px] text-muted-foreground hidden sm:block">
                            {format(date, 'd MMMM HH:mm', { locale: fr })}
                        </time>

                        {userRole === 'ADMIN' && (
                            <div className="flex items-center gap-1 ml-2">
                                <button onClick={() => handleModerate('hide')} className="p-1 text-muted-foreground hover:text-orange-500 transition-colors" title={hidden ? "Afficher" : "Masquer"}>
                                    <EyeOff size={16} />
                                </button>
                                <button onClick={() => handleModerate('delete')} className="p-1 text-muted-foreground hover:text-red-500 transition-colors" title="Supprimer">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap italic">
                    "{content}"
                </p>

                <footer className="mt-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`group/heart flex items-center gap-1.5 transition-all active:scale-90 ${isLiked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-400'
                                }`}
                        >
                            <div className={`rounded-full p-2 transition-colors ${isLiked ? 'bg-rose-500/10' : 'group-hover/heart:bg-rose-500/10'
                                }`}>
                                <Heart
                                    size={18}
                                    className={isLiked ? 'fill-current' : ''}
                                />
                            </div>
                            <span className="text-sm font-medium">{likeCount}</span>
                        </button>
                    </div>

                    <CommentSection
                        thoughtId={id}
                        isAuthenticated={isAuthenticated}
                        initialCommentCount={initialCommentCount}
                    />
                </footer>
            </div>
        </div>
    );
}
