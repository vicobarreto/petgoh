import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface PostCardProps {
    post: {
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
    };
    onLikeToggle?: (postId: string, liked: boolean) => void;
    onSaveToggle?: (postId: string, saved: boolean) => void;
    onComment?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLikeToggle, onSaveToggle, onComment }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.user_has_liked);
    const [saved, setSaved] = useState(post.user_has_saved);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [currentImg, setCurrentImg] = useState(0);

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'agora';
        if (mins < 60) return `${mins} min`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} h`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days} d`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} sem`;
        return new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    };

    const handleLike = async () => {
        if (!user) return;
        const newLiked = !liked;
        setLiked(newLiked);
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
        try {
            if (newLiked) {
                await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
            } else {
                await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: user.id });
            }
            onLikeToggle?.(post.id, newLiked);
        } catch {
            setLiked(!newLiked);
            setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        const newSaved = !saved;
        setSaved(newSaved);
        try {
            if (newSaved) {
                await supabase.from('post_saves').insert({ post_id: post.id, user_id: user.id });
            } else {
                await supabase.from('post_saves').delete().match({ post_id: post.id, user_id: user.id });
            }
            onSaveToggle?.(post.id, newSaved);
        } catch {
            setSaved(!newSaved);
        }
    };

    const handleSubmitComment = async () => {
        if (!user || !commentText.trim()) return;
        try {
            await supabase.from('post_comments').insert({
                post_id: post.id, user_id: user.id, content: commentText.trim()
            });
            setCommentText('');
            setShowCommentInput(false);
            onComment?.(post.id);
        } catch (err) {
            console.error('Comment error:', err);
        }
    };

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name)}&background=f97316&color=fff&size=64`;

    // Touch swipe for carousel
    const [touchStart, setTouchStart] = useState(0);
    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentImg < post.images.length - 1) setCurrentImg(prev => prev + 1);
            if (diff < 0 && currentImg > 0) setCurrentImg(prev => prev - 1);
        }
    };

    return (
        <article className="bg-white border-b border-gray-50">
            {/* Header — compact like Instagram */}
            <div className="flex items-center justify-between px-3 py-2">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate(`/caomunicacao/perfil/${post.tutor_id}`)}
                >
                    <div className="size-8 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 p-[1.5px]">
                        <img
                            src={post.author_avatar || defaultAvatar}
                            alt=""
                            className="size-full rounded-full object-cover border-[1.5px] border-white"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[13px] font-semibold text-gray-900">{post.author_name}</span>
                    </div>
                </div>
                <button className="text-gray-500 p-0.5">
                    <span className="material-symbols-outlined text-lg">more_horiz</span>
                </button>
            </div>

            {/* Image — full width, square aspect ratio like Instagram */}
            {post.images.length > 0 && (
                <div
                    className="relative aspect-square bg-gray-900 overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <img
                        src={post.images[currentImg]}
                        alt=""
                        className="w-full h-full object-cover"
                        onDoubleClick={handleLike}
                    />
                    {/* Image counter badge */}
                    {post.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-gray-900/70 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                            {currentImg + 1}/{post.images.length}
                        </div>
                    )}
                    {/* Carousel dots */}
                    {post.images.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                            {post.images.map((_, i) => (
                                <div
                                    key={i}
                                    className={`rounded-full transition-all ${i === currentImg ? 'bg-orange-500 w-1.5 h-1.5' : 'bg-white/60 w-1 h-1'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Actions row — Instagram exact spacing */}
            <div className="px-3 pt-2">
                <div className="flex justify-between items-center mb-1.5">
                    <div className="flex gap-3.5">
                        <button onClick={handleLike} className="transition-transform active:scale-125">
                            <span
                                className="material-symbols-outlined text-[24px]"
                                style={liked ? { color: '#ef4444', fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {liked ? 'favorite' : 'favorite_border'}
                            </span>
                        </button>
                        <button onClick={() => navigate(`/caomunicacao/post/${post.id}`)}>
                            <span className="material-symbols-outlined text-[24px]">chat_bubble_outline</span>
                        </button>
                        <button>
                            <span className="material-symbols-outlined text-[24px]">send</span>
                        </button>
                    </div>
                    <button onClick={handleSave} className="transition-transform active:scale-110">
                        <span
                            className="material-symbols-outlined text-[24px]"
                            style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                            {saved ? 'bookmark' : 'bookmark_border'}
                        </span>
                    </button>
                </div>

                {/* Likes */}
                <p className="font-semibold text-[13px] mb-0.5">
                    {likesCount.toLocaleString('pt-BR')} curtida{likesCount !== 1 ? 's' : ''}
                </p>

                {/* Caption */}
                {post.description && (
                    <p className="text-[13px] mb-0.5 leading-[18px]">
                        <span className="font-semibold mr-1">{post.author_name}</span>
                        {post.description.length > 120
                            ? <>{post.description.slice(0, 120)}... <button className="text-gray-400">mais</button></>
                            : post.description
                        }
                    </p>
                )}

                {/* Comments link */}
                {post.comments_count > 0 && (
                    <button
                        onClick={() => navigate(`/caomunicacao/post/${post.id}`)}
                        className="text-gray-400 text-[13px] block mb-0.5"
                    >
                        Ver {post.comments_count > 1 ? `todos os ${post.comments_count} comentários` : '1 comentário'}
                    </button>
                )}

                {/* Inline comment */}
                {showCommentInput && user ? (
                    <div className="flex items-center gap-2 py-1 border-t border-gray-50 mt-1">
                        <input
                            type="text"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                            placeholder="Adicione um comentário..."
                            className="flex-1 text-[13px] bg-transparent outline-none"
                            autoFocus
                        />
                        {commentText.trim() && (
                            <button onClick={handleSubmitComment} className="text-orange-500 font-semibold text-[13px]">
                                Publicar
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setShowCommentInput(true)}
                        className="text-gray-400 text-[13px] block mb-1"
                    >
                        Adicione um comentário...
                    </button>
                )}

                {/* Time ago */}
                <p className="text-[10px] text-gray-400 uppercase pb-2">{timeAgo(post.created_at)}</p>
            </div>
        </article>
    );
};

export default PostCard;
