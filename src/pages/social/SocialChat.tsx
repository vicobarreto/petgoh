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
        <div className="flex flex-col h-[calc(100vh-94px)] bg-white">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-2.5 shrink-0">
                <button onClick={() => navigate('/caomunicacao/mensagens')} className="text-gray-700 p-0.5">
                    <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                </button>
                <div
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={() => otherUser && navigate(`/caomunicacao/perfil/${otherUser.id}`)}
                >
                    <img
                        src={otherUser?.avatar_url || defaultAvatar}
                        alt=""
                        className="size-8 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-semibold text-[13px] text-gray-900 leading-tight">{otherUser?.full_name || 'Carregando...'}</p>
                        <p className="text-[10px] text-green-500 leading-tight">Online</p>
                    </div>
                </div>
                <button className="text-gray-400 p-0.5">
                    <span className="material-symbols-outlined text-[22px]">more_vert</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin size-6 border-2 border-orange-500 border-t-transparent rounded-full" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="size-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                            <span className="material-symbols-outlined text-orange-400 text-3xl">waving_hand</span>
                        </div>
                        <p className="text-sm text-gray-500">Diga olá para {otherUser?.full_name?.split(' ')[0]}!</p>
                    </div>
                ) : (
                    groupMessagesByDate(messages).map(group => (
                        <div key={group.date}>
                        <div className="text-center my-3">
                                <span className="bg-gray-200/80 text-gray-500 text-[10px] font-medium px-2.5 py-0.5 rounded-full">{group.date}</span>
                            </div>
                            {group.messages.map(msg => {
                                const isMine = msg.sender_id === user?.id;
                                return (
                                    <div key={msg.id} className={`flex mb-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[78%] px-3 py-[6px] rounded-2xl ${
                                            isMine
                                                ? 'bg-orange-500 text-white rounded-br-md'
                                                : 'bg-white text-gray-900 rounded-bl-md'
                                        }`}>
                                            <p className="text-[13px] break-words leading-snug">{msg.content}</p>
                                            <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
                                                <span className={`text-[10px] ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                                                    {formatTime(msg.created_at)}
                                                </span>
                                                {isMine && msg.read_at && (
                                                    <span className="material-symbols-outlined text-[12px] text-white/70">done_all</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-3 py-2 flex items-center gap-2 shrink-0">
                <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-1.5">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Mensagem..."
                        className="flex-1 bg-transparent text-[13px] outline-none"
                    />
                </div>
                {newMessage.trim() ? (
                    <button onClick={handleSend} disabled={sending} className="text-orange-500 font-semibold text-[13px] px-1">
                        Enviar
                    </button>
                ) : (
                    <button className="text-gray-400 p-0.5">
                        <span className="material-symbols-outlined text-[22px]">mic</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialChat;
