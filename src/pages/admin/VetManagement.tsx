import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import MediaUploader from '../../components/admin/MediaUploader';

interface Partner {
    id: string;
    company_name: string;
    category: string | null;
    email: string | null;
    phone: string | null;
    cnpj: string | null;
    status: 'active' | 'pending' | 'rejected';
    logo_url: string | null;
    custom_commission_rate: number | null;
    rating: number;
    created_at: string;
}

const VetManagement: React.FC = () => {
    const [vets, setVets] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Partner | null>(null);
    const [form, setForm] = useState<Partial<Partner>>({});
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchVets(); }, []);

    const fetchVets = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('partners')
            .select('*')
            .eq('category', 'Veterinário')
            .order('created_at', { ascending: false });
        setVets(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!form.company_name) return alert('Nome da clínica é obrigatório');
        setSaving(true);
        try {
            const payload = {
                company_name: form.company_name,
                category: 'Veterinário',
                email: form.email || null,
                phone: form.phone || null,
                cnpj: form.cnpj || null,
                status: form.status || 'active',
                logo_url: form.logo_url || null,
                custom_commission_rate: form.custom_commission_rate || null,
            };

            if (editing?.id) {
                const { error } = await supabase.from('partners').update(payload).eq('id', editing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('partners').insert([payload]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditing(null);
            setForm({});
            fetchVets();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este veterinário?')) return;
        await supabase.from('partners').delete().eq('id', id);
        fetchVets();
    };

    const handleEdit = (vet: Partner) => {
        setEditing(vet);
        setForm(vet);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditing(null);
        setForm({ category: 'Veterinário', status: 'active' });
        setIsModalOpen(true);
    };

    const filtered = vets.filter(v =>
        v.company_name.toLowerCase().includes(search.toLowerCase()) ||
        v.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="material-symbols-outlined text-2xl text-blue-600">stethoscope</span>
                        <h1 className="text-2xl font-bold text-gray-900">Cadastro de Veterinários</h1>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{vets.length}</span>
                    </div>
                    <p className="text-gray-500 text-sm">Gerencie clínicas e profissionais veterinários parceiros.</p>
                </div>
                <button onClick={handleCreate} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Novo Veterinário
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                    <input type="text" placeholder="Buscar veterinário..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">Carregando...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">stethoscope</span>
                    <p className="text-gray-500 font-medium">Nenhum veterinário cadastrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(vet => (
                        <div key={vet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden shrink-0">
                                    {vet.logo_url ? (
                                        <img src={vet.logo_url} alt={vet.company_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-blue-400 text-2xl">stethoscope</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{vet.company_name}</h3>
                                    <p className="text-sm text-gray-500 truncate">{vet.email || 'Sem email'}</p>
                                    <p className="text-xs text-gray-400">{vet.phone || 'Sem telefone'}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${vet.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {vet.status === 'active' ? 'Ativo' : 'Pendente'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                <span className="text-xs text-gray-400">CNPJ: {vet.cnpj || 'N/A'}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(vet)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(vet.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-900">{editing ? 'Editar Veterinário' : 'Novo Veterinário'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <MediaUploader bucket="partner-logos" label="Logo da Clínica" currentUrl={form.logo_url || ''} onUpload={(url) => setForm({ ...form, logo_url: url })} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Clínica / Veterinário *</label>
                                    <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none" value={form.company_name || ''} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                                    <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" value={form.cnpj || ''} onChange={e => setForm({ ...form, cnpj: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
                                    <input type="number" min="0" max="100" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" value={form.custom_commission_rate || ''} onChange={e => setForm({ ...form, custom_commission_rate: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                    <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-100" value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                                        <option value="active">Ativo</option>
                                        <option value="pending">Pendente</option>
                                        <option value="rejected">Rejeitado</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center gap-2">
                                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (editing ? 'Salvar Alterações' : 'Cadastrar Veterinário')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VetManagement;
