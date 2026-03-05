import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface UserResult {
    id: string;
    full_name: string;
    avatar_url?: string;
    friendship_status?: 'none' | 'pending' | 'accepted';
}

const SocialSearch: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<UserResult[]>([]);

    // Fetch friend suggestions on mount
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!user) return;
            try {
                // Get users that are NOT already friends
                const { data: friendships } = await supabase
                    .from('friendships')
                    .select('requester_id, addressee_id')
                    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

                const friendIds = new Set<string>();
                friendIds.add(user.id);
                (friendships || []).forEach(f => {
                    friendIds.add(f.requester_id);
                    friendIds.add(f.addressee_id);
                });

                const { data: users } = await supabase
                    .from('users')
                    .select('id, full_name, avatar_url')
                    .not('id', 'in', `(${Array.from(friendIds).join(',')})`)
                    .limit(10);

                setSuggestions((users || []).map(u => ({ ...u, friendship_status: 'none' as const })));
            } catch (err) {
                console.error('Suggestions error:', err);
            }
        };
        fetchSuggestions();
    }, [user]);

    // Search
    useEffect(() => {
        const debounce = setTimeout(async () => {
            if (!query.trim()) { setResults([]); return; }
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('users')
                    .select('id, full_name, avatar_url')
                    .ilike('full_name', `%${query}%`)
                    .neq('id', user?.id || '')
                    .limit(20);

                setResults((data || []).map(u => ({ ...u, friendship_status: 'none' as const })));
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [query, user]);

    const handleAddFriend = async (targetId: string) => {
        if (!user) return;
        try {
            await supabase.from('friendships').insert({
                requester_id: user.id,
                addressee_id: targetId,
                status: 'pending',
            });

            const update = (list: UserResult[]) =>
                list.map(u => u.id === targetId ? { ...u, friendship_status: 'pending' as const } : u);

            setResults(update);
            setSuggestions(update);
        } catch (err) {
            console.error('Add friend error:', err);
        }
    };

    const displayList = query.trim() ? results : suggestions;

    return (
        <div className="bg-white min-h-full">
            {/* Search Bar — Instagram style */}
            <div className="bg-white border-b border-gray-100 px-3 py-2">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar"
                        className="w-full bg-gray-100 rounded-lg pl-9 pr-8 py-[7px] text-[13px] outline-none"
                        autoFocus
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Section title */}
            {!query.trim() && suggestions.length > 0 && (
                <div className="px-4 pt-3 pb-1.5">
                    <h3 className="font-semibold text-[14px] text-gray-900">Sugestões para você</h3>
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin size-6 border-2 border-orange-500 border-t-transparent rounded-full" />
                </div>
            ) : displayList.length === 0 ? (
                <div className="text-center py-12 px-6">
                    <div className="size-14 rounded-full border-2 border-gray-900 flex items-center justify-center mx-auto mb-2.5">
                        <span className="material-symbols-outlined text-gray-900 text-2xl">person_search</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-[14px] mb-0.5">
                        {query.trim() ? 'Nenhum resultado' : 'Buscar'}
                    </p>
                    <p className="text-[13px] text-gray-400">
                        {query.trim() ? `Nenhum resultado para "${query}"` : 'Busque pessoas para seguir'}
                    </p>
                </div>
            ) : (
                <div>
                    {displayList.map(u => (
                        <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 active:bg-gray-50 transition-colors">
                            <img
                                src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=f97316&color=fff&size=44`}
                                alt=""
                                className="size-11 rounded-full object-cover cursor-pointer"
                                onClick={() => navigate(`/caomunicacao/perfil/${u.id}`)}
                            />
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/caomunicacao/perfil/${u.id}`)}>
                                <p className="font-semibold text-[13px] text-gray-900 truncate">{u.full_name}</p>
                                <p className="text-[11px] text-gray-400">PetGoH</p>
                            </div>
                            {u.friendship_status === 'none' ? (
                                <button
                                    onClick={() => handleAddFriend(u.id)}
                                    className="bg-orange-500 text-white text-[12px] font-semibold px-4 py-[5px] rounded-lg"
                                >
                                    Seguir
                                </button>
                            ) : u.friendship_status === 'pending' ? (
                                <span className="text-[12px] text-gray-400 font-medium">Pendente</span>
                            ) : (
                                <span className="text-[12px] text-gray-400 font-medium flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span> Amigos
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SocialSearch;
