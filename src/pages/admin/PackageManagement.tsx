import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface PackageItem {
    id?: string;
    service_type: string;
    quantity: number;
}

interface HotelPartner {
    id: string;
    company_name: string;
    rating: number | null;
}

interface Package {
    id: string;
    name: string;
    description: string;
    price: number;
    type: string;
    validity_days: number;
    is_active: boolean;
    items?: PackageItem[];
}

const PACKAGE_TYPES = [
    { value: 'basico', label: 'Plano Básico', icon: 'verified', color: 'bg-blue-50 text-blue-700 ring-blue-200',
      desc: 'Plano com restrições em feriados — hospedagem em feriados tem custo adicional. Ideal para tutores com rotina regular.' },
    { value: 'especial', label: 'Plano Especial', icon: 'star', color: 'bg-amber-50 text-amber-700 ring-amber-200',
      desc: 'Plano premium sem restrições — válido em qualquer dia da semana, incluindo feriados e datas especiais, sem custo extra.' },
];

const SERVICE_OPTIONS = [
    { value: 'hotel', label: 'Hospedagem' },
    { value: 'daycare', label: 'Creche' },
    { value: 'bath', label: 'Banho' },
    { value: 'grooming', label: 'Tosa' },
    { value: 'vet', label: 'Consulta Veterinária' },
    { value: 'vaccine', label: 'Vacinação' },
    { value: 'walk', label: 'Passeio' },
];

