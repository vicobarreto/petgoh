import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
}

interface OtherUser {
    id: string;
    full_name: string;
    avatar_url?: string;
}

const SocialChat: React.FC = () => {
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversation = useCallback(async () => {
        if (!conversationId || !user) return;
        try {
            const { data: conv } = await supabase
                .from('conversations')
                .select(`
                    *,
                    p1:users!conversations_participant_1_fkey (id, full_name, avatar_url),
                    p2:users!conversations_participant_2_fkey (id, full_name, avatar_url)
                `)
                .eq('id', conversationId)
                .single();

            if (conv) {
                const p1 = Array.isArray(conv.p1) ? conv.p1[0] : conv.p1;
                const p2 = Array.isArray(conv.p2) ? conv.p2[0] : conv.p2;
                const other = p1?.id === user.id ? p2 : p1;
                setOtherUser(other ? { id: other.id, full_name: other.full_name, avatar_url: other.avatar_url } : null);
            }
        } catch (err) {
            console.error('Conversation fetch error:', err);
        }
    }, [conversationId, user]);

    const fetchMessages = useCallback(async () => {
        if (!conversationId) return;
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);

            // Mark unread messages as read
            if (user) {
                await supabase
                    .from('messages')
                    .update({ read_at: new Date().toISOString() })
                    .eq('conversation_id', conversationId)
                    .neq('sender_id', user.id)
                    .is('read_at', null);
            }
        } catch (err) {
            console.error('Messages fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [conversationId, user]);

    useEffect(() => { fetchConversation(); }, [fetchConversation]);
    useEffect(() => { fetchMessages(); }, [fetchMessages]);
    useEffect(() => { scrollToBottom(); }, [messages]);

    // Realtime subscription
    useEffect(() => {
        if (!conversationId) return;
        const channel = supabase
            .channel(`chat-${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [conversationId]);

    const handleSend = async () => {
        if (!user || !conversationId || !newMessage.trim()) return;
        setSending(true);

        const tempMsg: Message = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
            read_at: null,
        };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        try {
            await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: tempMsg.content,
            });

            // Update conversation last_message_at
            await supabase
                .from('conversations')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', conversationId);
        } catch (err) {
            console.error('Send error:', err);
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const groupMessagesByDate = (msgs: Message[]) => {
        const groups: { date: string; messages: Message[] }[] = [];
        msgs.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            const lastGroup = groups[groups.length - 1];
            if (lastGroup?.date === date) {
                lastGroup.messages.push(msg);
            } else {
                groups.push({ date, messages: [msg] });
            }
        });
        return groups;
    };

    const defaultAvatar = otherUser
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.full_name)}&background=f97316&color=fff`
        : '';

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 w-full relative">
            {/* Chat Header */}
            <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 z-10 w-full">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/caomunicacao/mensagens')} className="md:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[26px]">arrow_back</span>
                    </button>
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => otherUser && navigate(`/caomunicacao/perfil/${otherUser.id}`)}
                    >
                        <img
                            src={otherUser?.avatar_url || defaultAvatar}
                            alt=""
                            className="size-10 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                        />
                        <div>
                            <p className="font-bold text-[15px] text-slate-900 dark:text-white leading-none mb-0.5">{otherUser?.full_name || 'Carregando...'}</p>
                            <p className="text-xs text-emerald-500 font-medium leading-none">Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="text-slate-400 hover:text-secondary transition-colors p-2 hidden sm:block">
                        <span className="material-symbols-outlined text-[24px]">call</span>
                    </button>
                    <button className="text-slate-400 hover:text-secondary transition-colors p-2 hidden sm:block">
                        <span className="material-symbols-outlined text-[24px]">videocam</span>
                    </button>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2">
                        <span className="material-symbols-outlined text-[24px]">info</span>
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 bg-slate-50 dark:bg-slate-900/50 w-full">
                {loading ? (
                    <div className="flex items-center justify-center py-10 flex-col gap-4 h-full">
                        <div className="animate-spin size-8 border-4 border-secondary border-t-transparent rounded-full" />
                        <p className="text-slate-500 text-sm">Carregando mensagens...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto p-6">
                        <img src={otherUser?.avatar_url || defaultAvatar} alt="" className="size-24 rounded-full mb-4 border-4 border-white dark:border-slate-800 shadow-lg object-cover" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{otherUser?.full_name?.split(' ')[0]}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Vocês ainda não tem mensagens. Diga olá e faça uma nova Cãomunicação!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groupMessagesByDate(messages).map(group => (
                            <div key={group.date} className="space-y-4">
                                <div className="flex justify-center my-4 sticky top-2 z-10">
                                    <span className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">{group.date}</span>
                                </div>
                                {group.messages.map(msg => {
                                    const isMine = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl relative group ${
                                                isMine
                                                    ? 'bg-secondary text-white rounded-br-sm shadow-md shadow-secondary/10'
                                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-sm shadow-sm'
                                            }`}>
                                                <p className="text-[14px] leading-relaxed break-words">{msg.content}</p>
                                                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isMine ? 'text-white/70' : 'text-slate-400'}`}>
                                                        {formatTime(msg.created_at)}
                                                    </span>
                                                    {isMine && msg.read_at && (
                                                        <span className="material-symbols-outlined text-[14px] text-white/90">done_all</span>
                                                    )}
                                                </div>
                                                
                                                {/* Action Buttons (Visible on Hover) */}
                                                <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isMine ? '-left-10' : '-right-10'}`}>
                                                    <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                                                        <span className="material-symbols-outlined text-[14px]">reply</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 shrink-0 w-full z-10">
                <div className="max-w-4xl mx-auto flex items-end gap-2">
                    <button className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                    
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all">
                        <textarea
                            ref={inputRef as any}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={`Mensagem para ${otherUser?.full_name?.split(' ')[0] || '...'}`}
                            className="flex-1 bg-transparent text-[14px] text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 outline-none resize-none max-h-32 min-h-[44px]"
                            rows={1}
                        />
                        <button className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors hidden sm:block">
                            <span className="material-symbols-outlined">sentiment_satisfied</span>
                        </button>
                    </div>

                    <button 
                        onClick={handleSend} 
                        disabled={sending || !newMessage.trim()} 
                        className={`p-3 rounded-full flex items-center justify-center transition-all shrink-0 shadow-md ${
                            newMessage.trim() 
                                ? 'bg-secondary text-white hover:bg-secondary/90 hover:scale-105 shadow-secondary/30' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-transparent'
                        }`}
                    >
                        {sending ? (
                             <div className="animate-spin size-6 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                             <span className="material-symbols-outlined">{newMessage.trim() ? 'send' : 'mic'}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialChat;
