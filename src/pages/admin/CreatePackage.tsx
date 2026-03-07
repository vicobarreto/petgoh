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
                        active: true
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
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Criar Novo Pacote</h1>

            <form onSubmit={handleSubmit} className="max-w-3xl bg-white p-8 rounded-xl shadow-md border border-gray-100">
                
                {/* Basic Info */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">info</span>
                        1. Informações Básicas
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Pacote</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                                placeholder="Ex: Pacote Férias Divertidas"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição Completa</label>
                            <textarea 
                                required
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner resize-y"
                                placeholder="Descreva todos os benefícios, diferenciais e regras principais deste pacote..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preço Fixo (R$)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                                <input 
                                    type="number" 
                                    required
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-2">URL da Capa (Imagem)</label>
                            <div className="flex gap-4">
                                <input 
                                    type="url" 
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                                    placeholder="https://sua-imagem.com/foto.jpg"
                                />
                                {imageUrl && (
                                    <div className="size-10 shrink-0 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                                        <img src={imageUrl} alt="Capa preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo / Estrutura do Pacote</label>
                            <select 
                                value={packageType}
                                onChange={e => setPackageType(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                            >
                                <option value="basico">Plano Básico (Sem finais de semana)</option>
                                <option value="especial">Plano Especial (Inclui finais de semana)</option>
                                <option value="promo">Promo Especial / Final de Semana (Fixo)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Validade após a compra (Dias)</label>
                            <input 
                                type="number" 
                                min="1"
                                required
                                value={validityDays}
                                onChange={e => setValidityDays(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                                placeholder="30"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500 text-[20px]">event_available</span>
                                Período Promocional e Divulgação (Opcional)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Início da Promoção</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Término da Promoção</label>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Link Externo / Divulgação</label>
                                    <input 
                                        type="url" 
                                        value={externalLink}
                                        onChange={e => setExternalLink(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                                        placeholder="Ex: https://instagram.com/p/..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">featured_play_list</span>
                            2. Serviços Inclusos
                        </h2>
                        <button 
                            type="button" 
                            onClick={handleAddItem}
                            className="px-4 py-2 text-sm font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 flex items-center gap-2 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Novo Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-end bg-gray-50/50 hover:bg-gray-50 p-4 rounded-xl border border-gray-200 transition-colors shadow-sm">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Serviço Inclusoo</label>
                                    <select 
                                        value={item.service_type}
                                        onChange={e => handleItemChange(index, 'service_type', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent shadow-inner"
                                    >
                                        {serviceTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Quant.</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={item.quantity}
                                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent shadow-inner text-center"
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                    title="Remover este serviço"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hotel Linking */}
                {items.some(i => i.service_type === 'hotel') && (
                    <div className="mb-8">
                        <div className="mb-6 pb-2 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary">hotel</span>
                                3. Hotéis Vinculados (Obrigatório)
                            </h2>
                            <p className="text-sm text-gray-500">Selecione quais hotéis parceiros aceitam hospedar pets com este pacote. Defina o **preço avulso** de cada um para gerar a exibição de desconto progressivo na reserva.</p>
                        </div>
                        
                        {hotelPartners.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                                <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3 shadow-inner">
                                    <span className="material-symbols-outlined text-3xl">domain_disabled</span>
                                </div>
                                <p className="font-semibold text-gray-600">Nenhum hotel parceiro ativo.</p>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm text-center">Cadastre provedores com a categoria "Hotel" primeiro antes de criar pacotes de hospedagem.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {hotelPartners.map((hotel) => {
                                    const state = selectedHotels[hotel.id];
                                    if (!state) return null;
                                    return (
                                        <div key={hotel.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all shadow-sm ${
                                            state.selected ? 'border-primary bg-primary/5 shadow-primary/10' : 'border-gray-200 bg-white hover:border-primary/30'
                                        }`}>
                                            <input
                                                type="checkbox"
                                                checked={state.selected}
                                                onChange={(e) => setSelectedHotels(prev => ({
                                                    ...prev,
                                                    [hotel.id]: { ...prev[hotel.id], selected: e.target.checked }
                                                }))}
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{hotel.company_name}</h4>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <span className="material-symbols-outlined text-[14px] text-yellow-500">star</span>
                                                    {hotel.rating || '—'}
                                                </div>
                                            </div>
                                            {state.selected && (
                                                <div className="w-40">
                                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Preço Avulso/Noite</label>
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                    <button 
                        type="button" 
                        onClick={() => navigate('/admin/packages')}
                        className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-2 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        {loading ? 'Salvando...' : 'Criar Pacote'}
                        {!loading && <span className="material-symbols-outlined">check</span>}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreatePackage;