const PackageManagement: React.FC = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<Partial<Package>>({});
    const [packageItems, setPackageItems] = useState<PackageItem[]>([]);
    const [saving, setSaving] = useState(false);

    // Hotel partners
    const [hotelPartners, setHotelPartners] = useState<HotelPartner[]>([]);
    const [selectedHotels, setSelectedHotels] = useState<Record<string, { selected: boolean; avulsoPrice: string }>>({});

    useEffect(() => {
        fetchPackages();
        fetchHotelPartners();
    }, []);

    const fetchHotelPartners = async () => {
        const { data } = await supabase
            .from('partners')
            .select('id, company_name, rating')
            .eq('category', 'Hotel')
            .eq('status', 'active');
        if (data) {
            setHotelPartners(data);
            const initial: Record<string, { selected: boolean; avulsoPrice: string }> = {};
            data.forEach((h: HotelPartner) => { initial[h.id] = { selected: false, avulsoPrice: '' }; });
            setSelectedHotels(initial);
        }
    };

    const fetchPackages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('packages')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error) setPackages(data || []);
        setLoading(false);
    };

    const fetchItemsForPackage = async (packageId: string) => {
        const { data } = await supabase.from('package_items').select('*').eq('package_id', packageId);
        setPackageItems(data || []);
    };

    const fetchHotelsForPackage = async (packageId: string) => {
        const { data } = await supabase
            .from('package_hotels')
            .select('partner_id, avulso_price_per_night')
            .eq('package_id', packageId);
        if (data) {
            setSelectedHotels(prev => {
                const updated = { ...prev };
                // reset all first
                Object.keys(updated).forEach(id => { updated[id] = { selected: false, avulsoPrice: '' }; });
                data.forEach((row: any) => {
                    if (updated[row.partner_id]) {
                        updated[row.partner_id] = { selected: true, avulsoPrice: String(row.avulso_price_per_night || '') };
                    }
                });
                return updated;
            });
        }
    };

    const handleOpenModal = (pkg?: Package) => {
        if (pkg) {
            setCurrentPackage(pkg);
            fetchItemsForPackage(pkg.id);
            fetchHotelsForPackage(pkg.id);
        } else {
            setCurrentPackage({ is_active: true, type: 'basico', validity_days: 30 });
            setPackageItems([]);
            // reset hotel selections
            setSelectedHotels(prev => {
                const reset: typeof prev = {};
                Object.keys(prev).forEach(id => { reset[id] = { selected: false, avulsoPrice: '' }; });
                return reset;
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!currentPackage.name || !currentPackage.price) {
            alert('Preencha nome e preço.');
            return;
        }
        setSaving(true);
        try {
            const isEditing = !!currentPackage.id;
            const payload: any = {
                name: currentPackage.name,
                description: currentPackage.description || '',
                price: currentPackage.price,
                type: currentPackage.type || 'basico',
                validity_days: currentPackage.validity_days || 30,
                is_active: currentPackage.is_active ?? true,
            };

            let packageId: string;

            if (isEditing) {
                const { error } = await supabase
                    .from('packages')
                    .update(payload)
                    .eq('id', currentPackage.id);
                if (error) throw error;
                packageId = currentPackage.id!;
            } else {
                const { data, error } = await supabase
                    .from('packages')
                    .insert([payload])
                    .select()
                    .single();
                if (error) throw error;
                packageId = data.id;
            }

            // Handle items
            if (isEditing) {
                await supabase.from('package_items').delete().eq('package_id', packageId);
            }
            if (packageItems.length > 0) {
                const itemsToInsert = packageItems.map(item => ({
                    package_id: packageId,
                    service_type: item.service_type,
                    quantity: item.quantity,
                }));
                const { error: itemsError } = await supabase.from('package_items').insert(itemsToInsert);
                if (itemsError) throw itemsError;
            }

            // Handle hotel links
            await supabase.from('package_hotels').delete().eq('package_id', packageId);
            const hotelsToLink = (Object.entries(selectedHotels) as [string, { selected: boolean; avulsoPrice: string }][])
                .filter(([, v]) => v.selected)
                .map(([partnerId, v]) => ({
                    package_id: packageId,
                    partner_id: partnerId,
                    avulso_price_per_night: parseFloat(v.avulsoPrice) || 0,
                }));
            if (hotelsToLink.length > 0) {
                await supabase.from('package_hotels').insert(hotelsToLink);
            }

            setIsModalOpen(false);
            fetchPackages();
        } catch (error: any) {
            console.error('Error saving package:', error);
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (pkg: Package) => {
        await supabase.from('packages').update({ is_active: !pkg.is_active }).eq('id', pkg.id);
        fetchPackages();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este pacote?')) return;
        await supabase.from('package_items').delete().eq('package_id', id);
        await supabase.from('packages').delete().eq('id', id);
        fetchPackages();
    };

    const handleAddItem = () => {
        setPackageItems([...packageItems, { service_type: 'hotel', quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        setPackageItems(packageItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof PackageItem, value: any) => {
        const newItems = [...packageItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setPackageItems(newItems);
    };

    const getTypeInfo = (type: string) => PACKAGE_TYPES.find(t => t.value === type) || PACKAGE_TYPES[0];

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">Gestão de Pacotes</h1>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{packages.length} Total</span>
                    </div>
                    <p className="text-gray-500 text-sm">Crie e edite pacotes de Hospedagem, Day Use e Creche.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Novo Pacote
                </button>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">Carregando pacotes...</div>
            ) : packages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
                    <p className="text-gray-500 font-medium">Nenhum pacote cadastrado.</p>
                    <p className="text-gray-400 text-sm mt-1">Clique em "Novo Pacote" para começar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {packages.map(pkg => {
                        const typeInfo = getTypeInfo(pkg.type);
                        return (
                            <div key={pkg.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden ${!pkg.is_active ? 'opacity-60' : ''}`}>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeInfo.color} ring-1`}>
                                                <span className="material-symbols-outlined text-lg">{typeInfo.icon}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                                                <span className="text-xs text-gray-400">{typeInfo.label}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {pkg.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pkg.description || 'Sem descrição'}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-gray-900 text-lg">R$ {Number(pkg.price).toFixed(2)}</span>
                                        <span className="text-gray-400">{pkg.validity_days} dias</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-50 px-5 py-3 flex justify-between items-center bg-gray-50/50">
                                    <button onClick={() => handleToggleActive(pkg)} className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                        {pkg.is_active ? 'Desativar' : 'Ativar'}
                                    </button>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleOpenModal(pkg)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(pkg.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">{currentPackage.id ? 'Editar Pacote' : 'Novo Pacote'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Type Selector */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Tipo de Pacote</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {PACKAGE_TYPES.map(pt => (
                                        <button
                                            key={pt.value}
                                            type="button"
                                            onClick={() => setCurrentPackage({ ...currentPackage, type: pt.value })}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                                                currentPackage.type === pt.value
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                        >
                                            <span className={`material-symbols-outlined text-2xl mb-1 ${currentPackage.type === pt.value ? 'text-primary' : 'text-gray-400'}`}>{pt.icon}</span>
                                            <p className={`text-sm font-bold ${currentPackage.type === pt.value ? 'text-primary' : 'text-gray-600'}`}>{pt.label}</p>
                                        </button>
                                    ))}
                                </div>
                                {currentPackage.type && (
                                    <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
                                        <span className="material-symbols-outlined text-sm text-gray-400 mt-0.5">info</span>
                                        {getTypeInfo(currentPackage.type).desc}
                                    </p>
                                )}
                            </div>

                            {/* Name & Description */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pacote *</label>
                                    <input type="text" className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={currentPackage.name || ''} onChange={e => setCurrentPackage({ ...currentPackage, name: e.target.value })} placeholder="Ex: Pacote Premium Hospedagem" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <textarea className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" rows={2} value={currentPackage.description || ''} onChange={e => setCurrentPackage({ ...currentPackage, description: e.target.value })} placeholder="Descreva o que está incluso no pacote..." />
                                </div>
                            </div>

                            {/* Price & Validity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                                    <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={currentPackage.price || ''} onChange={e => setCurrentPackage({ ...currentPackage, price: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Validade (Dias)</label>
                                    <input type="number" min="1" className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={currentPackage.validity_days || 30} onChange={e => setCurrentPackage({ ...currentPackage, validity_days: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={currentPackage.is_active ?? true} onChange={e => setCurrentPackage({ ...currentPackage, is_active: e.target.checked })} className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                <span className="text-sm font-medium text-gray-700">Pacote ativo (visível no site)</span>
                            </label>

                            {/* Service Items */}
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800">Serviços Inclusos</h3>
                                    <button onClick={handleAddItem} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">add</span> Adicionar
                                    </button>
                                </div>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl min-h-[60px]">
                                    {packageItems.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Nenhum serviço adicionado.</p>}
                                    {packageItems.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100">
                                            <select className="flex-1 border border-gray-200 rounded-lg p-2 text-sm outline-none"
                                                value={item.service_type} onChange={e => handleItemChange(i, 'service_type', e.target.value)}>
                                                {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                            <input type="number" min="1" className="w-16 border border-gray-200 rounded-lg p-2 text-sm text-center outline-none" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', parseInt(e.target.value) || 1)} />
                                            <span className="text-xs text-gray-400">un.</span>
                                            <button onClick={() => handleRemoveItem(i)} className="text-red-400 hover:text-red-600 p-1">
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hotel Partners */}
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[20px]">hotel</span>
                                        Parceiros Vinculados
                                    </h3>
                                </div>
                                {hotelPartners.length === 0 ? (
                                    <p className="text-sm text-gray-400 bg-gray-50 p-4 rounded-xl text-center">Nenhum parceiro do tipo Hotel cadastrado.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {hotelPartners.map(hotel => {
                                            const state = selectedHotels[hotel.id];
                                            if (!state) return null;
                                            return (
                                                <div key={hotel.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                                    state.selected ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'
                                                }`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={state.selected}
                                                        onChange={e => setSelectedHotels(prev => ({ ...prev, [hotel.id]: { ...prev[hotel.id], selected: e.target.checked } }))}
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                    <span className="flex-1 text-sm font-medium text-gray-800">{hotel.company_name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl sticky bottom-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2">
                                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : 'Salvar Pacote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageManagement;
