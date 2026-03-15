import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const CreatePackage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [packageType, setPackageType] = useState('basico');
    const [validityDays, setValidityDays] = useState('30');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [externalLink, setExternalLink] = useState('');
    
    // Items State
    const [items, setItems] = useState<{service_type: string, quantity: number}[]>([
        { service_type: 'hotel', quantity: 1 }
    ]);

    // Hotel linking state
    interface HotelPartner {
        id: string;
        company_name: string;
        logo_url: string | null;
        rating: number;
    }
    const [hotelPartners, setHotelPartners] = useState<HotelPartner[]>([]);
    const [selectedHotels, setSelectedHotels] = useState<Record<string, { selected: boolean; avulsoPrice: string }>>({});

    const serviceTypes = [
        { id: 'hotel', label: 'Hospedagem (Diárias)' },
        { id: 'creche', label: 'Creche (Diárias)' },
        { id: 'banho', label: 'Banho' },
        { id: 'tosa', label: 'Tosa' },
        { id: 'consulta', label: 'Consulta Veterinária' }
    ];

    // Fetch hotel partners on mount
    React.useEffect(() => {
        const fetchHotels = async () => {
            const { data } = await supabase
                .from('partners')
                .select('id, company_name, logo_url, rating')
                .eq('category', 'Hotel')
                .eq('status', 'active')
                .order('company_name');
            if (data) {
                setHotelPartners(data);
                const init: Record<string, { selected: boolean; avulsoPrice: string }> = {};
                data.forEach((h: HotelPartner) => {
                    init[h.id] = { selected: false, avulsoPrice: '' };
                });
                setSelectedHotels(init);
            }
        };
        fetchHotels();
    }, []);

    const handleAddItem = () => {
        setItems([...items, { service_type: 'hotel', quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: 'service_type' | 'quantity', value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Package
            const { data: pkgData, error: pkgError } = await supabase
                .from('packages')
                .insert([
                    {
                        name,
                        description,
                        price: parseFloat(price),
                        image_url: imageUrl,
                        type: packageType,
                        validity_days: parseInt(validityDays),
                        start_date: startDate || null,
                        end_date: endDate || null,
                        external_link: externalLink || null,
                        is_active: true, // Por padrão, pacotes criados via este form são ativos
                    }
                ])
                .select()
                .single();

            if (pkgError) throw pkgError;

            // 2. Create Items
            const itemsToInsert = items.map(item => ({
                package_id: pkgData.id,
                service_type: item.service_type,
                quantity: parseInt(item.quantity.toString())
            }));

            const { error: itemsError } = await supabase
                .from('package_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // 3. Link Hotels
            const hotelLinks = Object.entries(selectedHotels)
                .filter(([, val]) => (val as { selected: boolean; avulsoPrice: string }).selected && (val as { selected: boolean; avulsoPrice: string }).avulsoPrice)
                .map(([partnerId, rawVal]) => {
                    const val = rawVal as { selected: boolean; avulsoPrice: string };
                    return {
                        package_id: pkgData.id,
                        partner_id: partnerId,
                        avulso_price_per_night: parseFloat(val.avulsoPrice),
                    };
                });

            if (hotelLinks.length > 0) {
                const { error: hotelError } = await supabase
                    .from('package_hotels')
                    .insert(hotelLinks);
                if (hotelError) throw hotelError;
            }

            alert('Pacote criado com sucesso!');
            navigate('/admin/packages');

        } catch (error: any) {
            console.error('Error creating package:', error);
            alert('Erro ao criar pacote: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center items-start min-h-screen">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
                    <h2 className="text-xl font-bold text-gray-900">Novo Pacote</h2>
                    <button type="button" onClick={() => navigate('/admin/packages')} className="text-gray-400 hover:text-gray-600 p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Tipo de Pacote */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Tipo de Pacote</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                type="button" 
                                onClick={() => setPackageType('basico')}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${packageType === 'basico' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                                <span className={`material-symbols-outlined text-2xl mb-1 ${packageType === 'basico' ? 'text-primary' : 'text-gray-400'}`}>verified</span>
                                <p className={`text-sm font-bold ${packageType === 'basico' ? 'text-primary' : 'text-gray-600'}`}>Plano Básico</p>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setPackageType('especial')}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${packageType === 'especial' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                                <span className={`material-symbols-outlined text-2xl mb-1 ${packageType === 'especial' ? 'text-primary' : 'text-gray-400'}`}>star</span>
                                <p className={`text-sm font-bold ${packageType === 'especial' ? 'text-primary' : 'text-gray-600'}`}>Plano Especial</p>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setPackageType('promo')}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${packageType === 'promo' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                                <span className={`material-symbols-outlined text-2xl mb-1 ${packageType === 'promo' ? 'text-primary' : 'text-gray-400'}`}>local_fire_department</span>
                                <p className={`text-sm font-bold ${packageType === 'promo' ? 'text-primary' : 'text-gray-600'}`}>Promo Especial</p>
                            </button>
                        </div>
                        {packageType === 'basico' && (
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-gray-400 mt-0.5">info</span>
                                Plano com restrições em feriados e finais de semana. Ideal para tutores com rotina regular.
                            </p>
                        )}
                        {packageType === 'especial' && (
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-gray-400 mt-0.5">info</span>
                                Plano premium sem restrições. Inclui finais de semana.
                            </p>
                        )}
                        {packageType === 'promo' && (
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-gray-400 mt-0.5">info</span>
                                Pacote promocional para ser comprado diretamente, sem necessidade de selecionar as datas agora.
                            </p>
                        )}
                    </div>

                    {/* Nome e Descrição */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pacote *</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                                placeholder="Ex: Pacote Premium Hospedagem" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea 
                                required
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" 
                                rows={2} 
                                placeholder="Descreva o que está incluso no pacote..."
                            />
                        </div>
                    </div>

                    {/* Preço e Validade */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Validade (Dias)</label>
                            <input 
                                type="number" 
                                required
                                min="1"
                                value={validityDays}
                                onChange={e => setValidityDays(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                            />
                        </div>
                    </div>

                    {/* URL Imagem */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem / Capa</label>
                        <div className="flex gap-4">
                            <input 
                                type="url" 
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                                className="flex-1 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                                placeholder="https://sua-imagem.com/foto.jpg"
                            />
                            {imageUrl && (
                                <div className="size-[50px] shrink-0 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                                    <img src={imageUrl} alt="Capa preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Datas Promocionais */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Início da Promo. (Opcional)</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-600" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Término da Promo. (Opcional)</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-600" 
                            />
                        </div>
                    </div>

                    {/* Link Externo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Externo / Divulgação (Opcional)</label>
                        <input 
                            type="url" 
                            value={externalLink}
                            onChange={e => setExternalLink(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                            placeholder="Ex: https://instagram.com/p/..." 
                        />
                    </div>

                    {/* Serviços Inclusos */}
                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">Serviços Inclusos</h3>
                            <button type="button" onClick={handleAddItem} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">add</span> Adicionar
                            </button>
                        </div>
                        
                        {items.length === 0 ? (
                            <div className="space-y-3 bg-gray-50 p-4 rounded-xl min-h-[60px]">
                                <p className="text-sm text-gray-400 text-center py-2">Nenhum serviço adicionado.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-end bg-gray-50/50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Serviço</label>
                                            <select 
                                                value={item.service_type}
                                                onChange={e => handleItemChange(index, 'service_type', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                            >
                                                {serviceTypes.map(type => (
                                                    <option key={type.id} value={type.id}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-20">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Qtd.</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={item.quantity}
                                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none text-sm text-center"
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Hotéis Vinculados */}
                    {items.some(i => i.service_type === 'hotel') && (
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">hotel</span> Hotéis Vinculados
                                </h3>
                            </div>
                            
                            {hotelPartners.length === 0 ? (
                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl min-h-[60px]">
                                    <p className="text-sm text-gray-400 text-center py-2">Nenhum hotel parceiro ativo.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {hotelPartners.map((hotel) => {
                                        const state = selectedHotels[hotel.id];
                                        if (!state) return null;
                                        return (
                                            <div key={hotel.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                                state.selected ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'
                                            }`}>
                                                <input
                                                    type="checkbox"
                                                    checked={state.selected}
                                                    onChange={(e) => setSelectedHotels(prev => ({
                                                        ...prev,
                                                        [hotel.id]: { ...prev[hotel.id], selected: e.target.checked }
                                                    }))}
                                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                />
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h4 className="font-bold text-gray-800 text-sm truncate">{hotel.company_name}</h4>
                                                </div>
                                                {state.selected && (
                                                    <div className="w-36">
                                                        <label className="text-[10px] font-bold text-gray-500 block">Preço Avulso</label>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-400 text-sm">R$</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={state.avulsoPrice}
                                                                onChange={(e) => setSelectedHotels(prev => ({
                                                                    ...prev,
                                                                    [hotel.id]: { ...prev[hotel.id], avulsoPrice: e.target.value }
                                                                }))}
                                                                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <label className="flex items-center gap-2 cursor-pointer pt-4 border-t border-gray-100">
                        <input className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded" type="checkbox" defaultChecked />
                        <span className="text-sm font-medium text-gray-700">Pacote ativo (visível no site)</span>
                    </label>

                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl sticky bottom-0 z-20">
                    <button type="button" onClick={() => navigate('/admin/packages')} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2">
                        {loading ? 'Salvando...' : 'Salvar Pacote'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePackage;
