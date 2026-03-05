import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { supabase } from '../lib/supabase';

type ViewState = 'LIST' | 'DETAILS' | 'PARTNERS';
type TabFilter = 'all' | 'Hotel' | 'Creche';

interface Partner {
    id: string;
    company_name: string;
    category: string;
    phone: string | null;
    email: string | null;
    rating: number;
    logo_url: string | null;
    status: string;
}

interface ServicePackage {
    id: string;
    title: string;
    description: string;
    usage: string;
    validity: string;
    price: string;
    conditions: string[];
    image: string;
    partnerTypeMatch: string;
}

const PACKAGES: ServicePackage[] = [
    {
        id: 'hotel',
        title: 'Hospedagem em Hotel Pet',
        description: 'Seu pet hospedado com conforto e segurança em hotéis parceiros verificados. Ideal para viagens longas.',
        usage: 'Diárias (24h)',
        validity: '30 dias após compra',
        price: 'A partir de R$ 80,00/noite',
        conditions: ['Check-in a partir das 14h', 'Check-out até 12h', 'Carteira de vacinação em dia obrigatória'],
        image: IMAGES.HOTEL_INTERIOR,
        partnerTypeMatch: 'Hotel'
    },
    {
        id: 'daycare',
        title: 'Diárias de Creche',
        description: 'Socialização e diversão durante o dia para gastar energia. Perfeito para quem trabalha fora.',
        usage: 'Diárias (Daycare)',
        validity: '60 dias após compra',
        price: 'A partir de R$ 65,00/dia',
        conditions: ['Segunda a Sexta (exceto feriados)', 'Avaliação comportamental necessária'],
        image: IMAGES.TWO_DOGS,
        partnerTypeMatch: 'Creche'
    },
    {
        id: 'dayuse',
        title: 'Day Use',
        description: 'Um dia de diversão em hotéis fazenda ou clubes pet com piscina e área verde.',
        usage: 'Uso único (Day Use)',
        validity: 'Agendamento prévio',
        price: 'A partir de R$ 120,00',
        conditions: ['Sábados, Domingos e Feriados', 'Monitoramento integral'],
        image: IMAGES.PACKAGE_HERO,
        partnerTypeMatch: 'Hotel'
    },
    {
        id: 'bath',
        title: 'Banho',
        description: 'Banho completo para seu pet com os melhores produtos hipoalergênicos.',
        usage: 'Por sessão',
        validity: '90 dias após compra',
        price: 'A partir de R$ 50,00',
        conditions: ['Agendamento prévio obrigatório'],
        image: IMAGES.DOG_IN_BATH,
        partnerTypeMatch: 'Banho e Tosa'
    },
];

