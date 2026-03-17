import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { supabase } from '../lib/supabase';

import { InteractiveMap } from '../components/map/InteractiveMap';
import { AccommodationCard } from '../components/map/AccommodationCard';
import { MOCK_ACCOMMODATIONS } from '../components/map/mapData';

export const PartnerFavoriteButton: React.FC<{ isFav: boolean, onToggle: (e: React.MouseEvent) => void }> = ({ isFav, onToggle }) => {
    const [animating, setAnimating] = React.useState(false);

    const handleClick = (e: React.MouseEvent) => {
        if (!isFav) {
            setAnimating(true);
            setTimeout(() => setAnimating(false), 300);
        }
        onToggle(e);
    };

    return (
        <button
            onClick={handleClick}
            className={`p-1.5 rounded-full hover:bg-red-50 transition-colors ${animating ? 'animate-heart-pulse' : ''}`}
        >
            <span className={`material-symbols-outlined text-[20px] ${isFav || animating ? 'fill-current text-red-500' : 'text-gray-300 hover:text-red-400'}`}>
                favorite
            </span>
        </button>
    );
};

type BookingStep = 'ITEMS' | 'QUANTITY' | 'DISTRIBUTE' | 'DATES' | 'SUMMARY';

interface Partner {
    id: string;
    company_name: string;
    category: string;
    phone: string | null;
    email: string | null;
    rating: number;
    logo_url: string | null;
    city: string | null;
    state: string | null;
    status: string;
}

const STEP_CONFIG: { key: BookingStep; label: string; icon: string }[] = [
    { key: 'ITEMS', label: 'Hotéis', icon: 'hotel' },
    { key: 'QUANTITY', label: 'Quantidade', icon: 'tag' },
    { key: 'DISTRIBUTE', label: 'Diárias', icon: 'tune' },
    { key: 'DATES', label: 'Datas', icon: 'calendar_month' },
    { key: 'SUMMARY', label: 'Resumo', icon: 'receipt_long' },
];

