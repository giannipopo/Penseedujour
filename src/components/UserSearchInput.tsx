'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface User {
    id: string;
    displayName: string;
    image: string | null;
    elo: number;
}

interface UserSearchInputProps {
    value: string;
    onChange: (userId: string, user: User | null) => void;
    placeholder?: string;
    excludeIds?: string[];
}

export default function UserSearchInput({ value, onChange, placeholder = "Rechercher un joueur...", excludeIds = [] }: UserSearchInputProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (query.trim().length < 1) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data: User[] = await res.json();
                    // Filter out excluded IDs
                    const filtered = data.filter(u => !excludeIds.includes(u.id));
                    setResults(filtered);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [query, excludeIds]);

    const handleSelect = (user: User) => {
        setSelectedUser(user);
        setQuery('');
        setResults([]);
        setIsOpen(false);
        onChange(user.id, user);
    };

    const handleClear = () => {
        setSelectedUser(null);
        setQuery('');
        setResults([]);
        onChange('', null);
    };

    return (
        <div ref={wrapperRef} className="relative">
            {selectedUser ? (
                <div className="flex items-center gap-3 rounded-md border border-primary bg-primary/5 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold overflow-hidden border border-border">
                        {selectedUser.image ? (
                            <img src={selectedUser.image} className="w-full h-full object-cover" alt={selectedUser.displayName} />
                        ) : (
                            selectedUser.displayName.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="font-bold">{selectedUser.displayName}</div>
                        <div className="text-xs text-muted-foreground">ELO: {selectedUser.elo}</div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* Dropdown */}
                    {isOpen && (query.length > 0 || isSearching) && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                            {isSearching ? (
                                <div className="flex justify-center py-4">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            ) : results.length > 0 ? (
                                results.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleSelect(user)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold overflow-hidden">
                                            {user.image ? (
                                                <img src={user.image} className="w-full h-full object-cover" alt={user.displayName} />
                                            ) : (
                                                user.displayName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{user.displayName}</div>
                                            <div className="text-xs text-muted-foreground">ELO: {user.elo}</div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Aucun joueur trouvé
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
