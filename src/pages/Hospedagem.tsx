import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { supabase } from '../lib/supabase';

type BookingStep = 'ITEMS' | 'DISTRIBUTE' | 'DATES' | 'SUMMARY';

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

    // Selected partners (IDs)
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);

    // Distribution: partnerId -> nights
    const [distribution, setDistribution] = useState<Record<string, number>>({});

    // Dates: partnerId -> array of date strings
    const [dates, setDates] = useState<Record<string, string[]>>({});

    const totalDiarias = 5; // Default package quantity (could be dynamic)

    const distributedTotal = useMemo(() => {
        return Object.values(distribution).reduce((sum, n) => sum + n, 0);
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
        Object.entries(distribution).forEach(([partnerId, nights]) => {
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
        return Object.entries(distribution).every(([partnerId, nights]) => {
            if (nights === 0) return true;
            const hotelDates = dates[partnerId] || [];
            if (hotelDates.length !== nights) return false;
            if (hotelDates.some(d => !d)) return false;
            if (hotelDates.some(isWeekend)) return false;
            return true;
        });
    }, [distribution, dates]);

    const handleContinueToCheckout = () => {
        const stays = Object.entries(distribution)
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
        <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
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
            {step === 'ITEMS' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Escolha os Parceiros</h3>
                        <p className="text-sm text-gray-500">Selecione os hotéis e creches onde deseja hospedar seu pet. Você pode escolher mais de um.</p>
                    </div>

                    {partners.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">hotel</span>
                            <p className="text-gray-500 font-medium">Nenhum parceiro disponível no momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {partners.map((partner) => {
                                const isSelected = selectedPartners.includes(partner.id);
                                return (
                                    <div
                                        key={partner.id}
                                        onClick={() => togglePartnerSelection(partner.id)}
                                        className={`group bg-white rounded-2xl border-2 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                                            isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'
                                        }`}
                                    >
                                        <div className="relative h-40 bg-gray-200">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                                style={{ backgroundImage: `url('${getPartnerImage(partner)}')` }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                            {/* Selection Checkbox */}
                                            <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                                isSelected ? 'bg-primary' : 'bg-white/80 backdrop-blur-sm'
                                            }`}>
                                                {isSelected && <span className="material-symbols-outlined text-white text-[18px]">check</span>}
                                            </div>

                                            <div className="absolute top-3 left-3">
                                                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-blue-500 text-[14px]">verified</span>
                                                    {partner.category}
                                                </div>
                                            </div>

                                            <div className="absolute bottom-3 left-3 right-3 text-white">
                                                <h4 className="text-lg font-bold drop-shadow-sm">{partner.company_name}</h4>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                                                        <span className="material-symbols-outlined text-yellow-400 text-[14px]">star</span>
                                                        <span className="text-xs">{partner.rating || '—'}</span>
                                                    </div>
                                                    {partner.city && (
                                                        <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm text-xs">
                                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                            {partner.city}{partner.state && `, ${partner.state}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                            <span className="text-xs text-gray-400 italic">Parceiro verificado</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite({
                                                        id: partner.id,
                                                        name: partner.company_name,
                                                        type: partner.category,
                                                        image: getPartnerImage(partner),
                                                        rating: partner.rating,
                                                        location: partner.city || 'Parceiro PetGoH',
                                                    });
                                                }}
                                                className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <span className={`material-symbols-outlined text-[20px] ${isFavorite(partner.id) ? 'fill-current text-red-500' : 'text-gray-300 hover:text-red-400'}`}>
                                                    favorite
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {selectedPartners.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                                <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                                <span className="text-sm font-medium text-green-800">{selectedPartners.length} parceiro{selectedPartners.length > 1 ? 's' : ''} selecionado{selectedPartners.length > 1 ? 's' : ''}</span>
                            </div>
                            <button
                                onClick={handleAdvanceFromItems}
                                className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                {selectedPartners.length === 1 ? 'Escolher Datas' : 'Distribuir Diárias'}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ============= STEP 2: DISTRIBUTE ============= */}
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
                            onClick={() => setStep('ITEMS')}
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

            {/* ============= STEP 3: DATES ============= */}
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
                        {Object.entries(distribution)
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
                            onClick={() => setStep(selectedPartners.length > 1 ? 'DISTRIBUTE' : 'ITEMS')}
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

            {/* ============= STEP 4: SUMMARY ============= */}
            {step === 'SUMMARY' && (() => {
                const stays = Object.entries(distribution)
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