import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet, useParams } from 'react-router-dom';
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
    const { conversationId } = useParams();
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
        <div className="flex h-auto min-h-[max(calc(100vh-80px),600px)] overflow-hidden bg-slate-50 dark:bg-slate-900 p-0 md:p-4">
            <div className="flex-1 flex w-full max-w-6xl mx-auto bg-white dark:bg-slate-900 md:border md:border-slate-200 dark:border-slate-800 md:shadow-md md:rounded-xl overflow-hidden">
                {/* Conversations Sidebar (Hidden on mobile if viewing a chat) */}
                <aside className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 ${conversationId ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="h-16 border-b border-slate-100 dark:border-slate-800 px-4 flex items-center justify-between shrink-0">
                        <h2 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                             Mensagens
                        </h2>
                        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[26px]">edit_square</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                        {(['geral', 'pendentes'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3.5 text-center text-sm font-semibold relative transition-colors ${activeTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                {tab === 'geral' ? 'Geral' : 'Solicitações'}
                                {tab === 'pendentes' && pendingCount > 0 && (
                                    <span className="ml-1.5 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                                )}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white" />}
                            </button>
                        ))}
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin size-8 border-2 border-secondary border-t-transparent rounded-full" />
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-12 px-6">
                                <div className="size-16 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                                    <span className="material-symbols-outlined text-3xl">
                                        {activeTab === 'pendentes' ? 'mark_chat_unread' : 'chat_bubble_outline'}
                                    </span>
                                </div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">
                                    {activeTab === 'pendentes' ? 'Nenhuma solicitação' : 'Caixa de entrada vazia'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {activeTab === 'geral' ? 'Suas mensagens aparecerão aqui.' : 'Sem mensagens pendentes.'}
                                </p>
                            </div>
                        ) : (
                            <div>
                                {filteredConversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${conversationId === conv.id ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                        onClick={() => navigate(`/caomunicacao/mensagens/${conv.id}`)}
                                    >
                                        <div className="relative">
                                            <img
                                                src={conv.other_user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.other_user_name)}&background=f97316&color=fff&size=56`}
                                                alt=""
                                                className="size-14 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                                            />
                                            {conv.unread_count > 0 && (
                                                <div className="absolute top-0 right-0 bg-secondary border-2 border-white dark:border-slate-900 text-white text-[10px] font-bold size-5 rounded-full flex items-center justify-center">
                                                    {conv.unread_count}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
                                                    {conv.other_user_name}
                                                </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
                                            </div>
                                            <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {conv.last_message || 'Nenhuma mensagem ainda'}
                                            </p>
                                        </div>

                                        {activeTab === 'pendentes' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAcceptConversation(conv.id); }}
                                                className="bg-secondary hover:bg-secondary/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                                            >
                                                Aceitar
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content Area / Chat Room (Hidden on mobile if no conversation is selected) */}
                <main className={`flex-1 flex flex-col relative bg-white dark:bg-slate-900 ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
                    <Outlet />
                    {!conversationId && (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center">
                             <div className="size-24 rounded-full border-2 border-slate-800 dark:border-slate-600 flex items-center justify-center mb-4">
                                  <span className="material-symbols-outlined text-4xl transform -rotate-45 ml-2 mt-2">send</span>
                             </div>
                             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Suas Mensagens</h3>
                             <p className="text-sm mt-2 max-w-xs">Comunique-se de forma privada com seus amigos e outros tutores.</p>
                             <button onClick={() => {}} className="mt-8 bg-secondary hover:bg-secondary/90 text-white px-6 py-2 rounded-xl font-bold transition-all transform hover:scale-105 shadow-md shadow-secondary/20">
                                Nova Mensagem
                             </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SocialMessages;
