import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../types';

interface PackageItem {
    id: string;
    service_type: string;
    quantity: number;
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

interface PackageHotel {
    id: string;
    partner_id: string;
    avulso_price_per_night: number;
    partner: {
        id: string;
        company_name: string;
        category: string;
        logo_url: string | null;
        rating: number;
        city: string | null;
        state: string | null;
    };
}

interface HotelStay {
    partnerId: string;
    partnerName: string;
    nights: number;
    dates: string[];
    avulsoPrice: number;
}

type BookingStep = 'HOTELS' | 'DISTRIBUTE' | 'DATES' | 'SUMMARY';

const STEP_CONFIG: { key: BookingStep; label: string; icon: string }[] = [
    { key: 'HOTELS', label: 'Hotéis', icon: 'hotel' },
    { key: 'DISTRIBUTE', label: 'Diárias', icon: 'tune' },
    { key: 'DATES', label: 'Datas', icon: 'calendar_month' },
    { key: 'SUMMARY', label: 'Resumo', icon: 'receipt_long' },
];

const PackageBooking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [pkg, setPkg] = useState<Package | null>(null);
    const [hotels, setHotels] = useState<PackageHotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<BookingStep>('HOTELS');

    // Hotel selection & filters
    const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);
    const [nameFilter, setNameFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [serviceFilter, setServiceFilter] = useState<'todos' | 'hotel' | 'creche' | 'banho_tosa' | 'day_use'>('todos');

    // Distribution state: partnerId -> nights
    const [distribution, setDistribution] = useState<Record<string, number>>({});

    // Date state: partnerId -> array of date strings (YYYY-MM-DD)
    const [dates, setDates] = useState<Record<string, string[]>>({});

    const totalDiarias = useMemo(() => {
        const hotelItem = pkg?.items?.find(i => i.service_type === 'hotel');
        return hotelItem?.quantity || 0;
    }, [pkg]);

    const distributedTotal = useMemo(() => {
        return Object.values(distribution).reduce((sum: number, n: number) => sum + n, 0);
    }, [distribution]);

    const pricePerNightPackage = useMemo(() => {
        if (!pkg || totalDiarias === 0) return 0;
        return pkg.price / totalDiarias;
    }, [pkg, totalDiarias]);

    useEffect(() => {
        if (!id) {
            navigate('/packages');
            return;
        }
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch package with items
            const { data: pkgData, error: pkgError } = await supabase
                .from('packages')
                .select('*, items:package_items(*)')
                .eq('id', id)
                .single();

            if (pkgError || !pkgData) {
                navigate('/packages');
                return;
            }
            setPkg(pkgData);

            // Fetch linked hotels
            const { data: hotelData, error: hotelError } = await supabase
                .from('package_hotels')
                .select(`
                    id,
                    partner_id,
                    avulso_price_per_night,
                    partner:partners(id, company_name, category, logo_url, rating, city, state)
                `)
                .eq('package_id', id);

            if (!hotelError && hotelData) {
                setHotels(hotelData as unknown as PackageHotel[]);
            }
        } catch {
            navigate('/packages');
        } finally {
            setLoading(false);
        }
    };

    const getHotelImage = (hotel: PackageHotel) => {
        return hotel.partner?.logo_url || IMAGES.HOTEL_INTERIOR;
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

    const formatCurrency = (value: number): string => {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };

    const getMinDate = (): string => {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    };

    const canProceedFromDistribute = distributedTotal === totalDiarias;

    const canProceedFromDates = useMemo(() => {
        return Object.entries(distribution).every(([partnerId, nights]) => {
            if (nights === 0) return true;
            const hotelDates = dates[partnerId] || [];
            if (hotelDates.length !== nights) return false;
            if (hotelDates.some(d => !d)) return false;
            if (pkg?.type !== 'especial' && hotelDates.some(isWeekend)) return false;
            return true;
        });
    }, [distribution, dates, pkg]);

    // Hotels that are currently selected (subset of hotels array)
    const selectedHotels = hotels.filter(h => selectedHotelIds.includes(h.partner_id));

    // Derived list of unique cities from loaded hotels
    const availableCities = Array.from(new Set(hotels.map(h => h.partner?.city).filter(Boolean))) as string[];

    // Filtered hotel list for the selection UI
    const filteredHotels = hotels.filter(h => {
        const name = h.partner?.company_name?.toLowerCase() || '';
        const city = h.partner?.city?.toLowerCase() || '';
        const category = (h.partner?.category || '').toLowerCase();
        if (nameFilter && !name.includes(nameFilter.toLowerCase())) return false;
        if (cityFilter && city !== cityFilter.toLowerCase()) return false;
        if (serviceFilter !== 'todos') {
            if (serviceFilter === 'hotel' && category !== 'hotel') return false;
            if (serviceFilter === 'creche' && category !== 'creche') return false;
            if (serviceFilter === 'banho_tosa' && category !== 'banho e tosa') return false;
            if (serviceFilter === 'day_use' && !category.includes('day')) return false;
        }
        return true;
    });

    const toggleHotelSelection = (partnerId: string) => {
        setSelectedHotelIds(prev =>
            prev.includes(partnerId) ? prev.filter(id => id !== partnerId) : [...prev, partnerId]
        );
    };

    const handleAdvanceFromHotels = () => {
        if (selectedHotelIds.length === 0) return;
        // Initialize distribution with 0 for each selected hotel
        const initDist: Record<string, number> = {};
        selectedHotelIds.forEach(id => { initDist[id] = 0; });
        setDistribution(initDist);
        setStep('DISTRIBUTE');
    };

    const buildStays = (): HotelStay[] => {
        return Object.entries(distribution)
            .filter(([, nights]) => (nights as number) > 0)
            .map(([partnerId, nights]) => {
                const n = nights as number;
                const hotel = hotels.find(h => h.partner_id === partnerId);
                return {
                    partnerId,
                    partnerName: hotel?.partner?.company_name || 'Hotel',
                    nights: n,
                    dates: dates[partnerId] || [],
                    avulsoPrice: hotel?.avulso_price_per_night || 0,
                };
            });
    };

    const handleContinueToCheckout = () => {
        const stays = buildStays();
        navigate(`/checkout/${id}`, {
            state: {
                bookingStays: stays,
                totalDiarias,
                pricePerNightPackage,
            },
        });
    };

    // --- Step index for progress bar ---
    const stepIndex = STEP_CONFIG.findIndex(s => s.key === step);

    if (loading) {
        return (
            <div className="flex-grow w-full flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    <p className="text-gray-500 text-sm">Carregando pacote...</p>
                </div>
            </div>
        );
    }

    if (!pkg) return null;

    return (
        <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm mb-6 text-gray-500">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link to="/packages" className="hover:text-primary transition-colors">Pacotes</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link to={`/package/${id}`} className="hover:text-primary transition-colors">{pkg.name}</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="font-semibold text-[#181310]">Reserva</span>
            </nav>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
                {STEP_CONFIG.map((s, i) => (
                    <React.Fragment key={s.key}>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                stepIndex >= i
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-gray-100 text-gray-400'
                            }`}>
                                {stepIndex > i
                                    ? <span className="material-symbols-outlined text-lg">check</span>
                                    : <span className="material-symbols-outlined text-lg">{s.icon}</span>
                                }
                            </div>
                            <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                                stepIndex >= i ? 'text-gray-900' : 'text-gray-400'
                            }`}>{s.label}</span>
                        </div>
                        {i < STEP_CONFIG.length - 1 && (
                            <div className={`w-8 sm:w-14 h-0.5 rounded-full transition-colors ${
                                stepIndex > i ? 'bg-primary' : 'bg-gray-200'
                            }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Package Info Banner */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-8 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">package_2</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 text-lg truncate">{pkg.name}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            pkg.type === 'especial' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {pkg.type === 'especial' ? '⭐ Especial' : 'Básico'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 font-semibold">{totalDiarias} diárias</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm font-black text-primary">{formatCurrency(pkg.price)}</span>
                    </div>
                </div>
            </div>

            {/* ============= STEP 1: HOTELS ============= */}
            {step === 'HOTELS' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Escolha as Hospedagens</h3>
                        <p className="text-sm text-gray-500">Selecione um ou mais hotéis parceiros para distribuir suas diárias. Use os filtros para encontrar o ideal.</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                        {/* Name search */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                            <input
                                type="text"
                                placeholder="Buscar por nome..."
                                value={nameFilter}
                                onChange={e => setNameFilter(e.target.value)}
                                className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* City filter */}
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">location_on</span>
                                <select
                                    value={cityFilter}
                                    onChange={e => setCityFilter(e.target.value)}
                                    className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white appearance-none"
                                >
                                    <option value="">Todas as cidades</option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city.toLowerCase()}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Service type filter */}
                            <div className="flex gap-1.5 flex-wrap">
                                {([
                                    { key: 'todos', label: 'Todos' },
                                    { key: 'hotel', label: 'Hotel' },
                                    { key: 'creche', label: 'Creche' },
                                    { key: 'banho_tosa', label: 'Banho & Tosa' },
                                    { key: 'day_use', label: 'Day Use' },
                                ] as const).map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setServiceFilter(opt.key)}
                                        className={`px-3 h-11 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                                            serviceFilter === opt.key
                                                ? 'bg-primary border-primary text-white'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-xs text-gray-400">{filteredHotels.length} hospedagem(ns) encontrada(s)</p>
                    </div>

                    {/* Hotel cards */}
                    {filteredHotels.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">search_off</span>
                            <p className="text-gray-500 font-medium">Nenhuma hospedagem encontrada.</p>
                            <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredHotels.map((hotel) => {
                                const isSelected = selectedHotelIds.includes(hotel.partner_id);
                                return (
                                <div
                                    key={hotel.id}
                                    onClick={() => toggleHotelSelection(hotel.partner_id)}
                                    className={`group cursor-pointer rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${
                                        isSelected
                                            ? 'border-primary shadow-primary/20'
                                            : 'border-gray-100 hover:border-gray-300 hover:shadow-md'
                                    }`}
                                >
                                    <div className="relative h-40 bg-gray-200">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                            style={{ backgroundImage: `url('${getHotelImage(hotel)}')` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Selection indicator */}
                                        <div className={`absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                            isSelected ? 'bg-primary border-primary' : 'bg-white/70 border-white/80 backdrop-blur-sm'
                                        }`}>
                                            {isSelected && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                        </div>

                                        <div className="absolute top-3 left-3">
                                            <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                                <span className="material-symbols-outlined text-blue-500 text-[14px]">verified</span>
                                                Verificado
                                            </div>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <h4 className="text-lg font-bold drop-shadow-sm">{hotel.partner?.company_name}</h4>
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                                                    <span className="material-symbols-outlined text-yellow-400 text-[14px]">star</span>
                                                    <span className="text-xs">{hotel.partner?.rating || '—'}</span>
                                                </div>
                                                {hotel.partner?.city && (
                                                    <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm text-xs">
                                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                        {hotel.partner.city}{hotel.partner.state && `, ${hotel.partner.state}`}
                                                    </div>
                                                )}
                                                {hotel.partner?.category && (
                                                    <div className="flex items-center gap-1 bg-primary/70 px-2 py-0.5 rounded-lg backdrop-blur-sm text-xs">
                                                        {hotel.partner.category}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`p-3 border-t flex items-center justify-between text-xs font-semibold transition-colors ${
                                        isSelected ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-gray-50/50 border-gray-100 text-gray-400'
                                    }`}>
                                        <span>{isSelected ? '✓ Selecionado' : 'Clique para selecionar'}</span>
                                        {hotel.partner?.category && <span className="text-gray-400">{hotel.partner.category}</span>}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}

                    {selectedHotelIds.length > 0 && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white p-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center gap-3 animate-in slide-in-from-bottom-5 z-30">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-full shrink-0">
                                <span className="material-symbols-outlined">check</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">{selectedHotelIds.length} hospedagem(ns) selecionada(s)</p>
                                <p className="text-[11px] text-gray-500">Pronto para distribuir as diárias</p>
                            </div>
                            <button
                                onClick={handleAdvanceFromHotels}
                                className="h-11 px-5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shrink-0"
                            >
                                Continuar
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
                            Distribua suas <strong>{totalDiarias} diárias</strong> entre os hotéis. Máximo de 3 diárias por hotel.
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
                        {selectedHotels.map((hotel) => {
                            const nights = distribution[hotel.partner_id] || 0;
                            return (
                                <div key={hotel.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200"
                                            style={{ backgroundImage: `url('${getHotelImage(hotel)}')` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate">{hotel.partner?.company_name}</h4>
                                            {hotel.partner?.city && <p className="text-xs text-gray-400">{hotel.partner.city}</p>}
                                        </div>
                                        <span className={`text-2xl font-black ${nights > 0 ? 'text-primary' : 'text-gray-300'}`}>
                                            {nights}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                if (nights > 0) {
                                                    setDistribution(prev => ({ ...prev, [hotel.partner_id]: nights - 1 }));
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
                                                style={{ width: `${totalDiarias > 0 ? (nights / totalDiarias) * 100 : 0}%` }}
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (distributedTotal < totalDiarias) {
                                                    setDistribution(prev => ({ ...prev, [hotel.partner_id]: nights + 1 }));
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
                            onClick={() => { setSelectedHotelIds([]); setDistribution({}); setStep('HOTELS'); }}
                            className="h-14 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Voltar
                        </button>
                        <button
                            onClick={() => {
                                setDates(prev => {
                                    const next = { ...prev };
                                    Object.entries(distribution).forEach(([partnerId, nightsRaw]) => {
                                        const nights = nightsRaw as number;
                                        if (nights > 0) {
                                            const currentDates = next[partnerId] || [];
                                            if (currentDates.length !== nights) {
                                                next[partnerId] = Array.from({ length: nights }, (_, i) => currentDates[i] || '');
                                            }
                                        } else {
                                            delete next[partnerId];
                                        }
                                    });
                                    return next;
                                });
                                setStep('DATES');
                            }}
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
                            Escolha a data de check-in para cada hotel.
                            {pkg.type !== 'especial' && (
                                <span className="text-amber-600 font-semibold"> Plano Básico: somente dias úteis.</span>
                            )}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(distribution)
                            .filter(([, nights]) => (nights as number) > 0)
                            .map(([partnerId, nightsRaw]) => {
                                const nights = nightsRaw as number;
                                const hotel = selectedHotels.find(h => h.partner_id === partnerId) || hotels.find(h => h.partner_id === partnerId);
                                const hotelDates = dates[partnerId] || Array(nights).fill('');

                                return (
                                    <div key={partnerId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                                            <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200"
                                                style={{ backgroundImage: `url('${getHotelImage(hotel!)}')` }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{hotel?.partner?.company_name}</h4>
                                                <p className="text-xs text-gray-500 font-semibold">{nights} diária{nights > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {hotelDates.map((currentDate, idx) => {
                                                const isInvalid = currentDate && pkg.type !== 'especial' && isWeekend(currentDate);
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
                                                                Plano Básico: apenas dias úteis
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
                            onClick={() => setStep('DISTRIBUTE')}
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
                const stays = buildStays();
                const totalAvulso = stays.reduce((sum, s) => sum + (s.avulsoPrice * s.nights), 0);
                const economia = totalAvulso - pkg.price;

                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Resumo da Reserva</h3>
                            <p className="text-sm text-gray-500">Confira os detalhes antes de ir para o pagamento.</p>
                        </div>

                        {/* Hotel Stay Cards */}
                        <div className="space-y-4">
                            {stays.map((stay, idx) => {
                                const hotel = hotels.find(h => h.partner_id === stay.partnerId);
                                return (
                                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200"
                                                style={{ backgroundImage: `url('${getHotelImage(hotel!)}')` }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{stay.partnerName}</h4>
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
                                );
                            })}
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

export default PackageBooking;
