import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type NotifCategory = 'all' | 'social' | 'mural' | 'promos';

interface Notification {
    id: string;
    type: 'like' | 'comment' | 'new_post' | 'adoption' | 'lost_pet' | 'promo' | 'giveaway';
    category: NotifCategory;
    title: string;
    message: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    link: string;
    created_at: string;
    avatar?: string;
    read: boolean;
}

const FILTER_TABS: { key: NotifCategory; label: string; icon: string }[] = [
    { key: 'all', label: 'Tudo', icon: 'notifications' },
    { key: 'social', label: 'Caomunicação', icon: 'forum' },
    { key: 'mural', label: 'Mural', icon: 'dashboard' },
    { key: 'promos', label: 'Promoções', icon: 'local_offer' },
];

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function groupByDate(notifs: Notification[]): { label: string; items: Notification[] }[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    const groups: Record<string, Notification[]> = {};

    notifs.forEach(n => {
        const d = new Date(n.created_at);
        let label: string;

        if (d.toDateString() === todayStr) label = 'Hoje';
        else if (d.toDateString() === yesterdayStr) label = 'Ontem';
        else label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

        if (!groups[label]) groups[label] = [];
        groups[label].push(n);
    });

    return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<NotifCategory>('all');
    const [readIds, setReadIds] = useState<Set<string>>(new Set());

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        const allNotifs: Notification[] = [];

        try {
            // 1. Social Feed: Recent posts (new_post notifications)
            const { data: recentPosts } = await supabase
                .from('wall_posts')
                .select(`*, author:users!wall_posts_tutor_id_fkey (full_name, avatar_url)`)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(15);

            (recentPosts || []).forEach(post => {
                const authorName = post.author?.full_name || 'Alguém';
                const avatar = post.author?.avatar_url;

                // New post notification
                if (post.post_type === 'adoption' || post.post_type === 'lost_pet') {
                    allNotifs.push({
                        id: `mural_${post.id}`,
                        type: post.post_type === 'adoption' ? 'adoption' : 'lost_pet',
                        category: 'mural',
                        title: post.post_type === 'adoption' ? '🐾 Novo pet para adoção' : '🔍 Pet perdido reportado',
                        message: `${authorName} ${post.post_type === 'adoption' ? 'colocou um pet para adoção' : 'reportou um pet perdido'}: ${(post.description || '').slice(0, 80)}${(post.description || '').length > 80 ? '...' : ''}`,
                        icon: post.post_type === 'adoption' ? 'pets' : 'location_searching',
                        iconBg: post.post_type === 'adoption' ? 'bg-green-100' : 'bg-red-100',
                        iconColor: post.post_type === 'adoption' ? 'text-green-600' : 'text-red-600',
                        link: post.post_type === 'adoption' ? `/mural/adocao/${post.id}` : `/mural`,
                        created_at: post.created_at,
                        avatar,
                        read: readIds.has(`mural_${post.id}`),
                    });
                } else {
                    allNotifs.push({
                        id: `social_${post.id}`,
                        type: 'new_post',
                        category: 'social',
                        title: '📝 Novo post na Caomunicação',
                        message: `${authorName} publicou: ${(post.description || '').slice(0, 80)}${(post.description || '').length > 80 ? '...' : ''}`,
                        icon: 'article',
                        iconBg: 'bg-blue-100',
                        iconColor: 'text-blue-600',
                        link: `/caomunicacao/post/${post.id}`,
                        created_at: post.created_at,
                        avatar,
                        read: readIds.has(`social_${post.id}`),
                    });
                }
            });

            // 2. Likes on user's own posts
            if (user) {
                const { data: userPosts } = await supabase
                    .from('wall_posts')
                    .select('id')
                    .eq('tutor_id', user.id);

                const userPostIds = (userPosts || []).map(p => p.id);

                if (userPostIds.length > 0) {
                    const { data: likes } = await supabase
                        .from('post_likes')
                        .select('*, user:users!post_likes_user_id_fkey (full_name, avatar_url)')
                        .in('post_id', userPostIds)
                        .neq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(20);

                    (likes || []).forEach(like => {
                        const likerName = like.user?.full_name || 'Alguém';
                        allNotifs.push({
                            id: `like_${like.id || like.post_id + like.user_id}`,
                            type: 'like',
                            category: 'social',
                            title: '❤️ Curtida no seu post',
                            message: `${likerName} curtiu sua publicação.`,
                            icon: 'favorite',
                            iconBg: 'bg-pink-100',
                            iconColor: 'text-pink-600',
                            link: `/caomunicacao/post/${like.post_id}`,
                            created_at: like.created_at,
                            avatar: like.user?.avatar_url,
                            read: readIds.has(`like_${like.id || like.post_id + like.user_id}`),
                        });
                    });

                    // 3. Comments on user's own posts
                    const { data: comments } = await supabase
                        .from('post_comments')
                        .select('*, user:users!post_comments_user_id_fkey (full_name, avatar_url)')
                        .in('post_id', userPostIds)
                        .neq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(20);

                    (comments || []).forEach(comment => {
                        const commenterName = comment.user?.full_name || 'Alguém';
                        allNotifs.push({
                            id: `comment_${comment.id}`,
                            type: 'comment',
                            category: 'social',
                            title: '💬 Comentário no seu post',
                            message: `${commenterName}: "${(comment.content || '').slice(0, 60)}${(comment.content || '').length > 60 ? '...' : ''}"`,
                            icon: 'chat_bubble',
                            iconBg: 'bg-indigo-100',
                            iconColor: 'text-indigo-600',
                            link: `/caomunicacao/post/${comment.post_id}`,
                            created_at: comment.created_at,
                            avatar: comment.user?.avatar_url,
                            read: readIds.has(`comment_${comment.id}`),
                        });
                    });
                }
            }

            // 4. Active promotions / coupons
            const { data: promos } = await supabase
                .from('coupons')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(10);

            (promos || []).forEach(promo => {
                allNotifs.push({
                    id: `promo_${promo.id}`,
                    type: 'promo',
                    category: 'promos',
                    title: '🏷️ Nova promoção disponível!',
                    message: `${promo.code}: ${promo.description || `${promo.discount}% de desconto`}`,
                    icon: 'local_offer',
                    iconBg: 'bg-orange-100',
                    iconColor: 'text-orange-600',
                    link: '/packages',
                    created_at: promo.created_at,
                    read: readIds.has(`promo_${promo.id}`),
                });
            });

            // 5. Active giveaways / sorteios
            const { data: giveaways } = await supabase
                .from('giveaways')
                .select('*')
                .eq('status', 'upcoming')
                .order('created_at', { ascending: false })
                .limit(5);

            (giveaways || []).forEach(gw => {
                allNotifs.push({
                    id: `giveaway_${gw.id}`,
                    type: 'giveaway',
                    category: 'promos',
                    title: '🎉 Novo sorteio aberto!',
                    message: `${gw.title}: ${gw.prize_description || 'Participe e concorra!'}`,
                    icon: 'celebration',
                    iconBg: 'bg-amber-100',
                    iconColor: 'text-amber-600',
                    link: '/packages',
                    created_at: gw.created_at,
                    read: readIds.has(`giveaway_${gw.id}`),
                });
            });

            // Sort all notifications by date
            allNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setNotifications(allNotifs);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user, readIds]);

    useEffect(() => {
        // Load read state from localStorage
        const saved = localStorage.getItem('petgoh_read_notifs');
        if (saved) setReadIds(new Set(JSON.parse(saved)));
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleClick = (notif: Notification) => {
        // Mark as read
        const newReadIds = new Set(readIds);
        newReadIds.add(notif.id);
        setReadIds(newReadIds);
        localStorage.setItem('petgoh_read_notifs', JSON.stringify([...newReadIds]));

        // Update the notification in state
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));

        // Navigate
        navigate(notif.link);
    };

    const handleMarkAllRead = () => {
        const allIds = new Set(notifications.map(n => n.id));
        setReadIds(allIds);
        localStorage.setItem('petgoh_read_notifs', JSON.stringify([...allIds]));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const filtered = activeFilter === 'all'
        ? notifications
        : notifications.filter(n => n.category === activeFilter);

    const grouped = groupByDate(filtered);
    const unreadCount = notifications.filter(n => !n.read).length;

    const unreadByCategory: Record<NotifCategory, number> = {
        all: unreadCount,
        social: notifications.filter(n => n.category === 'social' && !n.read).length,
        mural: notifications.filter(n => n.category === 'mural' && !n.read).length,
        promos: notifications.filter(n => n.category === 'promos' && !n.read).length,
    };

    return (
        <div className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notificações</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {unreadCount > 0
                            ? `Você tem ${unreadCount} ${unreadCount === 1 ? 'atualização não lida' : 'atualizações não lidas'}`
                            : 'Tudo em dia! Nenhuma notificação pendente.'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm font-semibold text-primary hover:text-orange-600 transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-lg">done_all</span>
                        Marcar tudo lido
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                {FILTER_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                            activeFilter === tab.key
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.label}
                        {unreadByCategory[tab.key] > 0 && (
                            <span className={`min-w-[20px] h-5 rounded-full text-[11px] font-bold flex items-center justify-center px-1.5 ${
                                activeFilter === tab.key
                                    ? 'bg-white/25 text-white'
                                    : 'bg-red-500 text-white'
                            }`}>
                                {unreadByCategory[tab.key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                    <p className="text-gray-400 text-sm mt-4">Carregando notificações...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl text-gray-300">notifications_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-1">Nenhuma notificação</h3>
                    <p className="text-gray-400 text-sm max-w-xs">
                        {activeFilter === 'all'
                            ? 'Quando houver novidades, elas aparecerão aqui.'
                            : `Nenhuma atualização na categoria "${FILTER_TABS.find(t => t.key === activeFilter)?.label}".`}
                    </p>
                </div>
            )}

            {/* Notification Groups */}
            {!loading && grouped.map(group => (
                <div key={group.label} className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{group.label}</h3>
                    <div className="flex flex-col gap-2">
                        {group.items.map(notif => (
                            <button
                                key={notif.id}
                                onClick={() => handleClick(notif)}
                                className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-all group hover:shadow-md ${
                                    notif.read
                                        ? 'bg-white border-gray-100 hover:border-gray-200'
                                        : 'bg-primary/[0.03] border-primary/10 hover:border-primary/20'
                                }`}
                            >
                                {/* Icon or Avatar */}
                                <div className="flex-shrink-0 relative">
                                    {notif.avatar ? (
                                        <div className="w-11 h-11 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url(${notif.avatar})` }} />
                                    ) : (
                                        <div className={`w-11 h-11 rounded-full ${notif.iconBg} flex items-center justify-center`}>
                                            <span className={`material-symbols-outlined text-xl ${notif.iconColor}`}>{notif.icon}</span>
                                        </div>
                                    )}
                                    {!notif.read && (
                                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-sm font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                            {notif.title}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${notif.read ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                                        {notif.message}
                                    </p>
                                    <span className="text-xs text-gray-400 mt-1 inline-block">{timeAgo(notif.created_at)}</span>
                                </div>

                                {/* Chevron */}
                                <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 mt-1">
                                    chevron_right
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Settings link */}
            {!loading && notifications.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <button
                        onClick={() => navigate('/notifications/settings')}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 mx-auto"
                    >
                        <span className="material-symbols-outlined text-lg">settings</span>
                        Configurar notificações
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notifications;
