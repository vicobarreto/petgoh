import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    usage_limit: number | null;
    usage_count: number;
    valid_from: string | null;
    valid_until: string | null;
    is_active: boolean;
}

const PromotionManagement: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<Partial<Coupon>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchCoupons(); }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (!error) setCoupons(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!form.code || !form.discount_value) {
            alert('Código e valor do desconto são obrigatórios');
            return;
        }
        setSaving(true);
        try {
            const payload: any = {
                code: form.code.toUpperCase(),
                discount_type: form.discount_type || 'percentage',
                discount_value: form.discount_value,
                valid_from: form.valid_from || null,
                valid_until: form.valid_until || null,
                usage_limit: form.usage_limit || null,
                is_active: form.is_active ?? true,
            };

            if (editingId) {
                const { error } = await supabase.from('coupons').update(payload).eq('id', editingId);
                if (error) throw error;
            } else {
                // INSERT without sending 'id' — let DB generate it
                const { error } = await supabase.from('coupons').insert([payload]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditingId(null);
            setForm({});
            fetchCoupons();
        } catch (error: any) {
            console.error('Error saving coupon:', error);
            alert('Erro ao salvar cupom: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cupom?')) return;
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (!error) fetchCoupons();
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingId(coupon.id);
        setForm({
            ...coupon,
            valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : undefined,
            valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : undefined,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setForm({ discount_type: 'percentage', is_active: true });
        setIsModalOpen(true);
    };

    const filtered = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">Gestão de Promoções</h1>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{coupons.length} Total</span>
                    </div>
                    <p className="text-gray-500 text-sm">Crie e gerencie cupons de desconto e ofertas especiais.</p>
                </div>
                <button onClick={handleCreate} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Nova Promoção
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-sm">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                        <input type="text" placeholder="Buscar por código..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {loading ? (
                    <div className="p-16 text-center text-gray-400">Carregando promoções...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">local_offer</span>
                        <p className="text-gray-500">Nenhum cupom encontrado.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400 tracking-wider">
                            <tr>
                                <th className="p-4">Código</th>
                                <th className="p-4">Desconto</th>
                                <th className="p-4">Uso</th>
                                <th className="p-4">Validade</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-mono font-bold text-gray-900">{c.code}</td>
                                    <td className="p-4 font-bold text-primary">
                                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `R$ ${Number(c.discount_value).toFixed(2)}`}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{c.usage_count} / {c.usage_limit || '∞'}</td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {c.valid_until ? new Date(c.valid_until).toLocaleDateString('pt-BR') : 'Indeterminado'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-green-600' : 'bg-red-600'}`} />
                                            {c.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleEdit(c)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Promoção' : 'Nova Promoção'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código do Cupom *</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase font-mono" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="EX: BLACKFRIDAY" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Desconto</label>
                                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white" value={form.discount_type || 'percentage'} onChange={e => setForm({ ...form, discount_type: e.target.value as any })}>
                                        <option value="percentage">Porcentagem (%)</option>
                                        <option value="fixed">Valor Fixo (R$)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                                    <input type="number" min="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" value={form.discount_value || ''} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Válido de</label>
                                    <input type="datetime-local" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm" value={form.valid_from || ''} onChange={e => setForm({ ...form, valid_from: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Válido até</label>
                                    <input type="datetime-local" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm" value={form.valid_until || ''} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Uso</label>
                                    <input type="number" min="0" placeholder="Vazio = Ilimitado" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" value={form.usage_limit || ''} onChange={e => setForm({ ...form, usage_limit: parseInt(e.target.value) || null })} />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" checked={form.is_active ?? true} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                        <span className="text-sm font-medium text-gray-700">Ativo</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-orange-600 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2">
                                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : 'Salvar Promoção'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionManagement;
