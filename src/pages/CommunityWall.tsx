import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// ==================== HOOK: FAVORITAR POST ====================
const usePostFavorite = (sourceId: string, sourceType: string) => {
    const { user } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !sourceId) return;
        const checkFavorite = async () => {
            const { data } = await supabase
                .from('post_favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('source_id', sourceId)
                .eq('source_type', sourceType)
                .maybeSingle();
            setIsFavorited(!!data);
        };
        checkFavorite();
    }, [user, sourceId, sourceType]);

    const toggle = useCallback(async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setLoading(true);
        try {
            if (isFavorited) {
                await supabase
                    .from('post_favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('source_id', sourceId)
                    .eq('source_type', sourceType);
                setIsFavorited(false);
            } else {
                await supabase.from('post_favorites').insert({
                    user_id: user.id,
                    source_id: sourceId,
                    source_type: sourceType,
                });
                setIsFavorited(true);
            }
        } catch (err) {
            console.error('Erro ao favoritar:', err);
        } finally {
            setLoading(false);
        }
    }, [user, isFavorited, sourceId, sourceType, navigate]);

    return { isFavorited, toggle, loading };
};

// ==================== FAVORITE BUTTON ====================
const FavoriteButton: React.FC<{ sourceId: string; sourceType: string }> = ({ sourceId, sourceType }) => {
    const { isFavorited, toggle, loading } = usePostFavorite(sourceId, sourceType);
    const [animating, setAnimating] = useState(false);

    const handleToggle = () => {
        if (!isFavorited) {
            setAnimating(true);
            setTimeout(() => setAnimating(false), 300);
        }
        toggle();
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`transition-transform hover:scale-110 disabled:opacity-50 ${isFavorited ? 'text-red-500' : 'text-secondary dark:text-slate-300'} ${animating ? 'animate-heart-pulse text-red-500' : ''}`}
        >
            <span className={`material-symbols-outlined text-[28px] ${isFavorited || animating ? 'fill-current' : ''}`}>
                favorite
            </span>
        </button>
    );
};

