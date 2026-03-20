import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ProfileData {
    id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    posts_count: number;
    friends_count: number;
}

interface ProfilePost {
    id: string;
    images: string[];
    created_at: string;
    likes_count: number;
    comments_count: number;
}

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'self';

const SocialProfile: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { user } = useAuth();

    const isOwnProfile = !userId || userId === user?.id;
    const profileId = isOwnProfile ? user?.id : userId;

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [posts, setPosts] = useState<ProfilePost[]>([]);
    const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'liked'>('posts');
    const [friendStatus, setFriendStatus] = useState<FriendStatus>(isOwnProfile ? 'self' : 'none');
    const [loading, setLoading] = useState(true);
    const [friendshipId, setFriendshipId] = useState<string | null>(null);
    const [postMenu, setPostMenu] = useState<{ postId: string; x: number; y: number } | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!profileId) return;
        setLoading(true);
        try {
            // Get user data
            const { data: userData } = await supabase
                .from('users')
                .select('id, full_name, avatar_url, bio')
                .eq('id', profileId)
                .single();

            // Count posts
            const { count: postsCount } = await supabase
                .from('wall_posts')
                .select('id', { count: 'exact', head: true })
                .eq('tutor_id', profileId)
                .eq('status', 'active');

            // Count friends
            const { count: friendsCount } = await supabase
                .from('friendships')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'accepted')
                .or(`requester_id.eq.${profileId},addressee_id.eq.${profileId}`);

            setProfile({
                id: userData?.id || profileId,
                full_name: userData?.full_name || 'Usuário',
                avatar_url: userData?.avatar_url,
                bio: userData?.bio,
                posts_count: postsCount || 0,
                friends_count: friendsCount || 0,
            });

            // Check friendship status
            if (user && !isOwnProfile) {
                const { data: friendship } = await supabase
                    .from('friendships')
                    .select('*')
                    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${profileId}),and(requester_id.eq.${profileId},addressee_id.eq.${user.id})`)
                    .maybeSingle();

                if (friendship) {
                    setFriendshipId(friendship.id);
                    if (friendship.status === 'accepted') {
                        setFriendStatus('accepted');
                    } else if (friendship.requester_id === user.id) {
                        setFriendStatus('pending_sent');
                    } else {
                        setFriendStatus('pending_received');
                    }
                } else {
                    setFriendStatus('none');
                }
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [profileId, user, isOwnProfile]);

    const fetchPosts = useCallback(async () => {
        if (!profileId) return;
        try {
            let query;

            if (activeTab === 'saved' && user) {
                const { data: saves } = await supabase
                    .from('post_saves')
                    .select('post_id')
                    .eq('user_id', user.id);
                const postIds = (saves || []).map(s => s.post_id);
                if (postIds.length === 0) { setPosts([]); return; }

                const { data } = await supabase
                    .from('wall_posts')
                    .select('id, images, created_at, likes_count, comments_count')
                    .in('id', postIds)
                    .order('created_at', { ascending: false });
                setPosts((data || []).map(p => ({ ...p, images: p.images || [] })));

            } else if (activeTab === 'liked' && user) {
                const { data: likes } = await supabase
                    .from('post_likes')
                    .select('post_id')
                    .eq('user_id', user.id);
                const postIds = (likes || []).map(l => l.post_id);
                if (postIds.length === 0) { setPosts([]); return; }

                const { data } = await supabase
                    .from('wall_posts')
                    .select('id, images, created_at, likes_count, comments_count')
                    .in('id', postIds)
                    .order('created_at', { ascending: false });
                setPosts((data || []).map(p => ({ ...p, images: p.images || [] })));

            } else {
                const { data } = await supabase
                    .from('wall_posts')
                    .select('id, images, created_at, likes_count, comments_count')
                    .eq('tutor_id', profileId)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });
                setPosts((data || []).map(p => ({ ...p, images: p.images || [] })));
            }
        } catch (err) {
            console.error('Posts fetch error:', err);
        }
    }, [profileId, activeTab, user]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);
    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleFriendAction = async () => {
        if (!user || !profileId) return;
        try {
            if (friendStatus === 'none') {
                const { data } = await supabase.from('friendships').insert({
                    requester_id: user.id,
                    addressee_id: profileId,
                    status: 'pending',
                }).select().single();
                setFriendshipId(data?.id || null);
                setFriendStatus('pending_sent');
            } else if (friendStatus === 'pending_received' && friendshipId) {
                await supabase.from('friendships').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', friendshipId);
                setFriendStatus('accepted');
            } else if (friendStatus === 'pending_sent' && friendshipId) {
                await supabase.from('friendships').delete().eq('id', friendshipId);
                setFriendStatus('none');
                setFriendshipId(null);
            } else if (friendStatus === 'accepted' && friendshipId) {
                await supabase.from('friendships').delete().eq('id', friendshipId);
                setFriendStatus('none');
                setFriendshipId(null);
            }
        } catch (err) {
            console.error('Friend action error:', err);
        }
    };

    // UI-11: Archive and Delete post actions
    const handleArchivePost = async (postId: string) => {
        setPostMenu(null);
        const { error } = await supabase
            .from('wall_posts')
            .update({ status: 'archived' })
            .eq('id', postId)
            .eq('tutor_id', user!.id);
        if (error) { alert('Erro ao arquivar: ' + error.message); return; }
        setPosts(prev => prev.filter(p => p.id !== postId));
        setProfile(prev => prev ? { ...prev, posts_count: Math.max(0, prev.posts_count - 1) } : prev);
    };

    const handleDeletePost = async (postId: string) => {
        setPostMenu(null);
        if (!window.confirm('Tem certeza que deseja deletar esta publicação? Essa ação não pode ser desfeita.')) return;
        const { error } = await supabase
            .from('wall_posts')
            .delete()
            .eq('id', postId)
            .eq('tutor_id', user!.id);
        if (error) { alert('Erro ao deletar: ' + error.message); return; }
        setPosts(prev => prev.filter(p => p.id !== postId));
        setProfile(prev => prev ? { ...prev, posts_count: Math.max(0, prev.posts_count - 1) } : prev);
    };

    const handleMessage = async () => {
        if (!user || !profileId) return;
        try {
            // Check for existing conversation
            const { data: existing } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(participant_1.eq.${user.id},participant_2.eq.${profileId}),and(participant_1.eq.${profileId},participant_2.eq.${user.id})`)
                .maybeSingle();

            if (existing) {
                navigate(`/caomunicacao/mensagens/${existing.id}`);
            } else {
                const { data: conv } = await supabase.from('conversations').insert({
                    participant_1: user.id,
                    participant_2: profileId,
                    status: 'pending',
                }).select().single();
                if (conv) navigate(`/caomunicacao/mensagens/${conv.id}`);
            }
        } catch (err) {
            console.error('Message error:', err);
        }
    };

    const defaultAvatar = profile
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=f97316&color=fff&size=128`
        : '';

    const friendButtonConfig: Record<FriendStatus, { label: string; icon: string; className: string }> = {
        none: { label: 'Adicionar', icon: 'person_add', className: 'bg-orange-500 text-white' },
        pending_sent: { label: 'Pendente', icon: 'hourglass_top', className: 'bg-gray-200 text-gray-700' },
        pending_received: { label: 'Aceitar', icon: 'check', className: 'bg-green-500 text-white' },
        accepted: { label: 'Amigos', icon: 'people', className: 'bg-gray-200 text-gray-700' },
        self: { label: 'Editar Perfil', icon: 'edit', className: 'bg-gray-200 text-gray-700' },
    };

    const btnConfig = friendButtonConfig[friendStatus];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="animate-spin size-7 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-full">
            {/* Profile Header — Instagram mobile proportions */}
            <div className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-5 mb-3">
                    {/* Avatar — Instagram uses ~77px */}
                    <div className="size-[77px] rounded-full bg-gradient-to-tr from-orange-400 via-red-400 to-amber-500 p-[3px] shrink-0">
                        <img
                            src={profile?.avatar_url || defaultAvatar}
                            alt=""
                            className="size-full rounded-full object-cover border-[3px] border-white"
                        />
                    </div>

                    {/* Stats row */}
                    <div className="flex-1 flex justify-around text-center">
                        <div>
                            <div className="font-bold text-[16px] text-gray-900">{profile?.posts_count || 0}</div>
                            <div className="text-[11px] text-gray-500">publicações</div>
                        </div>
                        <div>
                            <div className="font-bold text-[16px] text-gray-900">{profile?.friends_count || 0}</div>
                            <div className="text-[11px] text-gray-500">amigos</div>
                        </div>
                    </div>
                </div>

                {/* Name & Bio */}
                <h2 className="font-semibold text-[13px] text-gray-900 leading-tight">{profile?.full_name}</h2>
                {profile?.bio && <p className="text-[13px] text-gray-600 mt-px leading-snug">{profile.bio}</p>}

                {/* Action buttons — Instagram compact style */}
                <div className="flex gap-1.5 mt-3">
                    <button
                        onClick={isOwnProfile ? undefined : handleFriendAction}
                        className={`flex-1 py-[6px] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1 ${btnConfig.className}`}
                    >
                        <span className="material-symbols-outlined text-[15px]">{btnConfig.icon}</span>
                        {btnConfig.label}
                    </button>
                    {!isOwnProfile && (
                        <button
                            onClick={handleMessage}
                            className="flex-1 bg-gray-100 text-gray-900 py-[6px] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[15px]">chat_bubble_outline</span>
                            Mensagem
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs — Instagram uses top border indicator */}
            <div className="flex border-t border-gray-100">
                {[
                    { key: 'posts' as const, icon: 'grid_on' },
                    ...(isOwnProfile ? [
                        { key: 'saved' as const, icon: 'bookmark_border' },
                        { key: 'liked' as const, icon: 'favorite_border' },
                    ] : []),
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2.5 flex items-center justify-center relative ${activeTab === tab.key ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                        <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
                        {activeTab === tab.key && <div className="absolute top-0 left-0 right-0 h-[1px] bg-gray-900" />}
                    </button>
                ))}
            </div>

            {/* Posts Grid */}
            {/* Close context menu on outside click */}
            {postMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setPostMenu(null)} />
            )}
            <div className="grid grid-cols-3 gap-px">
                {posts.map(post => (
                    <div
                        key={post.id}
                        className="aspect-square bg-gray-100 cursor-pointer relative group"
                    >
                        <div onClick={() => navigate(`/caomunicacao/post/${post.id}`)} className="w-full h-full">
                            {post.images[0] ? (
                                <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-300 text-3xl">image</span>
                                </div>
                            )}

                            {/* Hover overlay — stats */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <div className="flex items-center gap-1 text-white font-bold text-sm">
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                    {post.likes_count}
                                </div>
                                <div className="flex items-center gap-1 text-white font-bold text-sm">
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                                    {post.comments_count}
                                </div>
                            </div>

                            {/* Multi-image icon */}
                            {post.images.length > 1 && (
                                <span className="absolute top-2 right-2 material-symbols-outlined text-white text-base drop-shadow-lg">collections</span>
                            )}
                        </div>

                        {/* UI-11: 3-dot menu button — own profile only */}
                        {isOwnProfile && activeTab === 'posts' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setPostMenu({ postId: post.id, x: rect.left, y: rect.bottom });
                                }}
                                className="absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="material-symbols-outlined text-white text-[14px]">more_horiz</span>
                            </button>
                        )}

                        {/* Context Menu */}
                        {postMenu?.postId === post.id && (
                            <div
                                className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-48 animate-in fade-in zoom-in-95 duration-150"
                                style={{ top: postMenu.y + 4, left: Math.max(8, postMenu.x - 100) }}
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => handleArchivePost(post.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-gray-500">archive</span>
                                    Arquivar publicação
                                </button>
                                <div className="border-t border-gray-100" />
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Excluir publicação
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-12 px-6">
                    <div className="size-16 rounded-full border-2 border-gray-900 flex items-center justify-center mx-auto mb-3">
                        <span className="material-symbols-outlined text-gray-900 text-3xl">camera_alt</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-[14px] mb-1">
                        {activeTab === 'posts' ? 'Nenhuma publicação' : activeTab === 'saved' ? 'Nenhum post salvo' : 'Nenhum post curtido'}
                    </p>
                    <p className="text-[13px] text-gray-400">
                        {activeTab === 'posts' && isOwnProfile ? 'Compartilhe seus melhores momentos!' : ''}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SocialProfile;
