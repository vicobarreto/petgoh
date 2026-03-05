import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ConversationItem {
    id: string;
    other_user_id: string;
    other_user_name: string;
    other_user_avatar?: string;
    last_message?: string;
    last_message_at: string;
    unread_count: number;
    status: 'pending' | 'accepted';
}

const SocialMessages: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'geral' | 'pendentes'>('geral');
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    p1:users!conversations_participant_1_fkey (id, full_name, avatar_url),
                    p2:users!conversations_participant_2_fkey (id, full_name, avatar_url)
                `)
                .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            const formatted: ConversationItem[] = await Promise.all(
                (data || []).map(async (conv: any) => {
                    const p1 = Array.isArray(conv.p1) ? conv.p1[0] : conv.p1;
                    const p2 = Array.isArray(conv.p2) ? conv.p2[0] : conv.p2;
                    const other = p1?.id === user.id ? p2 : p1;

                    // Get last message
                    const { data: lastMsg } = await supabase
                        .from('messages')
                        .select('content, created_at')
                        .eq('conversation_id', conv.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    // Count unread
                    const { count } = await supabase
                        .from('messages')
                        .select('id', { count: 'exact', head: true })
                        .eq('conversation_id', conv.id)
                        .neq('sender_id', user.id)
                        .is('read_at', null);

                    return {
                        id: conv.id,
                        other_user_id: other?.id || '',
                        other_user_name: other?.full_name || 'Usuário',
                        other_user_avatar: other?.avatar_url,
                        last_message: lastMsg?.content,
                        last_message_at: lastMsg?.created_at || conv.last_message_at,
                        unread_count: count || 0,
                        status: conv.status,
                    };
                })
            );

            setConversations(formatted);
        } catch (err) {
            console.error('Conversations fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    // Realtime subscription
    useEffect(() => {
        if (!user) return;
        const channel = supabase
            .channel('messages-list')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                fetchConversations();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user, fetchConversations]);

    const filteredConversations = conversations.filter(c =>
        activeTab === 'pendentes' ? c.status === 'pending' : c.status === 'accepted'
    );

    const pendingCount = conversations.filter(c => c.status === 'pending').length;

    const handleAcceptConversation = async (convId: string) => {
        try {
            await supabase.from('conversations').update({ status: 'accepted' }).eq('id', convId);
            fetchConversations();
        } catch (err) {
            console.error('Accept error:', err);
        }
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}min`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        const days = Math.floor(hrs / 24);
        return `${days}d`;
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="size-16 rounded-full border-2 border-gray-900 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-gray-900 text-3xl">chat</span>
                </div>
                <p className="text-[14px] font-semibold text-gray-900 mb-1">Faça login para ver mensagens</p>
                <button onClick={() => navigate('/login')} className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold text-[13px] mt-2">
                    Fazer Login
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 h-11 flex items-center justify-between">
                <h2 className="font-semibold text-[15px]">Mensagens</h2>
                <button className="text-gray-500 p-0.5">
                    <span className="material-symbols-outlined text-[22px]">edit_square</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white">
                {(['geral', 'pendentes'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-center text-[13px] font-semibold relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                        {tab === 'geral' ? 'Geral' : 'Pendentes'}
                        {tab === 'pendentes' && pendingCount > 0 && (
                            <span className="ml-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-px rounded-full">{pendingCount}</span>
                        )}
                        {activeTab === tab && <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gray-900" />}
                    </button>
                ))}
            </div>

            {/* Conversations List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin size-7 border-2 border-orange-500 border-t-transparent rounded-full" />
                </div>
            ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-6">
                    <div className="size-14 rounded-full border-2 border-gray-900 flex items-center justify-center mx-auto mb-2.5">
                        <span className="material-symbols-outlined text-gray-900 text-2xl">
                            {activeTab === 'pendentes' ? 'mark_chat_unread' : 'chat_bubble_outline'}
                        </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-[14px] mb-0.5">
                        {activeTab === 'pendentes' ? 'Nenhuma conversa pendente' : 'Nenhuma conversa'}
                    </p>
                    <p className="text-[13px] text-gray-400">
                        {activeTab === 'geral' ? 'Visite um perfil e envie uma mensagem!' : 'Solicitações aparecerão aqui.'}
                    </p>
                </div>
            ) : (
                <div>
                    {filteredConversations.map(conv => (
                        <div
                            key={conv.id}
                            className="flex items-center gap-3 px-4 py-2.5 active:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/caomunicacao/mensagens/${conv.id}`)}
                        >
                            <div className="relative">
                                <img
                                    src={conv.other_user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.other_user_name)}&background=f97316&color=fff&size=56`}
                                    alt=""
                                    className="size-[52px] rounded-full object-cover"
                                />
                                {conv.unread_count > 0 && (
                                    <div className="absolute -top-px -right-px bg-orange-500 text-white text-[9px] font-bold size-[18px] rounded-full flex items-center justify-center">
                                        {conv.unread_count}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className={`text-[13px] truncate ${conv.unread_count > 0 ? 'font-bold text-gray-900' : 'font-normal text-gray-900'}`}>
                                        {conv.other_user_name}
                                    </span>
                                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
                                </div>
                                <p className={`text-[13px] truncate ${conv.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                                    {conv.last_message || 'Nenhuma mensagem ainda'}
                                </p>
                            </div>

                            {activeTab === 'pendentes' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAcceptConversation(conv.id); }}
                                    className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
                                >
                                    Aceitar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SocialMessages;
