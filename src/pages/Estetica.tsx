import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { supabase } from '../lib/supabase';

type ViewState = 'LIST' | 'DETAILS' | 'PARTNERS';

interface BeautyService {
    id: string;
    name: string;
    description: string | null;
    price: number;
    is_active: boolean;
}

interface GroomingPartner {
    id: string;
    company_name: string;
    category: string;
    phone: string | null;
    email: string | null;
    rating: number;
    logo_url: string | null;
}

const SERVICE_IMAGES: Record<string, string> = {
    'Banho & Secagem': IMAGES.DOG_IN_BATH || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop',
    'Banho + Tosa Higiênica': IMAGES.VET_EXAM || 'https://images.unsplash.com/photo-1596272875729-ed2c21d50c44?q=80&w=2070&auto=format&fit=crop',
    'Tosa Completa (Tesoura/Máquina)': IMAGES.PACKAGE_HERO || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop',
    'Spa Day & Hidratação': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=2070&auto=format&fit=crop',
    'Carding (Remoção de Subpelo)': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2688&auto=format&fit=crop',
};

const SERVICE_BADGES: Record<string, string> = {
    'Banho & Secagem': 'Popular',
    'Banho + Tosa Higiênica': 'Mais Vendido',
    'Spa Day & Hidratação': 'Premium',
};

