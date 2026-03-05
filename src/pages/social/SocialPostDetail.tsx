import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface PostDetail {
    id: string;
    tutor_id: string;
    description: string;
    images: string[];
    created_at: string;
    author_name: string;
    author_avatar?: string;
    likes_count: number;
    comments_count: number;
}

interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    user_name: string;
    user_avatar?: string;
}

const SocialPostDetail: React.FC = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const { user } = useAuth();
    const [post, setPost] = useState<PostDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [currentImage, setCurrentImage] = useState(0);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchPost = useCallback(async () => {
        if (!postId) return;
        try {
            const { data, error } = await supabase
                .from('wall_posts')
                .select(`*, author:users!wall_posts_tutor_id_fkey (full_name, avatar_url)`)
                .eq('id', postId)
                .single();

            if (error) throw error;

            const author = Array.isArray(data.author) ? data.author[0] : data.author;
            setPost({
                id: data.id,
                tutor_id: data.tutor_id,
                description: data.description || '',
                images: data.images || [],
                created_at: data.created_at,
                author_name: author?.full_name || 'Usuário',
                author_avatar: author?.avatar_url,
                likes_count: data.likes_count || 0,
                comments_count: data.comments_count || 0,
            });
            setLikesCount(data.likes_count || 0);

            // Check like/save status
            if (user) {
                const [likeRes, saveRes] = await Promise.all([
                    supabase.from('post_likes').select('id').match({ post_id: postId, user_id: user.id }).maybeSingle(),
                    supabase.from('post_saves').select('id').match({ post_id: postId, user_id: user.id }).maybeSingle(),
                ]);
                setLiked(!!likeRes.data);
                setSaved(!!saveRes.data);
            }
        } catch (err) {
            console.error('Post fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [postId, user]);

    const fetchComments = useCallback(async () => {
        if (!postId) return;
        try {
            const { data } = await supabase
                .from('post_comments')
                .select(`*, user:users!post_comments_user_id_fkey (full_name, avatar_url)`)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            setComments((data || []).map((c: any) => {
                const u = Array.isArray(c.user) ? c.user[0] : c.user;
                return {
                    id: c.id,
                    user_id: c.user_id,
                    content: c.content,
                    created_at: c.created_at,
                    user_name: u?.full_name || 'Usuário',
                    user_avatar: u?.avatar_url,
                };
            }));
        } catch (err) {
            console.error('Comments error:', err);
        }
    }, [postId]);

    useEffect(() => { fetchPost(); fetchComments(); }, [fetchPost, fetchComments]);

    const handleLike = async () => {
        if (!user || !postId) return;
        const newLiked = !liked;
        setLiked(newLiked);
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
        try {
            if (newLiked) {
                await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
            } else {
                await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
            }
        } catch { setLiked(!newLiked); setLikesCount(prev => newLiked ? prev - 1 : prev + 1); }
    };

    const handleSave = async () => {
        if (!user || !postId) return;
        const newSaved = !saved;
        setSaved(newSaved);
        try {
            if (newSaved) {
                await supabase.from('post_saves').insert({ post_id: postId, user_id: user.id });
            } else {
                await supabase.from('post_saves').delete().match({ post_id: postId, user_id: user.id });
            }
        } catch { setSaved(!newSaved); }
    };

    const handleComment = async () => {
        if (!user || !postId || !newComment.trim()) return;
        try {
            await supabase.from('post_comments').insert({
                post_id: postId, user_id: user.id, content: newComment.trim(),
            });
            setNewComment('');
            fetchComments();
        } catch (err) { console.error('Comment error:', err); }
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d`;
        return new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    };

    if (loading || !post) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="animate-spin size-7 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name)}&background=f97316&color=fff`;

    return (
        <div className="bg-white min-h-full flex flex-col">
            {/* Post Header — back button + author info */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-0.5">
                    <span className="material-symbols-outlined text-[22px] text-gray-700">arrow_back</span>
                </button>
                <img
                    src={post.author_avatar || defaultAvatar}
                    alt=""
                    className="size-7 rounded-full object-cover cursor-pointer"
                    onClick={() => navigate(`/caomunicacao/perfil/${post.tutor_id}`)}
                />
                <span className="font-semibold text-[13px] text-gray-900 cursor-pointer" onClick={() => navigate(`/caomunicacao/perfil/${post.tutor_id}`)}>
                    {post.author_name}
                </span>
            </div>

            {/* Image — full width, square like feed */}
            {post.images.length > 0 ? (
                <div className="relative aspect-square bg-gray-900 overflow-hidden"
                    onTouchStart={(e) => setCurrentImage(prev => prev)}
                >
                    <img src={post.images[currentImage]} alt="" className="w-full h-full object-cover" />
                    {post.images.length > 1 && (
                        <>
                            <div className="absolute top-3 right-3 bg-gray-900/70 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                                {currentImage + 1}/{post.images.length}
                            </div>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                {post.images.map((_, i) => (
                                    <button key={i} onClick={() => setCurrentImage(i)}
                                        className={`rounded-full transition-all ${i === currentImage ? 'bg-orange-500 w-1.5 h-1.5' : 'bg-white/60 w-1 h-1'}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-300 text-5xl">image</span>
                </div>
            )}

            {/* Actions — same as PostCard */}
            <div className="px-3 pt-2">
                <div className="flex justify-between mb-1.5">
                    <div className="flex gap-3.5">
                        <button onClick={handleLike} className="active:scale-125 transition-transform">
                            <span className="material-symbols-outlined text-[24px]" style={liked ? { color: '#ef4444', fontVariationSettings: "'FILL' 1" } : {}}>
                                {liked ? 'favorite' : 'favorite_border'}
                            </span>
                        </button>
                        <button><span className="material-symbols-outlined text-[24px]">chat_bubble_outline</span></button>
                        <button><span className="material-symbols-outlined text-[24px]">send</span></button>
                    </div>
                    <button onClick={handleSave} className="active:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[24px]" style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {saved ? 'bookmark' : 'bookmark_border'}
                        </span>
                    </button>
                </div>
                <p className="font-semibold text-[13px] mb-0.5">{likesCount.toLocaleString('pt-BR')} curtida{likesCount !== 1 ? 's' : ''}</p>

                {/* Caption */}
                {post.description && (
                    <p className="text-[13px] mb-1 leading-[18px]">
                        <span className="font-semibold mr-1">{post.author_name}</span>
                        {post.description}
                    </p>
                )}
                <p className="text-[10px] text-gray-400 uppercase mb-2">{timeAgo(post.created_at)}</p>
            </div>

            {/* Comments */}
            <div className="border-t border-gray-100 flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {comments.length === 0 && (
                    <p className="text-[13px] text-gray-400 text-center py-4">Nenhum comentário ainda.</p>
                )}
                {comments.map(c => (
                    <div key={c.id} className="flex gap-2.5">
                        <img
                            src={c.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name)}&background=f97316&color=fff&size=32`}
                            alt=""
                            className="size-7 rounded-full object-cover shrink-0 cursor-pointer"
                            onClick={() => navigate(`/caomunicacao/perfil/${c.user_id}`)}
                        />
                        <div>
                            <p className="text-[13px] leading-snug"><span className="font-semibold mr-1">{c.user_name}</span>{c.content}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(c.created_at)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comment Input */}
            {user && (
                <div className="border-t border-gray-100 px-3 py-2 flex items-center gap-2">
                    <input
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleComment()}
                        placeholder="Adicione um comentário..."
                        className="flex-1 text-[13px] bg-transparent outline-none"
                    />
                    {newComment.trim() && (
                        <button onClick={handleComment} className="text-orange-500 font-semibold text-[13px]">Publicar</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SocialPostDetail;
