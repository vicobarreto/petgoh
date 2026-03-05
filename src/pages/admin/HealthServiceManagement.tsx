import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface HealthService {
    id: string;
    name: string;
    category: string;
    description: string | null;
    price: number;
    is_active: boolean;
    created_at: string;
}

const HEALTH_CATEGORIES = [
    { value: 'summary', label: 'Sumário / Check-up', icon: 'fact_check', color: 'bg-orange-50 text-orange-700' },
    { value: 'hemogram', label: 'Hemograma', icon: 'bloodtype', color: 'bg-red-50 text-red-700' },
    { value: 'biochemistry', label: 'Bioquímico', icon: 'science', color: 'bg-indigo-50 text-indigo-700' },
    { value: 'cardio', label: 'Cardiológico', icon: 'cardiology', color: 'bg-pink-50 text-pink-700' },
    { value: 'image', label: 'Imagem (Raio-X / Ultrassom)', icon: 'radiology', color: 'bg-cyan-50 text-cyan-700' },
];

const HealthServiceManagement: React.FC = () => {
    const [services, setServices] = useState<HealthService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<HealthService | null>(null);
    const [form, setForm] = useState<Partial<HealthService>>({});
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('health_services')
            .select('*')
            .order('created_at', { ascending: false });
        setServices(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!form.name || !form.category) {
            alert('Nome e categoria são obrigatórios');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                category: form.category,
                description: form.description || null,
                price: form.price || 0,
                is_active: form.is_active ?? true,
            };

            if (editing?.id) {
                const { error } = await supabase.from('health_services').update(payload).eq('id', editing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('health_services').insert([payload]);
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
        await supabase.from('health_services').delete().eq('id', id);
        fetchServices();
    };

    const handleEdit = (s: HealthService) => {
        setEditing(s);
        setForm(s);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditing(null);
        setForm({ category: 'summary', is_active: true, price: 0 });
        setIsModalOpen(true);
    };

    const getCatInfo = (cat: string) => HEALTH_CATEGORIES.find(c => c.value === cat) || HEALTH_CATEGORIES[0];

    const filtered = services.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = !filterCat || s.category === filterCat;
        return matchSearch && matchCat;
    });

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="material-symbols-outlined text-2xl text-primary">medical_information</span>
                        <h1 className="text-2xl font-bold text-gray-900">Serviços de Saúde</h1>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{services.length}</span>
                    </div>
                    <p className="text-gray-500 text-sm">Cadastre exames, procedimentos e check-ups veterinários.</p>
                </div>
                <button onClick={handleCreate} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Novo Serviço
                </button>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setFilterCat('')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!filterCat ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Todos
                </button>
                {HEALTH_CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setFilterCat(cat.value)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${filterCat === cat.value ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
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
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">medical_information</span>
                    <p className="text-gray-500 font-medium">Nenhum serviço de saúde cadastrado.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400 tracking-wider">
                            <tr>
                                <th className="p-4">Serviço</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Preço</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(s => {
                                const catInfo = getCatInfo(s.category);
                                return (
                                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900">{s.name}</p>
                                            {s.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.description}</p>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${catInfo.color}`}>
                                                <span className="material-symbols-outlined text-sm">{catInfo.icon}</span>
                                                {catInfo.label}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">R$ {Number(s.price).toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {s.is_active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-xl font-bold text-gray-900">{editing ? 'Editar Serviço' : 'Novo Serviço de Saúde'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço *</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Hemograma Completo" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {HEALTH_CATEGORIES.map(cat => (
                                        <button key={cat.value} type="button" onClick={() => setForm({ ...form, category: cat.value })}
                                            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm ${form.category === cat.value ? 'border-primary bg-primary/10' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <span className={`material-symbols-outlined text-lg ${form.category === cat.value ? 'text-primary' : 'text-gray-400'}`}>{cat.icon}</span>
                                            <span className={`font-medium ${form.category === cat.value ? 'text-primary' : 'text-gray-600'}`}>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detalhes opcionais sobre o exame..." />
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

export default HealthServiceManagement;
