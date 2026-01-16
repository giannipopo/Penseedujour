"use client";

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Quote, Heart } from 'lucide-react';
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
}: ThoughtCardProps) {
    const router = useRouter();
    const date = new Date(createdAt);
    const safeDisplayName = displayName || "Utilisateur";
    const initialChar = safeDisplayName.charAt(0).toUpperCase();

    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async () => {
        if (!isAuthenticated) {
            router.push('/auth/signin');
            return;
        }

        if (isLiking) return;

        setIsLiking(true);
        // Optimistic UI
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            const res = await fetch(`/api/thoughts/${id}/like`, {
                method: 'POST',
            });

            if (!res.ok) {
                // Rollback if failed
                setIsLiked(!newIsLiked);
                setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
            }
        } catch (error) {
            // Rollback if failed
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="animate-fade-in group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
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
                    </div>
                    <time className="text-[10px] text-muted-foreground">
                        {format(date, 'd MMMM HH:mm', { locale: fr })}
                    </time>
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
