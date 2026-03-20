import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/social/PostCard';
import CommunityWall from '../CommunityWall';

interface Story {
    id: string;
    user_id: string;
    image_url: string;
    user_name: string;
    user_avatar?: string;
    viewed: boolean;
}

interface PostData {
    id: string;
    tutor_id: string;
    description: string;
    images: string[];
    created_at: string;
    author_name: string;
    author_avatar?: string;
    likes_count: number;
    comments_count: number;
    user_has_liked: boolean;
    user_has_saved: boolean;
}

const SocialFeed: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'todos' | 'amigos' | 'mural'>('todos');
    const [posts, setPosts] = useState<PostData[]>();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingStory, setViewingStory] = useState<Story | null>(null);
    const [storyProgress, setStoryProgress] = useState(0);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            let friendIds: string[] = [];
            if (activeTab === 'amigos' && user) {
                const { data: friendships } = await supabase
                    .from('friendships')
                    .select('requester_id, addressee_id')
                    .eq('status', 'accepted')
                    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
                friendIds = (friendships || []).map(f =>
                    f.requester_id === user.id ? f.addressee_id : f.requester_id
                );
                if (friendIds.length === 0) {
                    setPosts([]);
                    setLoading(false);
                    return;
                }
            }

            let query = supabase
                .from('wall_posts')
                .select(`*, author:users!wall_posts_tutor_id_fkey (full_name, avatar_url)`)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(30);

            if (activeTab === 'amigos' && friendIds.length > 0) {
                query = query.in('tutor_id', friendIds);
            }

            const { data, error } = await query;
            if (error) throw error;

            let userLikes: string[] = [];
            let userSaves: string[] = [];
            if (user) {
                const postIds = (data || []).map(p => p.id);
                if (postIds.length > 0) {
                    const [likesRes, savesRes] = await Promise.all([
                        supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
                        supabase.from('post_saves').select('post_id').eq('user_id', user.id).in('post_id', postIds),
                    ]);
                    userLikes = (likesRes.data || []).map(l => l.post_id);
                    userSaves = (savesRes.data || []).map(s => s.post_id);
                }
            }

            const formatted: PostData[] = (data || []).map((post: any) => {
                const author = Array.isArray(post.author) ? post.author[0] : post.author;
                const images = post.images ? (Array.isArray(post.images) ? post.images : [post.images]) : [];
                return {
                    id: post.id,
                    tutor_id: post.tutor_id,
                    description: post.description || '',
                    images,
                    created_at: post.created_at,
                    author_name: author?.full_name || 'Usuário',
                    author_avatar: author?.avatar_url || undefined,
                    likes_count: post.likes_count || 0,
                    comments_count: post.comments_count || 0,
                    user_has_liked: userLikes.includes(post.id),
                    user_has_saved: userSaves.includes(post.id),
                };
            });
            setPosts(formatted);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, user]);

    const fetchStories = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('stories')
                .select(`*, author:users!stories_user_id_fkey (full_name, avatar_url)`)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });
            if (error) throw error;

            let viewedStoryIds: string[] = [];
            if (user) {
                const { data: views } = await supabase
                    .from('story_views').select('story_id').eq('viewer_id', user.id);
                viewedStoryIds = (views || []).map(v => v.story_id);
            }

            const formatted: Story[] = (data || []).map((s: any) => {
                const author = Array.isArray(s.author) ? s.author[0] : s.author;
                return {
                    id: s.id,
                    user_id: s.user_id,
                    image_url: s.image_url,
                    user_name: author?.full_name || 'Usuário',
                    user_avatar: author?.avatar_url,
                    viewed: viewedStoryIds.includes(s.id),
                };
            });
            setStories(formatted);
        } catch (err) {
            console.error('Error fetching stories:', err);
        }
    }, [user]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);
    useEffect(() => { fetchStories(); }, [fetchStories]);

    const handleViewStory = async (story: Story) => {
        setViewingStory(story);
        setStoryProgress(0);
        if (user && !story.viewed) {
            await supabase.from('story_views').insert({ story_id: story.id, viewer_id: user.id }).select();
            setStories(prev => prev.map(s => s.id === story.id ? { ...s, viewed: true } : s));
        }
    };

    // Auto-close story after 5 seconds
    useEffect(() => {
        if (!viewingStory) return;
        const interval = setInterval(() => {
            setStoryProgress(prev => {
                if (prev >= 100) { setViewingStory(null); return 0; }
                return prev + 2;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [viewingStory]);

    const groupedStories = stories.reduce<Story[]>((acc, story) => {
        if (!acc.find(s => s.user_id === story.user_id)) acc.push(story);
        return acc;
    }, []);

    return (
        <div>
            {/* Stories Bar — Instagram mobile proportions (62px circles) */}
            <div className="bg-white border-b border-gray-100 py-2">
                <div className="flex gap-3 px-3 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                    {/* Add Story */}
                    {user && (
                        <div className="flex flex-col items-center gap-0.5 min-w-[64px] cursor-pointer" onClick={() => navigate('/caomunicacao/publicar?story=true')}>
                            <div className="relative">
                                <div className="size-[62px] rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-400 text-2xl">person</span>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 rounded-full border-2 border-white size-5 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[14px] font-bold">add</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-700 leading-tight">Seu story</span>
                        </div>
                    )}

                    {/* User Stories */}
                    {groupedStories.map(story => (
                        <div key={story.id} className="flex flex-col items-center gap-0.5 min-w-[64px] cursor-pointer" onClick={() => handleViewStory(story)}>
                            <div className={`size-[66px] rounded-full p-[2.5px] ${story.viewed ? 'bg-gray-300' : 'bg-gradient-to-tr from-orange-400 via-red-400 to-amber-500'}`}>
                                <img
                                    src={story.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.user_name)}&background=f97316&color=fff&size=64`}
                                    alt=""
                                    className="size-full rounded-full object-cover border-[2.5px] border-white"
                                />
                            </div>
                            <span className="text-[10px] text-gray-700 truncate max-w-[64px] leading-tight">{story.user_name.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feed Tabs */}
            <div className="bg-white border-b border-gray-100 flex">
                {(['todos', 'amigos', 'mural'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-center text-[13px] font-semibold transition-colors relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                        {tab === 'todos' ? 'Todos' : tab === 'amigos' ? 'Amigos' : 'Mural'}
                        {activeTab === tab && <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gray-900" />}
                    </button>
                ))}
            </div>

            {/* Content Switcher */}
            {activeTab === 'mural' ? (
                <div className="min-h-screen bg-slate-50 relative pb-[50px] md:pb-0">
                    <CommunityWall />
                </div>
            ) : (
                <>
                    {/* Posts */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin size-7 border-2 border-orange-500 border-t-transparent rounded-full" />
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 px-8">
                    <div className="size-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                        <span className="material-symbols-outlined text-orange-400 text-3xl">pets</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-[15px] mb-1">
                        {activeTab === 'amigos' ? 'Nenhum post de amigos' : 'Nenhum post ainda'}
                    </p>
                    <p className="text-gray-400 text-[13px] mb-4">
                        {activeTab === 'amigos' ? 'Adicione amigos para ver seus posts!' : 'Compartilhe um momento do seu pet!'}
                    </p>
                    {activeTab === 'todos' && (
                        <button
                            onClick={() => navigate('/caomunicacao/publicar')}
                            className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold text-[13px]"
                        >
                            Criar publicação
                        </button>
                    )}
                </div>
            ) : (
                posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onComment={() => fetchPosts()}
                        onDelete={(id) => setPosts(prev => prev?.filter(p => p.id !== id))}
                    />
                ))
            )}
            </>
            )}

            {/* Story Viewer Modal — Full screen mobile */}
            {viewingStory && (
                <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center" onClick={() => setViewingStory(null)}>
                    <div className="w-full h-full max-w-[480px] relative">
                        {/* Progress bars */}
                        <div className="absolute top-2 left-2 right-2 z-10 flex gap-0.5">
                            <div className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-100"
                                    style={{ width: `${storyProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="absolute top-4 left-3 right-3 z-10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img
                                    src={viewingStory.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingStory.user_name)}&size=32`}
                                    className="size-7 rounded-full border border-white/50 object-cover"
                                    alt=""
                                />
                                <span className="text-white font-semibold text-[13px] drop-shadow">{viewingStory.user_name}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setViewingStory(null); }} className="text-white p-1">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <img src={viewingStory.image_url} alt="" className="w-full h-full object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialFeed;
