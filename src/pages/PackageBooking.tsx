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
    checkIn: string;
    checkOut: string;
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

    // Distribution state: partnerId -> nights
    const [distribution, setDistribution] = useState<Record<string, number>>({});

    // Date state: partnerId -> checkIn date string (YYYY-MM-DD)
    const [dates, setDates] = useState<Record<string, string>>({});

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

                // Initialize distribution with 0 for each hotel
                const initDist: Record<string, number> = {};
                hotelData.forEach((h: any) => {
                    initDist[h.partner_id] = 0;
                });
                setDistribution(initDist);
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

    const addCheckOutDate = (checkIn: string, nights: number): string => {
        const date = new Date(checkIn + 'T12:00:00');
        date.setDate(date.getDate() + nights);
        return date.toISOString().split('T')[0];
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
            const checkIn = dates[partnerId];
            if (!checkIn) return false;
            if (pkg?.type !== 'especial' && isWeekend(checkIn)) return false;
            return true;
        });
    }, [distribution, dates, pkg]);

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
                    checkIn: dates[partnerId] || '',
                    checkOut: addCheckOutDate(dates[partnerId] || '', n),
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
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Hotéis do Pacote</h3>
                        <p className="text-sm text-gray-500">Esses são os hotéis parceiros inclusos no seu pacote. Na próxima etapa você distribuirá suas diárias.</p>
                    </div>

                    {hotels.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">hotel</span>
                            <p className="text-gray-500 font-medium">Nenhum hotel vinculado a este pacote.</p>
                            <p className="text-gray-400 text-sm mt-1">Entre em contato com o suporte.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {hotels.map((hotel) => (
                                <div key={hotel.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                                    <div className="relative h-40 bg-gray-200">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                            style={{ backgroundImage: `url('${getHotelImage(hotel)}')` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

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
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs text-gray-400 font-medium">Diária Avulsa</span>
                                                <p className="text-lg font-bold text-gray-900">{formatCurrency(hotel.avulso_price_per_night)}<span className="text-xs font-normal text-gray-400">/noite</span></p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-green-600 font-medium">No Pacote</span>
                                                <p className="text-lg font-bold text-green-600">{formatCurrency(pricePerNightPackage)}<span className="text-xs font-normal">/noite</span></p>
                                            </div>
                                        </div>
                                        {hotel.avulso_price_per_night > pricePerNightPackage && (
                                            <div className="mt-2 bg-green-50 text-green-700 rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm">savings</span>
                                                Economia de {formatCurrency(hotel.avulso_price_per_night - pricePerNightPackage)} por noite
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {hotels.length > 0 && (
                        <button
                            onClick={() => setStep('DISTRIBUTE')}
                            className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            Distribuir Diárias
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
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
                        {hotels.map((hotel) => {
                            const nights = distribution[hotel.partner_id] || 0;
                            return (
                                <div key={hotel.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200"
                                            style={{ backgroundImage: `url('${getHotelImage(hotel)}')` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate">{hotel.partner?.company_name}</h4>
                                            <p className="text-xs text-gray-400">Max 3 diárias</p>
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
                                                style={{ width: `${(nights / 3) * 100}%` }}
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (nights < 3 && distributedTotal < totalDiarias) {
                                                    setDistribution(prev => ({ ...prev, [hotel.partner_id]: nights + 1 }));
                                                }
                                            }}
                                            disabled={nights >= 3 || distributedTotal >= totalDiarias}
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
                            onClick={() => setStep('HOTELS')}
                            className="h-14 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Voltar
                        </button>
                        <button
                            onClick={() => setStep('DATES')}
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
                                const hotel = hotels.find(h => h.partner_id === partnerId);
                                const checkIn = dates[partnerId] || '';
                                const checkOut = checkIn ? addCheckOutDate(checkIn, nights) : '';
                                const isInvalid = checkIn && pkg.type !== 'especial' && isWeekend(checkIn);

                                return (
                                    <div key={partnerId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200"
                                                style={{ backgroundImage: `url('${getHotelImage(hotel!)}')` }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{hotel?.partner?.company_name}</h4>
                                                <p className="text-xs text-gray-500 font-semibold">{nights} diária{nights > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">CHECK-IN</label>
                                                <input
                                                    type="date"
                                                    min={getMinDate()}
                                                    value={checkIn}
                                                    onChange={(e) => setDates(prev => ({ ...prev, [partnerId]: e.target.value }))}
                                                    className={`w-full h-12 px-4 rounded-xl border-2 text-sm font-medium outline-none transition-colors ${
                                                        isInvalid
                                                            ? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500'
                                                            : checkIn
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
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">CHECK-OUT</label>
                                                <div className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium flex items-center text-gray-500">
                                                    {checkOut ? formatDate(checkOut) : '—'}
                                                </div>
                                            </div>
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

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <span className="text-xs text-gray-400 font-medium">Check-in</span>
                                                <p className="text-sm font-bold text-gray-900">{formatDate(stay.checkIn)}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <span className="text-xs text-gray-400 font-medium">Check-out</span>
                                                <p className="text-sm font-bold text-gray-900">{formatDate(stay.checkOut)}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-3 space-y-1.5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Preço avulso ({stay.nights}x {formatCurrency(stay.avulsoPrice)})</span>
                                                <span className="text-gray-400 line-through">{formatCurrency(stay.avulsoPrice * stay.nights)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-green-600 font-semibold">Preço no pacote ({stay.nights}x {formatCurrency(pricePerNightPackage)})</span>
                                                <span className="text-green-600 font-bold">{formatCurrency(pricePerNightPackage * stay.nights)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Price Comparison */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total avulso ({totalDiarias} diárias)</span>
                                    <span className="text-gray-400 line-through font-medium">{formatCurrency(totalAvulso)}</span>
                                </div>
                                <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                                    <span className="font-bold text-gray-900">Total com Pacote</span>
                                    <span className="text-2xl font-black text-primary">{formatCurrency(pkg.price)}</span>
                                </div>
                                {economia > 0 && (
                                    <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-green-600">savings</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-green-700">Você economiza {formatCurrency(economia)}</p>
                                            <p className="text-xs text-green-600">Comparado ao preço avulso dos hotéis</p>
                                        </div>
                                    </div>
                                )}
                            </div>
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
