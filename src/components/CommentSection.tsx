"use client";

import { useState, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        displayName: string;
    };
}

interface CommentSectionProps {
    thoughtId: string;
    isAuthenticated: boolean;
    initialCommentCount: number;
}

export default function CommentSection({ thoughtId, isAuthenticated, initialCommentCount }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [content, setContent] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [count, setCount] = useState(initialCommentCount);

    const toggleOpen = () => {
        if (!isOpen && !hasLoaded) {
            fetchComments();
        }
        setIsOpen(!isOpen);
    };

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/thoughts/${thoughtId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
                setHasLoaded(true);
            }
        } catch (error) {
            console.error("Failed to load comments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isPosting) return;

        setIsPosting(true);
        try {
            const res = await fetch(`/api/thoughts/${thoughtId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            if (res.ok) {
                const newComment = await res.json();
                setComments((prev) => [...prev, newComment]);
                setContent("");
                setCount((prev) => prev + 1);
            } else {
                alert("Erreur lors de l'envoi du commentaire.");
            }
        } catch (error) {
            console.error("Failed to post comment");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="mt-4 border-t border-border/50 pt-2">
            <button
                onClick={toggleOpen}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
                <MessageCircle size={18} />
                <span>{count} commentaire{count > 1 ? "s" : ""}</span>
            </button>

            {isOpen && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Écrire un commentaire..."
                                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                disabled={isPosting}
                            />
                            <button
                                type="submit"
                                disabled={!content.trim() || isPosting}
                                className="rounded-full bg-primary p-2 text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-2 bg-muted/50 rounded-lg">
                            Connectez-vous pour commenter.
                        </p>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {comments.map((comment) => (
                                <div key={comment.id} className="rounded-lg bg-muted/50 p-3 text-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-foreground/90">
                                            {comment.user.displayName}
                                        </span>
                                        <time className="text-xs text-muted-foreground">
                                            {format(new Date(comment.createdAt), "d MMM HH:mm", { locale: fr })}
                                        </time>
                                    </div>
                                    <p className="text-foreground/80 break-words">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Aucun commentaire pour le moment.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