const Hospedagem: React.FC = () => {
    const [view, setView] = useState<ViewState>('LIST');
    const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabFilter>('all');
    const { isFavorite, toggleFavorite } = useFavorites();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .in('category', ['Hotel', 'Creche', 'Banho e Tosa'])
            .eq('status', 'active')
            .order('rating', { ascending: false });

        if (!error && data) {
            setPartners(data);
        }
        setLoading(false);
    };

    const filteredPartners = activeTab === 'all'
        ? partners.filter(p => p.category === 'Hotel' || p.category === 'Creche')
        : partners.filter(p => p.category === activeTab);

    const partnersForPackage = selectedPackage
        ? partners.filter(p => p.category === selectedPackage.partnerTypeMatch)
        : [];

    const handleSelectPackage = (pkg: ServicePackage) => {
        setSelectedPackage(pkg);
        setView('DETAILS');
    };

    const handleChoosePartners = () => {
        setView('PARTNERS');
    };

    const handleSelectPartner = (partner: Partner) => {
        navigate('/checkout', {
            state: {
                package: selectedPackage,
                partner: {
                    id: partner.id,
                    name: partner.company_name,
                    type: partner.category,
                    rating: partner.rating,
                    image: partner.logo_url || IMAGES.HOTEL_INTERIOR,
                    location: 'Verificar endereço',
                }
            }
        });
    };

    const handleBack = () => {
        if (view === 'PARTNERS') setView('DETAILS');
        else if (view === 'DETAILS') setView('LIST');
    };

    const getPartnerImage = (partner: Partner) => {
        if (partner.logo_url) return partner.logo_url;
        if (partner.category === 'Hotel') return IMAGES.HOTEL_INTERIOR;
        if (partner.category === 'Creche') return IMAGES.TWO_DOGS;
        return IMAGES.PACKAGE_HERO;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-50">
                <div className="max-w-3xl mx-auto flex items-center">
                    <button onClick={view === 'LIST' ? () => navigate(-1) : handleBack} className="mr-4 text-gray-600 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">
                        {view === 'LIST' && 'Hospedagem & Creche'}
                        {view === 'DETAILS' && 'Detalhes do Pacote'}
                        {view === 'PARTNERS' && 'Escolher Parceiro'}
                    </h1>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-6">

                {/* VIEW 1: PACKAGES + PARTNERS */}
                {view === 'LIST' && (
                    <div className="space-y-6">
                        {/* Hero Banner */}
                        <div className="relative rounded-2xl overflow-hidden h-48 shadow-md">
                            <img src={IMAGES.HOTEL_INTERIOR} alt="Hospedagem Hero" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-6">
                                <div>
                                    <h2 className="text-white text-2xl font-bold mb-1">Hospedagem & Creche</h2>
                                    <p className="text-gray-200 text-sm">Encontre o lugar perfeito para o seu pet.</p>
                                </div>
                            </div>
                        </div>

                        {/* Service Packages */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">inventory_2</span>
                                Pacotes Disponíveis
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {PACKAGES.filter(p => p.partnerTypeMatch === 'Hotel' || p.partnerTypeMatch === 'Creche').map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        onClick={() => handleSelectPackage(pkg)}
                                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="size-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 truncate">{pkg.title}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-1">{pkg.description}</p>
                                            <span className="text-sm font-bold text-secondary">{pkg.price}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-300 flex-shrink-0">chevron_right</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Partners Section */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">storefront</span>
                                Parceiros Verificados
                            </h3>

                            {/* Tab Filter */}
                            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                                {([
                                    { key: 'all' as TabFilter, label: 'Todos', icon: 'apps' },
                                    { key: 'Hotel' as TabFilter, label: 'Hotéis', icon: 'hotel' },
                                    { key: 'Creche' as TabFilter, label: 'Creches', icon: 'child_care' },
                                ]).map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                                            activeTab === tab.key
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Partners Cards */}
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full size-8 border-2 border-primary border-t-transparent"></div>
                                </div>
                            ) : filteredPartners.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
                                    <p>Nenhum parceiro encontrado.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredPartners.map((partner) => (
                                        <div
                                            key={partner.id}
                                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                                        >
                                            <div className="relative h-44 bg-gray-200">
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                    style={{ backgroundImage: `url('${getPartnerImage(partner)}')` }}
                                                ></div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                                <div className="absolute top-3 left-3 flex gap-2">
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
                                                            image: getPartnerImage(partner),
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

                                                <div className="absolute bottom-3 left-3 right-3 text-white">
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
                                                    {partner.email && (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <span className="material-symbols-outlined text-[16px]">mail</span>
                                                            {partner.email}
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
                                                            setSelectedPackage(PACKAGES.find(p => p.partnerTypeMatch === partner.category) || PACKAGES[0]);
                                                            handleSelectPartner(partner);
                                                        }}
                                                        className="bg-secondary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        Agendar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW 2: PACKAGE DETAILS */}
                {view === 'DETAILS' && selectedPackage && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div className="relative h-64 rounded-2xl overflow-hidden shadow-md">
                            <img src={selectedPackage.image} alt={selectedPackage.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                                <h2 className="text-3xl font-bold text-white leading-tight">{selectedPackage.title}</h2>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Valor</span>
                                    <span className="text-2xl font-bold text-secondary">{selectedPackage.price}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm text-gray-500">Uso / Validade</span>
                                    <span className="text-sm font-semibold text-gray-800">{selectedPackage.usage}</span>
                                    <span className="text-xs text-gray-400">{selectedPackage.validity}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Condições</h3>
                                <ul className="space-y-2">
                                    {selectedPackage.conditions.map((cond, idx) => (
                                        <li key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-[18px]">info</span>
                                            </div>
                                            <span className="text-gray-700 text-sm font-medium">{cond}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Sobre o Pacote</h3>
                                <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {selectedPackage.description}
                                </p>
                            </div>
                        </div>

                        <div className="sticky bottom-4 z-20">
                            <button
                                onClick={handleChoosePartners}
                                className="w-full bg-primary hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span>Encontrar Parceiro</span>
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* VIEW 3: PARTNERS FOR SELECTED PACKAGE */}
                {view === 'PARTNERS' && (
                    <div className="flex flex-col gap-4 animate-fade-in">
                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm mb-2 border border-blue-100">
                            <span className="material-symbols-outlined flex-shrink-0">storefront</span>
                            <p>Parceiros qualificados para <strong>{selectedPackage?.title}</strong>.</p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full size-8 border-2 border-primary border-t-transparent"></div>
                            </div>
                        ) : partnersForPackage.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
                                <p>Nenhum parceiro disponível para este pacote.</p>
                            </div>
                        ) : (
                            partnersForPackage.map((partner) => (
                                <div
                                    key={partner.id}
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => handleSelectPartner(partner)}
                                >
                                    <div className="relative h-48 bg-gray-200">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${getPartnerImage(partner)}')` }}
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
                                                    image: getPartnerImage(partner),
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

                                        <div className="absolute bottom-3 left-3 right-3 text-white">
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

export default Hospedagem;