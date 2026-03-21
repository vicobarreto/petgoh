import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import MediaUploader from '../../components/admin/MediaUploader';

interface Giveaway {
    id: string;
    title: string;
    description: string | null;
    prize_description: string;
    prize_value: number;
    start_date: string;
    end_date: string;
    draw_date: string;
    image_url: string | null;
    status: 'active' | 'upcoming' | 'completed';
    winner_id: string | null;
    winner?: { full_name: string; email: string };
    participants_count?: number;
}

interface User {
    id: string;
    full_name: string;
    email: string;
}

const GiveawayManagement: React.FC = () => {
    const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<Partial<Giveaway>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [potentialWinners, setPotentialWinners] = useState<User[]>([]);

    useEffect(() => {
        fetchGiveaways();
    }, []);

    const fetchGiveaways = async () => {
        try {
            setLoading(true);
            // BUG-10 fix: use simple query without FK name to avoid FK constraint error
            const { data: giveawayData, error } = await supabase
                .from('giveaways')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch winner info separately if winner_id is set. Now it's from tutors.
            const enriched = await Promise.all((giveawayData || []).map(async (g) => {
                if (g.winner_id) {
                    const { data: winnerData } = await supabase
                        .from('tutors')
                        .select('full_name, users(email)')
                        .eq('id', g.winner_id)
                        .single();
                    return { 
                        ...g, 
                        winner: winnerData ? { 
                            full_name: winnerData.full_name, 
                            // @ts-ignore (users may be object or array depending on relation)
                            email: winnerData.users?.email || '' 
                        } : undefined 
                    };
                }
                return g;
            }));

            setGiveaways(enriched);
        } catch (error) {
            console.error('Error fetching giveaways:', error);
            alert('Erro ao carregar sorteios');
        } finally {
            setLoading(false);
        }
    };

    const fetchPotentialWinners = async () => {
        // Fetch tutors for winner selection
        const { data } = await supabase
            .from('tutors')
            .select('id, full_name, users!inner(email)')
            .limit(50); // Limit for performance, improve with search later
        
        const mapped = (data || []).map((p: any) => ({
            id: p.id,
            full_name: p.full_name,
            email: p.users?.email || ''
        }));
        setPotentialWinners(mapped);
    };

    const [saving, setSaving] = useState(false);
    const [drawingId, setDrawingId] = useState<string | null>(null);
    const [drawResult, setDrawResult] = useState<{ giveaway: Giveaway; winner: User } | null>(null);

    const [isDrawingAnimated, setIsDrawingAnimated] = useState(false);
    const [currentDrawName, setCurrentDrawName] = useState<string>('');

    // LOG-08: Didactic draw — shows an animated countdown before revealing the winner
    const handleDraw = async (giveaway: Giveaway) => {
        if (!confirm(`Realizar sorteio para "${giveaway.title}"? Esta ação não pode ser desfeita.`)) return;
        setDrawingId(giveaway.id);
        try {
            // Fetch all eligible participants (tutors)
            const { data } = await supabase
                .from('tutors')
                .select('id, full_name, users!inner(email)');

            if (!data || data.length === 0) {
                alert('Nenhum participante elegível encontrado.');
                return;
            }

            const participants = data.map((p: any) => ({
                id: p.id,
                full_name: p.full_name,
                email: p.users?.email || ''
            }));

            // Simulate didactic countdown (animated reveal)
            setIsDrawingAnimated(true);
            const duration = 3500;
            const interval = 80;
            let shuffleInterval = setInterval(() => {
                const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
                setCurrentDrawName(randomParticipant.full_name);
            }, interval);

            await new Promise(resolve => setTimeout(resolve, duration));
            clearInterval(shuffleInterval);
            setIsDrawingAnimated(false);

            // Random winner selection
            const winner = participants[Math.floor(Math.random() * participants.length)];

            // Save winner to DB
            const { error } = await supabase
                .from('giveaways')
                .update({ winner_id: winner.id, status: 'completed' })
                .eq('id', giveaway.id);

            if (error) throw error;

            setDrawResult({ giveaway, winner });
            fetchGiveaways();
        } catch (err: any) {
            console.error('Draw error:', err);
            alert('Erro ao realizar sorteio: ' + err.message);
            setIsDrawingAnimated(false);
        } finally {
            setDrawingId(null);
        }
    };

    const handleSave = async () => {
        try {
            if (!form.title || !form.prize_description || !form.start_date || !form.end_date || !form.draw_date) {
                alert('Por favor, preencha todos os campos obrigatórios e datas.');
                return;
            }

            setSaving(true);

            const payload = {
                title: form.title,
                description: form.description || null,
                prize_description: form.prize_description,
                prize_value: form.prize_value || 0,
                start_date: form.start_date,
                end_date: form.end_date,
                draw_date: form.draw_date,
                image_url: form.image_url || null,
                status: form.status || 'upcoming',
                winner_id: form.winner_id || null
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('giveaways')
                    .update(payload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('giveaways')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            setIsModalOpen(false);
            setEditingId(null);
            setForm({});
            fetchGiveaways();
        } catch (error: any) {
            console.error('Error saving giveaway:', error);
            alert('Erro ao salvar sorteio: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este sorteio?')) return;
        try {
            const { error } = await supabase.from('giveaways').delete().eq('id', id);
            if (error) throw error;
            fetchGiveaways();
        } catch (error) {
            console.error('Error deleting giveaway:', error);
            alert('Erro ao excluir sorteio');
        }
    };

    const handleEdit = (giveaway: Giveaway) => {
        setEditingId(giveaway.id);
        setForm({
            ...giveaway,
            start_date: new Date(giveaway.start_date).toISOString().slice(0, 16),
            end_date: new Date(giveaway.end_date).toISOString().slice(0, 16),
            draw_date: new Date(giveaway.draw_date).toISOString().slice(0, 16),
        });
        fetchPotentialWinners();
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setForm({ status: 'upcoming' });
        fetchPotentialWinners();
        setIsModalOpen(true);
    };

    const filteredGiveaways = giveaways.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestão de Sorteios</h1>
                    <p className="text-gray-500">Administre sorteios e campanhas de engajamento.</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">celebration</span>
                    Novo Sorteio
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input 
                            type="text" 
                            placeholder="Buscar sorteios..." 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">Carregando sorteios...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                            <tr>
                                <th className="p-4">Sorteio</th>
                                <th className="p-4">Prêmio</th>
                                <th className="p-4">Datas</th>
                                <th className="p-4">Status / Ganhador</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredGiveaways.map(giveaway => (
                                <tr key={giveaway.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                                {giveaway.image_url ? (
                                                    <img src={giveaway.image_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        <span className="material-symbols-outlined">image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-900">{giveaway.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div>{giveaway.prize_description}</div>
                                        <div className="text-xs text-gray-400">R$ {giveaway.prize_value.toFixed(2)}</div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">
                                        <div>Início: {new Date(giveaway.start_date).toLocaleDateString()}</div>
                                        <div>Fim: {new Date(giveaway.end_date).toLocaleDateString()}</div>
                                        <div className="font-bold text-gray-600">Sorteio: {new Date(giveaway.draw_date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold w-fit ${
                                                giveaway.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                giveaway.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {giveaway.status === 'completed' ? 'Concluído' :
                                                 giveaway.status === 'active' ? 'Ativo' : 'Em Breve'}
                                            </span>
                                            {giveaway.winner && (
                                                <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm text-yellow-500">emoji_events</span>
                                                    {giveaway.winner.full_name}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {giveaway.status === 'active' && !giveaway.winner_id && (
                                            <button
                                                onClick={() => handleDraw(giveaway)}
                                                disabled={drawingId === giveaway.id}
                                                className="text-yellow-500 hover:text-yellow-600 mr-2 p-1 rounded hover:bg-yellow-50 transition-colors disabled:opacity-50"
                                                title="Realizar Sorteio"
                                            >
                                                {drawingId === giveaway.id
                                                    ? <span className="material-symbols-outlined animate-spin">refresh</span>
                                                    : <span className="material-symbols-outlined">celebration</span>
                                                }
                                            </button>
                                        )}
                                        <button onClick={() => handleEdit(giveaway)} className="text-gray-400 hover:text-primary mr-2 p-1 rounded hover:bg-gray-100 transition-colors">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(giveaway.id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100 transition-colors">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredGiveaways.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum sorteio encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* LOG-08: Didactic draw result modal */}
            {drawResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    {/* Confetti simulation using CSS */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <div 
                                key={i} 
                                className="absolute w-3 h-3 rounded-sm opacity-80 animate-[fall_3s_linear_infinite]"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `-${Math.random() * 20}%`,
                                    backgroundColor: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 5)],
                                    animationDelay: `${Math.random() * 3}s`,
                                    transform: `rotate(${Math.random() * 360}deg)`
                                }}
                            />
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg text-center p-10 animate-in zoom-in-90 duration-500 relative overflow-hidden border-4 border-yellow-400">
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-yellow-50 to-transparent"></div>
                        
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10 border-4 border-white">
                            <span className="material-symbols-outlined text-6xl text-white">emoji_events</span>
                        </div>
                        
                        <div className="relative z-10">
                            <p className="text-sm font-black text-yellow-600 uppercase tracking-widest mb-3 animate-[pulse_2s_ease-in-out_infinite]">🎉 Novo Ganhador! 🎉</p>
                            <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{drawResult.giveaway.title}</h2>
                            <p className="text-gray-500 mb-8 font-medium">Prêmio: <span className="text-gray-800 font-bold">{drawResult.giveaway.prize_description}</span></p>
                            
                            <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-8 mb-8 relative transform hover:scale-105 transition-transform">
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
                                    Vencedor Sorteado
                                </span>
                                <p className="text-3xl font-black text-primary mb-2 mt-2">{drawResult.winner.full_name}</p>
                                <p className="text-gray-500 font-medium">{drawResult.winner.email}</p>
                            </div>
                            
                            <button
                                onClick={() => setDrawResult(null)}
                                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-900/20 text-lg"
                            >
                                Uhuuuuuul! 🥳
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LOG-08: Didactic drawing animation modal */}
            {isDrawingAnimated && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-indigo-900/90 backdrop-blur-xl p-4 overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,transparent_20%,#312e81_100%)]"></div>
                    </div>

                    <div className="relative z-10 text-center animate-in slide-in-from-bottom-10 fade-in duration-700">
                        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(255,255,255,0.3)] relative">
                            <div className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-200 animate-[spin_4s_linear_infinite]"></div>
                            <span className="material-symbols-outlined text-6xl text-indigo-600 animate-[bounce_1s_ease-in-out_infinite]">casino</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black text-white px-4 mb-3 drop-shadow-lg [text-shadow:0_4px_20px_rgba(255,255,255,0.3)]">
                            Sorteando Vencedor!
                        </h2>
                        <p className="text-indigo-200 text-lg md:text-xl font-medium mb-12 tracking-wide uppercase">Cruzando os dedos...</p>
                        
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 w-full max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                            <p className="text-4xl md:text-6xl font-black text-white truncate transition-all duration-75 text-center drop-shadow-md">
                                {currentDrawName || "..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingId ? 'Editar Sorteio' : 'Novo Sorteio'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <MediaUploader 
                                bucket="giveaway-images"
                                label="Imagem Promocional"
                                currentUrl={form.image_url || ''}
                                onUpload={(url) => setForm({...form, image_url: url})}
                            />

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Sorteio *</label>
                                    <input 
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={form.title || ''}
                                        onChange={e => setForm({...form, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <textarea 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                                        value={form.description || ''}
                                        onChange={e => setForm({...form, description: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prêmio *</label>
                                    <input 
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={form.prize_description || ''}
                                        onChange={e => setForm({...form, prize_description: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Prêmio (R$)</label>
                                    <input 
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={form.prize_value || ''}
                                        onChange={e => setForm({...form, prize_value: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                                    <input 
                                        type="datetime-local"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-xs"
                                        value={form.start_date || ''}
                                        onChange={e => setForm({...form, start_date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                                    <input 
                                        type="datetime-local"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-xs"
                                        value={form.end_date || ''}
                                        onChange={e => setForm({...form, end_date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data do Sorteio</label>
                                    <input 
                                        type="datetime-local"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-xs"
                                        value={form.draw_date || ''}
                                        onChange={e => setForm({...form, draw_date: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                        value={form.status || 'upcoming'}
                                        onChange={e => setForm({...form, status: e.target.value as any})}
                                    >
                                        <option value="upcoming">Em Breve</option>
                                        <option value="active">Ativo</option>
                                        <option value="completed">Concluído</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : 'Salvar Sorteio'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GiveawayManagement;
