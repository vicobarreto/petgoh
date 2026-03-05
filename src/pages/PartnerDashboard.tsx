import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface PartnerService {
    id: string;
    name: string;
    description: string | null;
    category: string;
    price: number;
    duration_minutes: number | null;
    is_active: boolean;
    moderation_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface PartnerInfo {
    id: string;
    company_name: string;
    category: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
}

const CATEGORIES = ['Banho', 'Tosa', 'Hospedagem', 'Creche', 'Passeio', 'Consulta', 'Vacina', 'Exame', 'Cirurgia', 'Outro'];

const PartnerDashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const [activeView, setActiveView] = useState<'services' | 'finance' | 'settings'>('services');
    const [services, setServices] = useState<PartnerService[]>([]);
    const [partner, setPartner] = useState<PartnerInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<PartnerService | null>(null);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: 'Banho',
        price: '',
        duration_minutes: '',
        is_active: true
    });

    useEffect(() => {
        if (user?.id) {
            fetchPartnerInfo();
        }
    }, [user]);

    useEffect(() => {
        if (partner?.id) {
            fetchServices();
        }
    }, [partner]);

    const fetchPartnerInfo = async () => {
        const { data, error } = await supabase
            .from('partners')
            .select('id, company_name, category, address, city, state, zip_code')
            .eq('user_id', user!.id)
            .single();

        if (error) {
            console.error('Erro ao buscar parceiro:', error);
            setLoading(false);
            return;
        }
        setPartner(data);
    };

    const fetchServices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('partner_services')
            .select('*')
            .eq('partner_id', partner!.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar serviços:', error);
        } else {
            setServices(data || []);
        }
        setLoading(false);
    };

    const openCreateModal = () => {
        setEditingService(null);
        setForm({ name: '', description: '', category: 'Banho', price: '', duration_minutes: '', is_active: true });
        setShowModal(true);
    };

    const openEditModal = (service: PartnerService) => {
        setEditingService(service);
        setForm({
            name: service.name,
            description: service.description || '',
            category: service.category,
            price: String(service.price),
            duration_minutes: service.duration_minutes ? String(service.duration_minutes) : '',
            is_active: service.is_active
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.category || !form.price) return;
        setSaving(true);

        const payload = {
            partner_id: partner!.id,
            created_by: user!.id,
            name: form.name.trim(),
            description: form.description.trim() || null,
            category: form.category,
            price: parseFloat(form.price),
            duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
            is_active: form.is_active
        };

        let error;
        if (editingService) {
            const { error: err } = await supabase
                .from('partner_services')
                .update({ ...payload, updated_at: new Date().toISOString() })
                .eq('id', editingService.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('partner_services')
                .insert(payload);
            error = err;
        }

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            setShowModal(false);
            fetchServices();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        const { error } = await supabase.from('partner_services').delete().eq('id', id);
        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchServices();
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusBadge = (status: string) => {
        const map: Record<string, { bg: string; text: string; label: string }> = {
            approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Aprovado' },
            pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pendente' },
            rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejeitado' }
        };
        const s = map[status] || map.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'pending' ? 'animate-pulse' : ''}`}></span>
                {s.label}
            </span>
        );
    };

    return (
        <div className="flex min-h-screen w-full font-display bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col mt-[68px]">
                <div className="flex h-full flex-col justify-between p-6">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-slate-900 text-lg font-bold leading-tight">{partner?.company_name || 'Parceiro'}</h1>
                                <p className="text-slate-500 text-sm font-medium">Área do Parceiro</p>
                            </div>
                        </div>
                        <nav className="flex flex-col gap-1">
                            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-xl">home</span>
                                Voltar ao Site
                            </Link>
                            <button
                                onClick={() => setActiveView('services')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full text-sm font-medium ${activeView === 'services' ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <span className="material-symbols-outlined text-xl">inventory_2</span>
                                Meus Serviços
                            </button>
                            <button
                                onClick={() => setActiveView('finance')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full text-sm font-medium ${activeView === 'finance' ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                                Financeiro
                            </button>
                            <button
                                onClick={() => setActiveView('settings')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full text-sm font-medium ${activeView === 'settings' ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <span className="material-symbols-outlined text-xl">settings</span>
                                Configuração
                            </button>
                        </nav>
                    </div>
                    <div className="border-t border-slate-100 pt-6">
                        <button onClick={signOut} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-xl">logout</span>
                            Sair da conta
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-72 w-full flex flex-col min-h-screen">
                <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">

                    {activeView === 'services' ? (
                        <>
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                                <div>
                                    <nav className="flex items-center text-xs text-slate-400 mb-1">
                                        <span>Parceiro</span>
                                        <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                                        <span className="text-primary font-medium">Meus Serviços</span>
                                    </nav>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Catálogo de Serviços</h2>
                                    <p className="text-slate-500 text-sm mt-1">Gerencie os serviços oferecidos pela sua empresa.</p>
                                </div>
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-white font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    Novo Serviço
                                </button>
                            </div>

                            {/* Search */}
                            <div className="mb-6">
                                <div className="relative max-w-md">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar serviços..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                                </div>
                            ) : filteredServices.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">inventory_2</span>
                                    <p className="text-slate-600 font-semibold text-lg">Nenhum serviço cadastrado</p>
                                    <p className="text-slate-400 text-sm mt-1">Clique em "Novo Serviço" para começar.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                                    <th className="px-6 py-4">Serviço</th>
                                                    <th className="px-6 py-4">Categoria</th>
                                                    <th className="px-6 py-4 text-right">Preço</th>
                                                    <th className="px-6 py-4 text-center">Duração</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                    <th className="px-6 py-4 text-center">Moderação</th>
                                                    <th className="px-6 py-4 text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-sm">
                                                {filteredServices.map((service) => (
                                                    <tr key={service.id} className="group hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-slate-900">{service.name}</span>
                                                                {service.description && (
                                                                    <span className="text-xs text-slate-400 truncate max-w-[200px]">{service.description}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                                                                {service.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                                            R$ {Number(service.price).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-slate-500">
                                                            {service.duration_minutes ? `${service.duration_minutes} min` : '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${service.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                {service.is_active ? 'Ativo' : 'Inativo'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {statusBadge(service.moderation_status)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => openEditModal(service)}
                                                                    className="p-2 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                                                                    title="Editar"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(service.id)}
                                                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                                    title="Excluir"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : activeView === 'settings' ? (
                         // Settings Tab
                        <div className="max-w-2xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configurações do Perfil</h2>
                                <p className="text-slate-500 text-sm mt-1">Atualize as informações do seu negócio.</p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Nome da Loja / Empresa</label>
                                        <input
                                            type="text"
                                            value={partner?.company_name || ''}
                                            onChange={(e) => setPartner(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                            placeholder="Nome da sua loja"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                         <label className="text-sm font-medium text-slate-700">Categoria Principal</label>
                                         <select
                                            value={partner?.category || ''}
                                            onChange={(e) => setPartner(prev => prev ? { ...prev, category: e.target.value } : null)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
                                         >
                                            <option value="">Selecione uma categoria</option>
                                            <option value="Hotel">Hotel / Hospedagem</option>
                                            <option value="Pet Shop">Pet Shop</option>
                                            <option value="Creche">Creche</option>
                                            <option value="Banho e Tosa">Banho e Tosa</option>
                                            <option value="Adestramento">Adestramento</option>
                                            <option value="Passeador">Passeador</option>
                                            <option value="Veterinário">Veterinário</option>
                                            <option value="Outros">Outros</option>
                                         </select>
                                    </div>

                                    <div className="border-t border-slate-100 pt-4 mt-6">
                                        <h4 className="text-sm font-bold text-slate-900 mb-4">Endereço e Localização</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700">Endereço Completo</label>
                                                <input
                                                    type="text"
                                                    value={partner?.address || ''}
                                                    onChange={(e) => setPartner(prev => prev ? { ...prev, address: e.target.value } : null)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                                    placeholder="Rua, Número, Bairro"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-slate-700">Cidade</label>
                                                    <input
                                                        type="text"
                                                        value={partner?.city || ''}
                                                        onChange={(e) => setPartner(prev => prev ? { ...prev, city: e.target.value } : null)}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                                        placeholder="Cidade"
                                                    />
                                                </div>
                                                 <div className="space-y-1">
                                                    <label className="text-sm font-medium text-slate-700">Estado (UF)</label>
                                                    <input
                                                        type="text"
                                                        maxLength={2}
                                                        value={partner?.state || ''}
                                                        onChange={(e) => setPartner(prev => prev ? { ...prev, state: e.target.value.toUpperCase() } : null)}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                                        placeholder="UF"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700">CEP</label>
                                                <input
                                                    type="text"
                                                    value={partner?.zip_code || ''}
                                                    onChange={(e) => setPartner(prev => prev ? { ...prev, zip_code: e.target.value } : null)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                                    placeholder="00000-000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                     <button
                                        onClick={async () => {
                                            if (!partner?.id) return;
                                            setSaving(true);
                                            try {
                                                const { error } = await supabase
                                                    .from('partners')
                                                    .update({
                                                        company_name: partner.company_name,
                                                        category: partner.category,
                                                        address: partner.address,
                                                        city: partner.city,
                                                        state: partner.state,
                                                        zip_code: partner.zip_code,
                                                        updated_at: new Date().toISOString()
                                                    })
                                                    .eq('id', partner.id);
                                                
                                                if (error) throw error;
                                                alert('Perfil atualizado com sucesso!');
                                            } catch (err: any) {
                                                alert('Erro ao atualizar perfil: ' + err.message);
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Finance Tab — Placeholder */
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <div className="bg-slate-100 p-6 rounded-full mb-4">
                                <span className="material-symbols-outlined text-4xl text-slate-400">account_balance_wallet</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Painel Financeiro</h2>
                            <p className="text-slate-500 mt-2">Em breve, seus dados financeiros aparecerão aqui.</p>
                            <button onClick={() => setActiveView('services')} className="mt-6 text-primary font-bold hover:underline text-sm">Ir para Meus Serviços</button>
                        </div>
                    )}
                </div>
            </main>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Read-only Partner Name */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Nome do Parceiro</label>
                                <input
                                    type="text"
                                    value={partner?.company_name || ''}
                                    readOnly
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                                />
                                <p className="text-xs text-slate-400">O nome do parceiro é preenchido automaticamente.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Nome do Serviço *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                        placeholder="Ex: Banho Completo"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Categoria *</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Preço (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Duração (minutos)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.duration_minutes}
                                        onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                        placeholder="60"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Descrição</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
                                        placeholder="Descreva o serviço..."
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Serviço ativo</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 flex-shrink-0">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.name.trim() || !form.price}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerDashboard;