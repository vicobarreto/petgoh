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
    city: string | null;
    state: string | null;
    status: 'active' | 'pending' | 'rejected';
    logo_url: string | null;
    custom_commission_rate: number | null;
    created_at: string;
}

interface PartnerServiceAdmin {
    id: string;
    name: string;
    category: string;
    price: number;
    duration_minutes: number | null;
    is_active: boolean;
    moderation_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    partner_id: string;
    partners: { company_name: string } | null;
}

const PartnerManagement: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'partners' | 'services'>('partners');
    const [partnerServices, setPartnerServices] = useState<PartnerServiceAdmin[]>([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [filterPartner, setFilterPartner] = useState('');

    // Form states
    const [formData, setFormData] = useState<Partial<Partner>>({});

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPartners(data || []);
        } catch (error) {
            console.error('Error fetching partners:', error);
            alert('Erro ao carregar parceiros.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!formData.company_name) return alert('Nome da empresa é obrigatório');

            const payload = {
                company_name: formData.company_name,
                category: formData.category,
                email: formData.email,
                phone: formData.phone,
                cnpj: formData.cnpj,
                city: formData.city,
                state: formData.state,
                status: formData.status || 'pending',
                logo_url: formData.logo_url,
                custom_commission_rate: formData.custom_commission_rate
            };

            let error;
            if (editingPartner?.id) {
                const { error: updateError } = await supabase
                    .from('partners')
                    .update(payload)
                    .eq('id', editingPartner.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('partners')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            setIsModalOpen(false);
            setEditingPartner(null);
            setFormData({});
            fetchPartners();
        } catch (error) {
            console.error('Error saving partner:', error);
            alert('Erro ao salvar parceiro.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este parceiro?')) return;
        try {
            const { error } = await supabase.from('partners').delete().eq('id', id);
            if (error) throw error;
            fetchPartners();
        } catch (error) {
            console.error('Error deleting partner:', error);
            alert('Erro ao deletar parceiro.');
        }
    };

    const handleEdit = (partner: Partner) => {
        setEditingPartner(partner);
        setFormData(partner);
        setIsModalOpen(true);
    };

    const handleApprove = async (partner: Partner) => {
        try {
            const { error } = await supabase
                .from('partners')
                .update({ status: 'active' })
                .eq('id', partner.id);
            if (error) throw error;
            fetchPartners();
        } catch (error) {
            console.error('Error approving partner:', error);
            alert('Erro ao aprovar parceiro.');
        }
    };

    const filteredPartners = partners.filter(p => 
        p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchPartnerServices = async () => {
        setServicesLoading(true);
        const { data, error } = await supabase
            .from('partner_services')
            .select('*, partners(company_name)')
            .order('created_at', { ascending: false });
        if (!error) setPartnerServices(data || []);
        setServicesLoading(false);
    };

    const handleModerate = async (serviceId: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('partner_services')
            .update({ moderation_status: status, updated_at: new Date().toISOString() })
            .eq('id', serviceId);
        if (error) {
            alert('Erro ao moderar serviço: ' + error.message);
        } else {
            fetchPartnerServices();
        }
    };

    const filteredServices = partnerServices.filter(s => {
        const matchesPartner = !filterPartner || s.partner_id === filterPartner;
        const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesPartner && matchesSearch;
    });

    useEffect(() => {
        if (activeTab === 'services') fetchPartnerServices();
    }, [activeTab]);

    return (
        <div className="p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-black text-secondary tracking-tight">Gestão de Parceiros</h2>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {partners.length} Total
                        </span>
                    </div>
                    <p className="text-secondary/60">Gerencie parceiros e moderação de serviços.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
                <button
                    onClick={() => setActiveTab('partners')}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'partners' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Parceiros
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'services' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Serviços dos Parceiros
                </button>
            </div>

            {activeTab === 'partners' ? (
            <>
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input 
                            type="text" 
                            placeholder="Buscar parceiros..." 
                            className="pl-10 pr-4 py-2.5 border border-secondary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => {
                            setEditingPartner(null);
                            setFormData({ status: 'pending' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-white hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Novo Parceiro
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Carregando parceiros...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-secondary/10 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-secondary/10">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary/50">Empresa</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary/50">Categoria</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary/50">Contato</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary/50">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary/50 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary/10">
                                {filteredPartners.map(partner => (
                                    <tr key={partner.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                                                    {partner.logo_url ? (
                                                        <img src={partner.logo_url} alt={partner.company_name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-gray-400">store</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-secondary block text-sm">{partner.company_name}</span>
                                                    <span className="text-xs text-secondary/50">CNPJ: {partner.cnpj || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-secondary/70">{partner.category || '-'}</td>
                                        <td className="px-6 py-5 text-sm text-secondary/60">
                                            <div className="flex flex-col">
                                                <span>{partner.email}</span>
                                                <span className="text-xs">{partner.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                                                partner.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                                                partner.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${
                                                    partner.status === 'active' ? 'bg-emerald-600' :
                                                    partner.status === 'rejected' ? 'bg-red-600' :
                                                    'bg-amber-600'
                                                }`}></span>
                                                {partner.status === 'active' ? 'Ativo' : partner.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(partner)}
                                                    className="p-2 text-secondary/70 hover:bg-secondary/5 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                {partner.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleApprove(partner)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Aprovar"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(partner.id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPartners.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-secondary/50">
                                            Nenhum parceiro encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-secondary">
                                {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <MediaUploader 
                                bucket="partner-logos"
                                label="Logotipo da Empresa"
                                currentUrl={formData.logo_url || ''}
                                onUpload={(url) => setFormData({...formData, logo_url: url})}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nome da Empresa *</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.company_name || ''}
                                        onChange={e => setFormData({...formData, company_name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Categoria</label>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                        value={formData.category || ''}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Veterinário">Veterinário</option>
                                        <option value="Hotel">Hotel</option>
                                        <option value="Pet Shop">Pet Shop</option>
                                        <option value="Creche">Creche</option>
                                        <option value="Banho e Tosa">Banho e Tosa</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">CNPJ</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.cnpj || ''}
                                        onChange={e => setFormData({...formData, cnpj: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Taxa de Comissão (%)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.custom_commission_rate || ''}
                                        onChange={e => setFormData({...formData, custom_commission_rate: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Telefone</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.phone || ''}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Cidade</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.city || ''}
                                        onChange={e => setFormData({...formData, city: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Estado (UF)</label>
                                    <input 
                                        type="text" 
                                        maxLength={2}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                                        value={formData.state || ''}
                                        onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                        value={formData.status || 'pending'}
                                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                                    >
                                        <option value="pending">Pendente</option>
                                        <option value="active">Ativo</option>
                                        <option value="rejected">Rejeitado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-slate-50/50">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                            >
                                {editingPartner ? 'Salvar Alterações' : 'Criar Parceiro'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </>
            ) : (
            <div>
                {/* Filter bar */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar serviços..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        />
                    </div>
                    <select
                        value={filterPartner}
                        onChange={(e) => setFilterPartner(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="">Todos os Parceiros</option>
                        {partners.map(p => <option key={p.id} value={p.id}>{p.company_name}</option>)}
                    </select>
                </div>

                {servicesLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
                        <p className="text-gray-600 font-semibold">Nenhum serviço encontrado</p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th className="px-6 py-4">Parceiro</th>
                                        <th className="px-6 py-4">Serviço</th>
                                        <th className="px-6 py-4">Categoria</th>
                                        <th className="px-6 py-4 text-right">Preço</th>
                                        <th className="px-6 py-4 text-center">Moderação</th>
                                        <th className="px-6 py-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredServices.map((svc) => (
                                        <tr key={svc.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {svc.partners?.company_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{svc.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                                                    {svc.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold">R$ {Number(svc.price).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    svc.moderation_status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                                    svc.moderation_status === 'rejected' ? 'bg-red-50 text-red-700' :
                                                    'bg-amber-50 text-amber-700'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full bg-current ${svc.moderation_status === 'pending' ? 'animate-pulse' : ''}`}></span>
                                                    {svc.moderation_status === 'approved' ? 'Aprovado' : svc.moderation_status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {svc.moderation_status !== 'approved' && (
                                                        <button
                                                            onClick={() => handleModerate(svc.id, 'approved')}
                                                            className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                                                            title="Aprovar"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                        </button>
                                                    )}
                                                    {svc.moderation_status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleModerate(svc.id, 'rejected')}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Rejeitar"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

export default PartnerManagement;