// ==================== SHARE BUTTON ====================
const ShareButton: React.FC<{ postType: 'adocao' | 'perdido'; postId: string }> = ({ postType, postId }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = `${window.location.origin}/mural/${postType}/${postId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="hover:scale-110 transition-transform text-secondary dark:text-slate-300 relative"
            title="Copiar link"
        >
            <span className="material-symbols-outlined text-[28px]">
                {copied ? 'check' : 'share'}
            </span>
            {copied && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap animate-fade-in-up">
                    Link copiado!
                </span>
            )}
        </button>
    );
};

// ==================== COMMENT SECTION ====================
interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    author?: { full_name: string; avatar_url: string | null };
}

const CommentSection: React.FC<{ postId: string; sourceType: string }> = ({ postId, sourceType }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCount = async () => {
            const { count } = await supabase
                .from('post_comments')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', postId)
                .eq('source_type', sourceType);
            setCommentCount(count || 0);
        };
        fetchCount();
    }, [postId, sourceType]);

    const fetchComments = async () => {
        const { data } = await supabase
            .from('post_comments')
            .select('*, author:users!post_comments_user_id_fkey(full_name, avatar_url)')
            .eq('post_id', postId)
            .eq('source_type', sourceType)
            .order('created_at', { ascending: true });
        setComments(data || []);
    };

    const toggleOpen = () => {
        if (!isOpen) {
            fetchComments();
        }
        setIsOpen(!isOpen);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('post_comments').insert({
                post_id: postId,
                user_id: user.id,
                content: newComment.trim(),
                source_type: sourceType,
            });
            if (error) throw error;
            setNewComment('');
            setCommentCount(prev => prev + 1);
            fetchComments();
        } catch (err) {
            console.error('Erro ao comentar:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={toggleOpen}
                className="hover:scale-110 transition-transform text-secondary dark:text-slate-300 relative"
                title="Comentários"
            >
                <span className="material-symbols-outlined text-[28px]">chat_bubble</span>
                {commentCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {commentCount > 9 ? '9+' : commentCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="mt-3 border-t border-slate-100 pt-3 animate-fade-in-up">
                    {/* Comments list */}
                    <div className="max-h-48 overflow-y-auto space-y-3 mb-3">
                        {comments.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-2">Nenhum comentário ainda. Seja o primeiro!</p>
                        )}
                        {comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-2">
                                <div className="size-7 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {comment.author?.avatar_url ? (
                                        <img src={comment.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-semibold mr-1.5">{comment.author?.full_name || 'Usuário'}</span>
                                        {comment.content}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {new Date(comment.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Comment input */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Adicione um comentário..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                        />
                        <button
                            type="submit"
                            disabled={loading || !newComment.trim()}
                            className="text-blue-500 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:text-blue-600 transition-colors px-1"
                        >
                            {loading ? '...' : 'Publicar'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const CommunityWall: React.FC<{ onActionClick?: (type: 'adoption' | 'lost') => void }> = ({ onActionClick }) => {
    const [activeTab, setActiveTab] = useState<'adoption' | 'lost'>('adoption');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleActionClick = () => {
        if (onActionClick) {
            onActionClick(activeTab);
        } else if (activeTab === 'adoption') {
            navigate('/mural/postar-adocao');
        } else {
            navigate('/mural/reportar-perdido');
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-[50px] md:pb-0">
            {/* Thin Instagram-like Tabs for Mural */}
            <div className="bg-white border-b border-gray-100 flex sticky top-[68px] z-30">
                {(['adoption', 'lost'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-center text-[13px] font-semibold transition-colors relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                        {tab === 'adoption' ? 'Adoção' : 'Perdidos'}
                        {activeTab === tab && <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gray-900" />}
                    </button>
                ))}
            </div>

            <main className="max-w-[600px] mx-auto w-full pt-4 px-0 sm:px-4">
                {/* Action button */}
                <div className="px-4 mb-4">
                    <button 
                        onClick={handleActionClick} 
                        className={`w-full font-semibold py-2.5 px-4 rounded-xl shadow-sm text-[14px] flex items-center justify-center gap-2 transition-all ${
                            activeTab === 'adoption' 
                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100' 
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {activeTab === 'adoption' ? 'add_circle' : 'campaign'}
                        </span>
                        {activeTab === 'adoption' ? 'Cadastrar para Adoção' : 'Reportar Desaparecimento'}
                    </button>
                </div>

                {/* Content */}
                <div className="animate-fade-in-up">
                    {activeTab === 'adoption' ? <AdoptionView /> : <LostPetsView />}
                </div>
            </main>
        </div>
    );
};