const Hospedagem: React.FC = () => {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();

    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<BookingStep>('ITEMS');
    const [categoryFilter, setCategoryFilter] = useState<'Todos' | 'Hotel' | 'Creche' | 'Pet Friendly'>('Todos');
    
    // Map states
    const [hoveredAccommodationId, setHoveredAccommodationId] = useState<string | null>(null);

    // Selected partners (IDs)
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);

    // Distribution: partnerId -> nights
    const [distribution, setDistribution] = useState<Record<string, number>>({});

    // Dates: partnerId -> array of date strings
    const [dates, setDates] = useState<Record<string, string[]>>({});

    const [totalDiarias, setTotalDiarias] = useState(1);

    const distributedTotal = useMemo(() => {
        return (Object.values(distribution) as number[]).reduce((sum, n) => sum + n, 0);
    }, [distribution]);

    const canProceedFromDistribute = distributedTotal === totalDiarias;

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .in('category', ['Hotel', 'Creche'])
            .eq('status', 'active')
            .order('rating', { ascending: false });

        if (!error && data) {
            setPartners(data);
        }
        setLoading(false);
    };

    const getPartnerImage = (partner: Partner) => {
        if (partner.logo_url) return partner.logo_url;
        if (partner.category === 'Hotel') return IMAGES.HOTEL_INTERIOR;
        if (partner.category === 'Creche') return IMAGES.TWO_DOGS;
        return IMAGES.PACKAGE_HERO;
    };

    const togglePartnerSelection = (partnerId: string) => {
        setSelectedPartners(prev =>
            prev.includes(partnerId)
                ? prev.filter(id => id !== partnerId)
                : [...prev, partnerId]
        );
    };

    const handleAdvanceFromItems = () => {
        if (selectedPartners.length === 0) return;
        setStep('QUANTITY');
    };

    const handleAdvanceFromQuantity = () => {
        // Initialize distribution
        const initDist: Record<string, number> = {};
        selectedPartners.forEach(id => { initDist[id] = 0; });

        if (selectedPartners.length === 1) {
            // Skip distribute step — auto-assign all nights
            initDist[selectedPartners[0]] = totalDiarias;
            setDistribution(initDist);
            // Initialize dates
            setDates({ [selectedPartners[0]]: Array(totalDiarias).fill('') });
            setStep('DATES');
        } else {
            setDistribution(initDist);
            setStep('DISTRIBUTE');
        }
    };

    const handleAdvanceFromDistribute = () => {
        // Initialize dates arrays based on distribution
        const initDates: Record<string, string[]> = {};
        (Object.entries(distribution) as [string, number][]).forEach(([partnerId, nights]) => {
            if (nights > 0) {
                initDates[partnerId] = Array(nights).fill('');
            }
        });
        setDates(initDates);
        setStep('DATES');
    };

    const isWeekend = (dateStr: string): boolean => {
        const date = new Date(dateStr + 'T12:00:00');
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const formatDate = (dateStr: string): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getMinDate = (): string => {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    };

    const canProceedFromDates = useMemo(() => {
        return (Object.entries(distribution) as [string, number][]).every(([partnerId, nights]) => {
            if (nights === 0) return true;
            const hotelDates = dates[partnerId] || [];
            if (hotelDates.length !== nights) return false;
            if (hotelDates.some(d => !d)) return false;
            if (hotelDates.some(isWeekend)) return false;
            return true;
        });
    }, [distribution, dates]);

    const handleContinueToCheckout = () => {
        const stays = (Object.entries(distribution) as [string, number][])
            .filter(([, nights]) => nights > 0)
            .map(([partnerId, nights]) => {
                const partner = partners.find(p => p.id === partnerId);
                return {
                    partnerId,
                    partnerName: partner?.company_name || 'Hotel',
                    nights,
                    dates: dates[partnerId] || [],
                };
            });

        navigate('/checkout/hospedagem', {
            state: {
                bookingStays: stays,
                totalDiarias,
                category: 'hospedagem',
            },
        });
    };

    const stepIndex = STEP_CONFIG.findIndex(s => s.key === step);

    // Determine visible steps (skip DISTRIBUTE if only 1 partner)
    const visibleSteps = selectedPartners.length <= 1
        ? STEP_CONFIG.filter(s => s.key !== 'DISTRIBUTE')
        : STEP_CONFIG;

    const visibleStepIndex = visibleSteps.findIndex(s => s.key === step);

    if (loading) {
        return (
            <div className="flex-grow w-full flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    <p className="text-gray-500 text-sm">Carregando parceiros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm mb-6 text-gray-500">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="font-semibold text-[#181310]">Hospedagem & Creche</span>
            </nav>

            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden h-48 mb-8 group">
                <img src={IMAGES.HOTEL_INTERIOR} alt="Hospedagem" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center p-6 sm:p-8">
                    <div>
                        <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1">Hospedagem & Creche</h1>
                        <p className="text-gray-200 text-sm sm:text-base max-w-md">Encontre o lugar perfeito para o seu pet. Hotéis e creches verificados.</p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
                {visibleSteps.map((s, i) => (
                    <React.Fragment key={s.key}>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                visibleStepIndex >= i
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-gray-100 text-gray-400'
                            }`}>
                                {visibleStepIndex > i
                                    ? <span className="material-symbols-outlined text-lg">check</span>
                                    : <span className="material-symbols-outlined text-lg">{s.icon}</span>
                                }
                            </div>
                            <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                                visibleStepIndex >= i ? 'text-gray-900' : 'text-gray-400'
                            }`}>{s.label}</span>
                        </div>
                        {i < visibleSteps.length - 1 && (
                            <div className={`w-8 sm:w-14 h-0.5 rounded-full transition-colors ${
                                visibleStepIndex > i ? 'bg-primary' : 'bg-gray-200'
                            }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* ============= STEP 1: ITEMS ============= */}
            {step === 'ITEMS' && (() => {
                const FILTER_TABS: { key: 'Todos' | 'Hotel' | 'Creche' | 'Pet Friendly'; label: string; icon: string }[] = [
                    { key: 'Todos', label: 'Todos', icon: 'apps' },
                    { key: 'Hotel', label: 'Hotéis', icon: 'hotel' },
                    { key: 'Creche', label: 'Creche', icon: 'child_care' },
                    { key: 'Pet Friendly', label: 'Pet Friendly', icon: 'pets' },
                ];
                
                // Combine DB partners with Mock Data logic
                const allAccommodations = MOCK_ACCOMMODATIONS;
                
                const filteredAccommodations = categoryFilter === 'Todos'
                    ? allAccommodations
                    : allAccommodations.filter(p => p.category === categoryFilter);

                return (
                <div className="w-full animate-in fade-in duration-300">
                    <div className="mb-6">
                        <h3 className="text-xl sm:text-2xl font-black text-[#181310] mb-2 tracking-tight">Onde seu pet vai ficar?</h3>
                        <p className="text-sm text-gray-500 max-w-2xl">
                            Explore as opções no mapa ou na lista abaixo. Tudo verificado e pronto para receber seu melhor amigo.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row h-[75vh] min-h-[600px] border border-gray-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
                        {/* LEFT SIDE: LIST */}
                        <div className="w-full lg:w-[45%] h-full flex flex-col bg-white border-r border-gray-100 order-2 lg:order-1 relative z-10">
                            {/* Header / Filters inside List */}
                            <div className="p-4 sm:p-6 border-b border-gray-100 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 sm:px-0">
                                    {FILTER_TABS.map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setCategoryFilter(tab.key)}
                                            className={`whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 py-2 px-4 rounded-full text-sm font-bold transition-all shadow-sm border ${
                                                categoryFilter === tab.key
                                                    ? 'bg-primary border-primary text-white shadow-primary/20 hover:bg-orange-600'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">{filteredAccommodations.length} acomodações encontradas</span>
                                </div>
                            </div>
                            
                            {/* Scrollable Cards */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative bg-gray-50/50">
                                {/* Mobile Map Container - Only visible on sm and below inside the scroll area to prevent splitting the layout awkwardly */}
                                <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 lg:hidden border border-gray-200 shadow-sm shrink-0">
                                    <InteractiveMap 
                                        accommodations={filteredAccommodations}
                                        selectedId={hoveredAccommodationId}
                                        onSelectAccommodation={setHoveredAccommodationId}
                                        onViewDetails={(id) => togglePartnerSelection(id)}
                                    />
                                </div>

                                {filteredAccommodations.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 h-full flex flex-col items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">search_off</span>
                                        <p className="text-gray-500 font-medium">Nenhum resultado para este filtro.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                        {filteredAccommodations.map((acc) => (
                                            <AccommodationCard 
                                                key={acc.id}
                                                accommodation={acc}
                                                isSelected={selectedPartners.includes(acc.id) || hoveredAccommodationId === acc.id}
                                                onHover={setHoveredAccommodationId}
                                                onClick={(id) => {
                                                    togglePartnerSelection(id);
                                                    setHoveredAccommodationId(id);
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Floating Continue Action (if selected) */}
                            {selectedPartners.length > 0 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto bg-white p-2 sm:p-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-3 animate-in slide-in-from-bottom-5 z-30">
                                    <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-full shrink-0">
                                        <span className="material-symbols-outlined">check</span>
                                    </div>
                                    <div className="flex-1 min-w-0 px-2 sm:px-0">
                                        <p className="text-sm font-bold text-gray-900 leading-tight">Pronto para reservar!</p>
                                        <p className="text-[11px] text-gray-500 truncate">{selectedPartners.length} item(s) selecionado(s)</p>
                                    </div>
                                    <button
                                        onClick={handleAdvanceFromItems}
                                        className="h-12 sm:h-10 px-6 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-all shadow-md shrink-0 whitespace-nowrap"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDE: MAP (Desktop Only) */}
                        <div className="hidden lg:block lg:w-[55%] h-full bg-gray-100 relative order-1 lg:order-2 shrink-0 z-0">
                            <InteractiveMap 
                                accommodations={filteredAccommodations}
                                selectedId={hoveredAccommodationId}
                                onSelectAccommodation={setHoveredAccommodationId}
                                onViewDetails={(id) => togglePartnerSelection(id)}
                            />
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* ============= STEP 2: QUANTITY ============= */}
            {step === 'QUANTITY' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Quantas Diárias?</h3>
                        <p className="text-sm text-gray-500">
                            Informe quantas diárias no total você precisa para o seu pet.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center space-y-6">
                        <div className="text-gray-400">
                            <span className="material-symbols-outlined text-6xl">night_shelter</span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setTotalDiarias(Math.max(1, totalDiarias - 1))}
                                className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors disabled:opacity-50"
                                disabled={totalDiarias <= 1}
                            >
                                <span className="material-symbols-outlined text-2xl">remove</span>
                            </button>
                            
                            <div className="w-24 text-center">
                                <span className="text-5xl font-black text-gray-900">{totalDiarias}</span>
                                <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Diárias</span>
                            </div>

                            <button 
                                onClick={() => setTotalDiarias(Math.min(15, totalDiarias + 1))}
                                className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                disabled={totalDiarias >= 15}
                            >
                                <span className="material-symbols-outlined text-2xl">add</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <button
                            onClick={() => setStep('ITEMS')}
                            className="flex-1 h-14 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-lg transition-colors"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={handleAdvanceFromQuantity}
                            className="flex-[2] h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            Continuar
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ============= STEP 3: DISTRIBUTE ============= */}
            {step === 'DISTRIBUTE' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Distribuir Diárias</h3>
                        <p className="text-sm text-gray-500">
                            Distribua suas <strong>{totalDiarias} diárias</strong> entre os parceiros selecionados.
                        </p>
                    </div>

                    {/* Counter */}
                    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                        canProceedFromDistribute
                            ? 'border-green-200 bg-green-50'
                            : distributedTotal > totalDiarias
                                ? 'border-red-200 bg-red-50'
                                : 'border-gray-200 bg-white'
                    }`}>
                        <span className="text-sm font-semibold text-gray-700">Diárias distribuídas</span>
                        <span className={`text-2xl font-black ${
                            canProceedFromDistribute ? 'text-green-600' : distributedTotal > totalDiarias ? 'text-red-600' : 'text-gray-900'
                        }`}>
                            {distributedTotal} / {totalDiarias}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {selectedPartners.map((partnerId) => {
                            const partner = partners.find(p => p.id === partnerId);
                            if (!partner) return null;
                            const nights = distribution[partnerId] || 0;
                            return (
                                <div key={partnerId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200"
                                            style={{ backgroundImage: `url('${getPartnerImage(partner)}')` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate">{partner.company_name}</h4>
                                            <p className="text-xs text-gray-400">{partner.category}</p>
                                        </div>
                                        <span className={`text-2xl font-black ${nights > 0 ? 'text-primary' : 'text-gray-300'}`}>
                                            {nights}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                if (nights > 0) {
                                                    setDistribution(prev => ({ ...prev, [partnerId]: nights - 1 }));
                                                }
                                            }}
                                            disabled={nights <= 0}
                                            className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-xl">remove</span>
                                        </button>

                                        <div className="flex-1 bg-gray-100 rounded-xl h-3 overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-xl transition-all duration-300"
                                                style={{ width: `${(nights / totalDiarias) * 100}%` }}
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (distributedTotal < totalDiarias) {
                                                    setDistribution(prev => ({ ...prev, [partnerId]: nights + 1 }));
                                                }
                                            }}
                                            disabled={distributedTotal >= totalDiarias}
                                            className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-xl">add</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep('QUANTITY')}
                            className="h-14 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Voltar
                        </button>
                        <button
                            onClick={handleAdvanceFromDistribute}
                            disabled={!canProceedFromDistribute}
                            className="flex-1 h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Escolher Datas
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ============= STEP 4: DATES ============= */}
            {step === 'DATES' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Datas de Hospedagem</h3>
                        <p className="text-sm text-gray-500">
                            Escolha as datas para cada hospedagem.
                            <span className="text-amber-600 font-semibold"> Somente dias úteis.</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        {(Object.entries(distribution) as [string, number][])
                            .filter(([, nights]) => nights > 0)
                            .map(([partnerId, nights]) => {
                                const partner = partners.find(p => p.id === partnerId);
                                const hotelDates = dates[partnerId] || Array(nights).fill('');

                                return (
                                    <div key={partnerId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                                            <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200"
                                                style={{ backgroundImage: `url('${getPartnerImage(partner!)}')` }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{partner?.company_name}</h4>
                                                <p className="text-xs text-gray-500 font-semibold">{nights} diária{nights > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {hotelDates.map((currentDate: string, idx: number) => {
                                                const isInvalid = currentDate && isWeekend(currentDate);
                                                return (
                                                    <div key={idx}>
                                                        <label className="text-xs font-bold text-gray-500 mb-1.5 block">Diária {idx + 1}</label>
                                                        <input
                                                            type="date"
                                                            min={getMinDate()}
                                                            value={currentDate}
                                                            onChange={(e) => {
                                                                const newDate = e.target.value;
                                                                setDates(prev => {
                                                                    const next = { ...prev };
                                                                    const arr = [...(next[partnerId] || Array(nights).fill(''))];
                                                                    arr[idx] = newDate;
                                                                    next[partnerId] = arr;
                                                                    return next;
                                                                });
                                                            }}
                                                            className={`w-full h-12 px-4 rounded-xl border-2 text-sm font-medium outline-none transition-colors ${
                                                                isInvalid
                                                                    ? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500'
                                                                    : currentDate
                                                                        ? 'border-green-200 bg-green-50 text-gray-900 focus:border-green-400'
                                                                        : 'border-gray-200 bg-white text-gray-900 focus:border-primary'
                                                            }`}
                                                        />
                                                        {isInvalid && (
                                                            <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">warning</span>
                                                                Somente dias úteis
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(selectedPartners.length > 1 ? 'DISTRIBUTE' : 'QUANTITY')}
                            className="h-14 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Voltar
                        </button>
                        <button
                            onClick={() => setStep('SUMMARY')}
                            disabled={!canProceedFromDates}
                            className="flex-1 h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Ver Resumo
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ============= STEP 5: SUMMARY ============= */}
            {step === 'SUMMARY' && (() => {
                const stays = (Object.entries(distribution) as [string, number][])
                    .filter(([, nights]) => nights > 0)
                    .map(([partnerId, nights]) => ({
                        partnerId,
                        partner: partners.find(p => p.id === partnerId),
                        nights,
                        dates: dates[partnerId] || [],
                    }));

                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Resumo da Reserva</h3>
                            <p className="text-sm text-gray-500">Confira os detalhes antes de ir para o pagamento.</p>
                        </div>

                        <div className="space-y-4">
                            {stays.map((stay, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200"
                                            style={{ backgroundImage: `url('${getPartnerImage(stay.partner!)}')` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate">{stay.partner?.company_name}</h4>
                                            <p className="text-xs text-gray-500">{stay.nights} diária{stay.nights > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-2">
                                        {stay.dates.sort().map((date, i) => (
                                            <div key={i} className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-900 border border-gray-100">
                                                {formatDate(date)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('DATES')}
                                className="h-14 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Voltar
                            </button>
                            <button
                                onClick={handleContinueToCheckout}
                                className="flex-1 h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">lock</span>
                                Ir para Pagamento
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                            Pagamento 100% seguro
                        </p>
                    </div>
                );
            })()}
        </div>
    );
};

export default Hospedagem;