const Estetica: React.FC = () => {
    const [view, setView] = useState<ViewState>('LIST');
    const [selectedService, setSelectedService] = useState<BeautyService | null>(null);
    const [services, setServices] = useState<BeautyService[]>([]);
    const [partners, setPartners] = useState<GroomingPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const { isFavorite, toggleFavorite } = useFavorites();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [servicesRes, partnersRes] = await Promise.all([
            supabase
                .from('beauty_services')
                .select('*')
                .eq('is_active', true)
                .order('price'),
            supabase
                .from('partners')
                .select('*')
                .eq('category', 'Banho e Tosa')
                .eq('status', 'active')
                .order('rating', { ascending: false }),
        ]);

        if (servicesRes.data) setServices(servicesRes.data);
        if (partnersRes.data) setPartners(partnersRes.data);
        setLoading(false);
    };

    const getServiceImage = (name: string) => {
        return SERVICE_IMAGES[name] || IMAGES.PACKAGE_HERO;
    };

    const handleSelectService = (service: BeautyService) => {
        setSelectedService(service);
        setView('DETAILS');
    };

    const handleChoosePartners = () => setView('PARTNERS');

    const handleSelectPartner = (partner: GroomingPartner) => {
        navigate('/checkout', {
            state: {
                package: {
                    id: selectedService?.id,
                    title: `Agendamento: ${selectedService?.name}`,
                    price: `R$ ${selectedService?.price?.toFixed(2)}`,
                },
                partner: {
                    id: partner.id,
                    name: partner.company_name,
                    type: partner.category,
                    rating: partner.rating,
                    image: partner.logo_url || IMAGES.PACKAGE_HERO,
                    location: 'Parceiro PetGoH',
                },
            },
        });
    };

    const handleBack = () => {
        if (view === 'PARTNERS') setView('DETAILS');
        else if (view === 'DETAILS') setView('LIST');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full size-10 border-2 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-50">
                <div className="max-w-3xl mx-auto flex items-center">
                    <button onClick={view === 'LIST' ? () => navigate(-1) : handleBack} className="mr-4 text-gray-600 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">
                        {view === 'LIST' && 'Banho & Tosa'}
                        {view === 'DETAILS' && 'Detalhes do Serviço'}
                        {view === 'PARTNERS' && 'Escolher Salão'}
                    </h1>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-6">

                {/* VIEW 1: LIST OF SERVICES */}
                {view === 'LIST' && (
                    <div className="space-y-6">
                        {/* Hero Banner */}
                        <div className="relative rounded-2xl overflow-hidden h-40 shadow-sm">
                            <img src={IMAGES.PACKAGE_HERO} alt="Estética Hero" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-6">
                                <div>
                                    <h2 className="text-white text-2xl font-bold mb-1">Cuidado Profissional</h2>
                                    <p className="text-gray-200 text-sm">Os melhores profissionais para o seu pet.</p>
                                </div>
                            </div>
                        </div>

                        {/* Services */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">spa</span>
                                Serviços Disponíveis
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {services.map((service) => {
                                    const badge = SERVICE_BADGES[service.name];
                                    return (
                                        <div
                                            key={service.id}
                                            onClick={() => handleSelectService(service)}
                                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            {badge && (
                                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                                                    {badge}
                                                </div>
                                            )}

                                            <div className="size-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={getServiceImage(service.name)} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-lg text-gray-800 truncate pr-6">{service.name}</h4>
                                                {service.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{service.description}</p>
                                                )}
                                                <span className="text-sm font-bold text-secondary">
                                                    A partir de R$ {service.price?.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite({
                                                            id: service.id,
                                                            name: service.name,
                                                            type: 'Estética',
                                                            image: getServiceImage(service.name),
                                                            rating: 5.0,
                                                            location: 'PetGoH',
                                                            description: service.description || '',
                                                        });
                                                    }}
                                                    className="p-2 rounded-full hover:bg-red-50 transition-colors group/fav flex-shrink-0"
                                                >
                                                    <span className={`material-symbols-outlined text-[24px] ${isFavorite(service.id) ? 'fill-current text-red-500' : 'text-gray-300 group-hover/fav:text-red-400'}`}>
                                                        favorite
                                                    </span>
                                                </button>
                                                <span className="material-symbols-outlined text-gray-300 self-center">chevron_right</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Partners Preview */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">storefront</span>
                                Salões Parceiros
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {partners.map((partner) => (
                                    <div
                                        key={partner.id}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                                    >
                                        <div className="relative h-40 bg-gray-200">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                style={{ backgroundImage: `url('${partner.logo_url || IMAGES.PACKAGE_HERO}')` }}
                                            ></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                            <div className="absolute top-3 left-3">
                                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-blue-500 text-[14px]">verified</span>
                                                    {partner.category}
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite({
                                                        id: partner.id,
                                                        name: partner.company_name,
                                                        type: partner.category,
                                                        image: partner.logo_url || IMAGES.PACKAGE_HERO,
                                                        rating: partner.rating,
                                                        location: 'Parceiro PetGoH',
                                                    });
                                                }}
                                                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10"
                                            >
                                                <span className={`material-symbols-outlined text-[20px] ${isFavorite(partner.id) ? 'fill-current text-red-500' : 'text-gray-400'}`}>
                                                    favorite
                                                </span>
                                            </button>

                                            <div className="absolute bottom-3 left-3 text-white">
                                                <h3 className="text-lg font-bold drop-shadow-sm">{partner.company_name}</h3>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <span className="material-symbols-outlined text-yellow-400 text-[16px] fill-current">star</span>
                                                    <span>{partner.rating || '—'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                                                {partner.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">call</span>
                                                        {partner.phone}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                    <span>Parceiro Verificado</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (services.length > 0) setSelectedService(services[0]);
                                                        handleSelectPartner(partner);
                                                    }}
                                                    className="bg-secondary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-all shadow-sm"
                                                >
                                                    Agendar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW 2: SERVICE DETAILS */}
                {view === 'DETAILS' && selectedService && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div className="relative h-64 rounded-2xl overflow-hidden shadow-md">
                            <img src={getServiceImage(selectedService.name)} alt={selectedService.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                                <div>
                                    {SERVICE_BADGES[selectedService.name] && (
                                        <span className="inline-block bg-primary text-white text-xs font-bold px-2 py-1 rounded-md mb-2">
                                            {SERVICE_BADGES[selectedService.name]}
                                        </span>
                                    )}
                                    <h2 className="text-3xl font-bold text-white leading-tight">{selectedService.name}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Valor Aproximado</span>
                                    <span className="text-2xl font-bold text-secondary">
                                        R$ {selectedService.price?.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {selectedService.description && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Sobre o Serviço</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {selectedService.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-4 z-20">
                            <button
                                onClick={handleChoosePartners}
                                className="w-full bg-primary hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span>Encontrar Salão</span>
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* VIEW 3: PARTNERS LIST */}
                {view === 'PARTNERS' && (
                    <div className="flex flex-col gap-4 animate-fade-in">
                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm mb-2 border border-blue-100">
                            <span className="material-symbols-outlined flex-shrink-0">storefront</span>
                            <p>Salões qualificados para <strong>{selectedService?.name}</strong>.</p>
                        </div>

                        {partners.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
                                <p>Nenhum salão disponível no momento.</p>
                            </div>
                        ) : (
                            partners.map((partner) => (
                                <div
                                    key={partner.id}
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => handleSelectPartner(partner)}
                                >
                                    <div className="relative h-48 bg-gray-200">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${partner.logo_url || IMAGES.PACKAGE_HERO}')` }}
                                        ></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                        <div className="absolute top-3 left-3">
                                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                                <span className="material-symbols-outlined text-blue-500 text-[14px]">verified</span>
                                                {partner.category}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite({
                                                    id: partner.id,
                                                    name: partner.company_name,
                                                    type: partner.category,
                                                    image: partner.logo_url || IMAGES.PACKAGE_HERO,
                                                    rating: partner.rating,
                                                    location: 'Parceiro PetGoH',
                                                });
                                            }}
                                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10"
                                        >
                                            <span className={`material-symbols-outlined text-[20px] ${isFavorite(partner.id) ? 'fill-current text-red-500' : 'text-gray-400'}`}>
                                                favorite
                                            </span>
                                        </button>

                                        <div className="absolute bottom-3 left-3 text-white">
                                            <h3 className="text-xl font-bold mb-1 drop-shadow-sm">{partner.company_name}</h3>
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                                                    <span className="material-symbols-outlined text-yellow-400 text-[16px] fill-current">star</span>
                                                    <span>{partner.rating || '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                                            {partner.phone && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">call</span>
                                                    {partner.phone}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                <span>Parceiro Verificado</span>
                                            </div>
                                            <button className="bg-secondary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-all shadow-sm hover:shadow-md">
                                                Agendar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Estetica;