// ==================== ADOPTION VIEW ====================
const AdoptionView: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    useEffect(() => {
        fetchAdoptionPets();
    }, []);

    const fetchAdoptionPets = async () => {
        try {
            const { data, error } = await supabase
                .from('adoption_pets')
                .select('*')
                .eq('status', 'available')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setPets(data || []);
        } catch (error) {
            console.error('Error fetching adoption pets:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Carregando pets...</p>
            </div>
        );
    }

    if (pets.length === 0) {
        return (
            <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">pets</span>
                <p className="text-slate-500 text-sm">Nenhum pet para adoção no momento.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[600px] mx-auto space-y-8">
            {pets.map((pet) => (
                <article key={pet.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    {/* User Header */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">volunteer_activism</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold hover:underline cursor-pointer">{pet.organization_name || 'Abrigo PetGoH'}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {pet.location || 'Local não informado'}
                                </p>
                            </div>
                        </div>
                                        <div className="relative">
                            <button className="text-slate-400 hover:text-slate-600" onClick={() => setMenuOpenId(menuOpenId === pet.id ? null : pet.id)}>
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                            {menuOpenId === pet.id && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
                                    <div className="absolute right-0 top-6 z-50 bg-white border border-slate-100 rounded-xl shadow-lg py-1 min-w-[140px] animate-fade-in-up">
                                        {user?.id === pet.owner_id ? (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm('Excluir este post de adoção?')) return;
                                                    await supabase.from('adoption_pets').delete().eq('id', pet.id);
                                                    setPets(prev => prev.filter(p => p.id !== pet.id));
                                                    setMenuOpenId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                Excluir
                                            </button>
                                        ) : (
                                            <button onClick={() => setMenuOpenId(null)} className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50">
                                                <span className="material-symbols-outlined text-[18px]">flag</span>
                                                Denunciar
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="relative aspect-square w-full bg-slate-100 group">
                        <img alt={pet.name} className="w-full h-full object-cover" src={pet.main_image || pet.img} />
                        <div className="absolute top-4 left-4">
                            <span className="bg-secondary text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">favorite</span>
                                ADOÇÃO
                            </span>
                        </div>
                    </div>

                    {/* Interaction Bar */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <FavoriteButton sourceId={pet.id} sourceType="adoption_pet" />
                                <CommentSection postId={pet.id} sourceType="adoption_pet" />
                                <ShareButton postType="adocao" postId={pet.id} />
                            </div>
                        </div>
                        
                        {/* Caption */}
                        <div className="space-y-1">
                            <p className="text-sm">
                                <span className="font-bold mr-2">{pet.name}</span>
                                {pet.story || `Este lindo pet está à procura de um lar. Ele(a) é ${pet.gender}, ${pet.breed} e tem ${pet.age}.`}
                            </p>
                            <div className="mt-4">
                                <button onClick={() => navigate(`/mural/adocao/${pet.id}`)} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    Quero Adotar
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase mt-4">
                                {new Date(pet.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

// ==================== LOST PETS VIEW ====================
const LostPetsView: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lostPets, setLostPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    useEffect(() => {
        fetchLostPets();
    }, []);

    const fetchLostPets = async () => {
        try {
            const { data, error } = await supabase
                .from('lost_pets')
                .select('*')
                .eq('status', 'lost')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setLostPets(data || []);
        } catch (error) {
            console.error('Error fetching lost pets:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-3 border-red-200 border-t-red-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Carregando alertas...</p>
            </div>
        );
    }

    if (lostPets.length === 0) {
        return (
            <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">search</span>
                <p className="text-slate-500 text-sm">Nenhum alerta de pet perdido no momento.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[600px] mx-auto space-y-8">
            {lostPets.map((pet) => (
                <article key={pet.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    {/* User Header */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-primary/20 p-0.5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">person</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold hover:underline cursor-pointer">{pet.owner_name || 'Tutor do Pet'}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {pet.last_seen_location || 'Local desconhecido'}
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <button className="text-slate-400 hover:text-slate-600" onClick={() => setMenuOpenId(menuOpenId === pet.id ? null : pet.id)}>
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                            {menuOpenId === pet.id && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
                                    <div className="absolute right-0 top-6 z-50 bg-white border border-slate-100 rounded-xl shadow-lg py-1 min-w-[140px] animate-fade-in-up">
                                        {user?.id === pet.user_id ? (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm('Excluir este alerta de pet perdido?')) return;
                                                    await supabase.from('lost_pets').delete().eq('id', pet.id);
                                                    setLostPets(prev => prev.filter(p => p.id !== pet.id));
                                                    setMenuOpenId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                Excluir
                                            </button>
                                        ) : (
                                            <button onClick={() => setMenuOpenId(null)} className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50">
                                                <span className="material-symbols-outlined text-[18px]">flag</span>
                                                Denunciar
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="relative aspect-square w-full bg-slate-100 group">
                        <img alt={pet.name} className="w-full h-full object-cover" src={pet.image_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} />
                        <div className="absolute top-4 left-4">
                            <span className="bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">warning</span>
                                PERDIDO
                            </span>
                        </div>
                    </div>

                    {/* Interaction Bar */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <FavoriteButton sourceId={pet.id} sourceType="lost_pet" />
                                <CommentSection postId={pet.id} sourceType="lost_pet" />
                                <ShareButton postType="perdido" postId={pet.id} />
                            </div>
                        </div>
                        
                        {/* Caption */}
                        <div className="space-y-1">
                            <p className="text-sm">
                                <span className="font-bold mr-2">{pet.pet_name || pet.name}</span>
                                {pet.description}
                            </p>
                            <div className="mt-4">
                                <button onClick={() => navigate(`/mural/perdido/${pet.id}/informar`)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    Tem informações?
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase mt-4">
                                Desaparecido em: {pet.last_seen_date ? new Date(pet.last_seen_date).toLocaleDateString() : 'Não informado'}
                            </p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default CommunityWall;
