import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface BeautyService {
    id: string;
    name: string;
    description: string | null;
    price: number;
    is_active: boolean;
    created_at: string;
}

const BeautyServiceManagement: React.FC = () => {
    const [services, setServices] = useState<BeautyService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<BeautyService | null>(null);
    const [form, setForm] = useState<Partial<BeautyService>>({});
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('beauty_services')
            .select('*')
            .order('created_at', { ascending: false });
        setServices(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!form.name) {
            alert('Nome do serviço é obrigatório');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description || null,
                price: form.price || 0,
                is_active: form.is_active ?? true,
            };

            if (editing?.id) {
                const { error } = await supabase.from('beauty_services').update(payload).eq('id', editing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('beauty_services').insert([payload]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditing(null);
            setForm({});
            fetchServices();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        await supabase.from('beauty_services').delete().eq('id', id);
        fetchServices();
    };

    const handleEdit = (s: BeautyService) => {
        setEditing(s);
        setForm(s);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditing(null);
        setForm({ is_active: true, price: 0 });
        setIsModalOpen(true);
    };

    const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="material-symbols-outlined text-2xl text-primary">spa</span>
                        <h1 className="text-2xl font-bold text-gray-900">Serviços de Estética</h1>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{services.length}</span>
                    </div>
                    <p className="text-gray-500 text-sm">Cadastre serviços de banho, tosa, hidratação e outros cuidados estéticos.</p>
                </div>
                <button onClick={handleCreate} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Novo Serviço
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                    <input type="text" placeholder="Buscar serviço..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">Carregando...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">spa</span>
                    <p className="text-gray-500 font-medium">Nenhum serviço de estética cadastrado.</p>
                    <p className="text-gray-400 text-sm mt-1">Clique em "Novo Serviço" para começar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(s => (
                        <div key={s.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden ${!s.is_active ? 'opacity-60' : ''}`}>
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                            <span className="material-symbols-outlined text-primary text-lg">spa</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{s.name}</h3>
                                            <span className={`text-xs font-bold ${s.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                                {s.is_active ? '● Ativo' : '● Inativo'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">R$ {Number(s.price).toFixed(2)}</span>
                                </div>
                                {s.description && <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>}
                            </div>
                            <div className="border-t border-gray-50 px-5 py-3 flex justify-end gap-1 bg-gray-50/50">
                                <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-xl font-bold text-gray-900">{editing ? 'Editar Serviço' : 'Novo Serviço de Estética'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço *</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Banho Completo, Tosa Higiênica..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detalhes sobre o serviço..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                                    <input type="number" min="0" step="0.01" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20" value={form.price || ''} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" checked={form.is_active ?? true} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                        <span className="text-sm font-medium text-gray-700">Ativo</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl flex-shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-orange-600 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2">
                                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (editing ? 'Salvar Alterações' : 'Cadastrar Serviço')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BeautyServiceManagement;
