import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { supabase } from '../lib/supabase';

const PartnerFavoriteButton: React.FC<{ isFav: boolean, onToggle: (e: React.MouseEvent) => void }> = ({ isFav, onToggle }) => {
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
    city: string | null;
    state: string | null;
}

const SERVICE_IMAGES: Record<string, string> = {
    'Banho & Secagem': IMAGES.DOG_IN_BATH || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7',
    'Banho + Tosa Higiênica': IMAGES.VET_EXAM || 'https://images.unsplash.com/photo-1596272875729-ed2c21d50c44',
    'Tosa Completa (Tesoura/Máquina)': IMAGES.PACKAGE_HERO || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7',
    'Spa Day & Hidratação': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=2070&auto=format&fit=crop',
    'Carding (Remoção de Subpelo)': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2688&auto=format&fit=crop',
};

const SERVICE_BADGES: Record<string, string> = {
    'Banho & Secagem': 'Popular',
    'Banho + Tosa Higiênica': 'Mais Vendido',
    'Spa Day & Hidratação': 'Premium',
};

const AVAILABLE_TIMES = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const STEP_CONFIG: { key: BookingStep; label: string; icon: string }[] = [
    { key: 'ITEMS', label: 'Serviços', icon: 'spa' },
    { key: 'QUANTITY', label: 'Quantidade', icon: 'tag' },
    { key: 'DISTRIBUTE', label: 'Sessões', icon: 'tune' },
    { key: 'DATES', label: 'Datas', icon: 'calendar_month' },
    { key: 'SUMMARY', label: 'Resumo', icon: 'receipt_long' },
];

const Estetica: React.FC = () => {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();

    const [services, setServices] = useState<BeautyService[]>([]);
    const [partners, setPartners] = useState<GroomingPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<BookingStep>('ITEMS');

    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
    const [selectedService, setSelectedService] = useState<BeautyService | null>(null);
    const [distribution, setDistribution] = useState<Record<string, number>>({});
    const [appointments, setAppointments] = useState<Record<string, { date: string; time: string }[]>>({});

    const [totalSessions, setTotalSessions] = useState(1);
    const distributedTotal = useMemo(() => (Object.values(distribution) as number[]).reduce((sum, n) => sum + n, 0), [distribution]);
    const canProceedFromDistribute = distributedTotal === totalSessions;

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [servicesRes, partnersRes] = await Promise.all([
                supabase.from('beauty_services').select('*').eq('is_active', true).order('price'),
                supabase.from('partners').select('*').eq('category', 'Banho e Tosa').eq('status', 'active').order('rating', { ascending: false }),
            ]);
            if (servicesRes.data) setServices(servicesRes.data);
            if (partnersRes.data) setPartners(partnersRes.data);
        } catch (err) {
            console.error('Erro ao carregar dados de estética:', err);
        } finally { setLoading(false); }
    };

    const getServiceImage = (name: string) => SERVICE_IMAGES[name] || IMAGES.PACKAGE_HERO;

    const togglePartnerSelection = (partnerId: string) => {
        setSelectedPartners(prev => prev.includes(partnerId) ? prev.filter(id => id !== partnerId) : [...prev, partnerId]);
    };

    const handleAdvanceFromItems = () => {
        if (selectedPartners.length === 0 || !selectedService) return;
        setStep('QUANTITY');
    };

    const handleAdvanceFromQuantity = () => {
        const initDist: Record<string, number> = {};
        selectedPartners.forEach(id => { initDist[id] = 0; });

        if (selectedPartners.length === 1) {
            initDist[selectedPartners[0]] = totalSessions;
            setDistribution(initDist);
            setAppointments({ [selectedPartners[0]]: Array(totalSessions).fill(null).map(() => ({ date: '', time: '' })) });
            setStep('DATES');
        } else {
            setDistribution(initDist);
            setStep('DISTRIBUTE');
        }
    };

    const handleAdvanceFromDistribute = () => {
        const initAppt: Record<string, { date: string; time: string }[]> = {};
        (Object.entries(distribution) as [string, number][]).forEach(([partnerId, sessions]) => {
            if (sessions > 0) initAppt[partnerId] = Array(sessions).fill(null).map(() => ({ date: '', time: '' }));
        });
        setAppointments(initAppt);
        setStep('DATES');
    };

    const getMinDate = (): string => {
        const today = new Date(); today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    };

    const formatDate = (dateStr: string): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const canProceedFromDates = useMemo(() => {
        return (Object.entries(distribution) as [string, number][]).every(([partnerId, sessions]) => {
            if (sessions === 0) return true;
            const appts = appointments[partnerId] || [];
            if (appts.length !== sessions) return false;
            return appts.every(a => a.date && a.time);
        });
    }, [distribution, appointments]);

    const handleContinueToCheckout = () => {
        const stays = (Object.entries(distribution) as [string, number][])
            .filter(([, s]) => s > 0)
            .map(([partnerId, sessions]) => {
                const partner = partners.find(p => p.id === partnerId);
                return {
                    partnerId,
                    partnerName: partner?.company_name || 'Salão',
                    nights: sessions,
                    dates: (appointments[partnerId] || []).map(a => a.date),
                    times: (appointments[partnerId] || []).map(a => a.time),
                    service: selectedService,
                };
            });

        navigate('/checkout/estetica', {
            state: { bookingStays: stays, totalDiarias: totalSessions, category: 'estetica', service: selectedService },
        });
    };

    const visibleSteps = selectedPartners.length <= 1 ? STEP_CONFIG.filter(s => s.key !== 'DISTRIBUTE') : STEP_CONFIG;
    const visibleStepIndex = visibleSteps.findIndex(s => s.key === step);

    if (loading) {
        return (
            <div className="flex-grow w-full flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    <p className="text-gray-500 text-sm">Carregando serviços de estética...</p>
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
                <span className="font-semibold text-[#181310]">Banho & Tosa</span>
            </nav>

            {/* Hero */}
            <div className="relative rounded-2xl overflow-hidden h-48 mb-8 group">
                <img src={IMAGES.PACKAGE_HERO} alt="Estética" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center p-6 sm:p-8">
                    <div>
                        <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1">Cuidado Profissional</h1>
                        <p className="text-gray-200 text-sm sm:text-base max-w-md">Os melhores profissionais de banho, tosa e spa para o seu pet.</p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
                {visibleSteps.map((s, i) => (
                    <React.Fragment key={s.key}>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${visibleStepIndex >= i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400'}`}>
                                {visibleStepIndex > i ? <span className="material-symbols-outlined text-lg">check</span> : <span className="material-symbols-outlined text-lg">{s.icon}</span>}
                            </div>
                            <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${visibleStepIndex >= i ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                        </div>
                        {i < visibleSteps.length - 1 && <div className={`w-8 sm:w-14 h-0.5 rounded-full transition-colors ${visibleStepIndex > i ? 'bg-primary' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {/* ===== STEP 1: SERVICE + PARTNER SELECTION ===== */}
            {step === 'ITEMS' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* Service Selection */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">1. Escolha o Serviço</h3>
                        <p className="text-sm text-gray-500 mb-4">Selecione o serviço de estética que deseja agendar.</p>

                        <div className="grid grid-cols-1 gap-3">
                            {services.map((service) => {
                                const badge = SERVICE_BADGES[service.name];
                                const isSelected = selectedService?.id === service.id;
                                return (
                                    <div key={service.id} onClick={() => setSelectedService(service)}
                                        className={`bg-white rounded-2xl p-4 border-2 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'}`}>
                                        {badge && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">{badge}</div>}
                                        <div className="size-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={getServiceImage(service.name)} alt={service.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 truncate text-sm pr-8">{service.name}</h4>
                                            {service.description && <p className="text-xs text-gray-400 line-clamp-1">{service.description}</p>}
                                            <span className="text-sm font-bold text-secondary">A partir de R$ {service.price?.toFixed(2)}</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary' : 'bg-gray-100'}`}>
                                            {isSelected && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Partner Selection */}
                    {selectedService && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">2. Escolha o Salão</h3>
                            <p className="text-sm text-gray-500 mb-4">Selecione o salão para o atendimento.</p>

                            {partners.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">spa</span>
                                    <p className="text-gray-500 font-medium">Nenhum salão disponível no momento.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {partners.map((partner) => {
                                        const isSelected = selectedPartners.includes(partner.id);
                                        return (
                                            <div key={partner.id} onClick={() => togglePartnerSelection(partner.id)}
                                                className={`group bg-white rounded-2xl border-2 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'}`}>
                                                <div className="relative h-36 bg-gray-200">
                                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${partner.logo_url || IMAGES.PACKAGE_HERO}')` }} />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                    <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-primary' : 'bg-white/80 backdrop-blur-sm'}`}>
                                                        {isSelected && <span className="material-symbols-outlined text-white text-[18px]">check</span>}
                                                    </div>
                                                    <div className="absolute top-3 left-3">
                                                        <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-blue-500 text-[14px]">verified</span>{partner.category}
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-3 left-3 right-3 text-white">
                                                        <h4 className="text-lg font-bold drop-shadow-sm">{partner.company_name}</h4>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <span className="material-symbols-outlined text-yellow-400 text-[14px]">star</span>
                                                            <span className="text-xs">{partner.rating || '—'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                                    <span className="text-xs text-gray-400 italic">Parceiro verificado</span>
                                                    <PartnerFavoriteButton isFav={isFavorite(partner.id)} onToggle={(e) => { e.stopPropagation(); toggleFavorite({ id: partner.id, name: partner.company_name, type: partner.category, image: partner.logo_url || IMAGES.PACKAGE_HERO, rating: partner.rating, location: partner.city || 'Parceiro PetGoH' }); }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedService && selectedPartners.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                                <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                                <span className="text-sm font-medium text-green-800">{selectedService.name} • {selectedPartners.length} salão(ões)</span>
                            </div>
                            <button onClick={handleAdvanceFromItems} className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                Continuar
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ===== STEP 2: QUANTITY ===== */}
            {step === 'QUANTITY' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Quantas Sessões / Consultas?</h3>
                        <p className="text-sm text-gray-500">Informe quantas sessões de {selectedService?.name?.toLowerCase() || 'serviço'} você precisa.</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center space-y-6">
                        <div className="text-gray-400">
                            <span className="material-symbols-outlined text-6xl">spa</span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setTotalSessions(Math.max(1, totalSessions - 1))}
                                className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors disabled:opacity-50"
                                disabled={totalSessions <= 1}
                            >
                                <span className="material-symbols-outlined text-2xl">remove</span>
                            </button>
                            
                            <div className="w-24 text-center">
                                <span className="text-5xl font-black text-gray-900">{totalSessions}</span>
                                <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Sessões</span>
                            </div>

                            <button 
                                onClick={() => setTotalSessions(Math.min(10, totalSessions + 1))}
                                className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                disabled={totalSessions >= 10}
                            >
                                <span className="material-symbols-outlined text-2xl">add</span>
                            </button>
                        </div>
                    </div>

                    {selectedService && selectedService.price > 0 && (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-sm font-bold text-blue-900 block">Total Estimado</span>
                                <span className="text-xs text-blue-700">R$ {selectedService.price.toFixed(2)} × {totalSessions} {totalSessions === 1 ? 'sessão' : 'sessões'}</span>
                            </div>
                            <span className="text-2xl font-black text-secondary">
                                R$ {(selectedService.price * totalSessions).toFixed(2)}
                            </span>
                        </div>
                    )}

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

            {/* ===== STEP 3: DISTRIBUTE ===== */}
            {step === 'DISTRIBUTE' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Distribuir Sessões</h3>
                        <p className="text-sm text-gray-500">Distribua suas <strong>{totalSessions} sessão(ões)</strong> entre os salões.</p>
                    </div>

                    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${canProceedFromDistribute ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                        <span className="text-sm font-semibold text-gray-700">Sessões distribuídas</span>
                        <span className={`text-2xl font-black ${canProceedFromDistribute ? 'text-green-600' : 'text-gray-900'}`}>{distributedTotal} / {totalSessions}</span>
                    </div>

                    <div className="space-y-4">
                        {selectedPartners.map(partnerId => {
                            const partner = partners.find(p => p.id === partnerId);
                            if (!partner) return null;
                            const sessions = distribution[partnerId] || 0;
                            return (
                                <div key={partnerId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200" style={{ backgroundImage: `url('${partner.logo_url || IMAGES.PACKAGE_HERO}')` }} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate">{partner.company_name}</h4>
                                            <p className="text-xs text-gray-400">{partner.category}</p>
                                        </div>
                                        <span className={`text-2xl font-black ${sessions > 0 ? 'text-primary' : 'text-gray-300'}`}>{sessions}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => { if (sessions > 0) setDistribution(prev => ({ ...prev, [partnerId]: sessions - 1 })); }} disabled={sessions <= 0} className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30">
                                            <span className="material-symbols-outlined text-xl">remove</span>
                                        </button>
                                        <div className="flex-1 bg-gray-100 rounded-xl h-3 overflow-hidden">
                                            <div className="h-full bg-primary rounded-xl transition-all duration-300" style={{ width: `${(sessions / totalSessions) * 100}%` }} />
                                        </div>
                                        <button onClick={() => { if (distributedTotal < totalSessions) setDistribution(prev => ({ ...prev, [partnerId]: sessions + 1 })); }} disabled={distributedTotal >= totalSessions} className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-30">
                                            <span className="material-symbols-outlined text-xl">add</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep('QUANTITY')} className="h-14 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Voltar
                        </button>
                        <button onClick={handleAdvanceFromDistribute} disabled={!canProceedFromDistribute} className="flex-1 h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            Escolher Data e Horário<span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ===== STEP 4: DATES + TIME ===== */}
            {step === 'DATES' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Data & Horário</h3>
                        <p className="text-sm text-gray-500">Selecione <strong>primeiro o dia</strong>, depois o <strong>horário</strong> disponível.</p>
                    </div>

                    <div className="space-y-4">
                        {(Object.entries(distribution) as [string, number][]).filter(([, s]) => s > 0).map(([partnerId, sessions]) => {
                            const partner = partners.find(p => p.id === partnerId);
                            const appts = appointments[partnerId] || Array(sessions).fill(null).map(() => ({ date: '', time: '' }));
                            return (
                                <div key={partnerId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                                        <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200" style={{ backgroundImage: `url('${partner?.logo_url || IMAGES.PACKAGE_HERO}')` }} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate">{partner?.company_name}</h4>
                                            <p className="text-xs text-gray-500 font-semibold">{sessions} sessão(ões)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        {appts.map((appt: { date: string; time: string }, idx: number) => (
                                            <div key={idx} className="space-y-3">
                                                <label className="text-xs font-bold text-gray-500 block">Sessão {idx + 1}</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-gray-400 mb-1 block">Dia</label>
                                                        <input type="date" min={getMinDate()} value={appt.date}
                                                            onChange={(e) => {
                                                                setAppointments(prev => {
                                                                    const next = { ...prev };
                                                                    const arr = [...(next[partnerId] || [])];
                                                                    arr[idx] = { ...arr[idx], date: e.target.value, time: '' };
                                                                    next[partnerId] = arr;
                                                                    return next;
                                                                });
                                                            }}
                                                            className={`w-full h-12 px-4 rounded-xl border-2 text-sm font-medium outline-none transition-colors ${appt.date ? 'border-green-200 bg-green-50 text-gray-900' : 'border-gray-200 bg-white text-gray-900 focus:border-primary'}`}
                                                        />
                                                    </div>

                                                    {appt.date && (
                                                        <div>
                                                            <label className="text-xs text-gray-400 mb-1 block">Horário</label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {AVAILABLE_TIMES.map(time => (
                                                                    <button key={time} onClick={() => {
                                                                        setAppointments(prev => {
                                                                            const next = { ...prev };
                                                                            const arr = [...(next[partnerId] || [])];
                                                                            arr[idx] = { ...arr[idx], time };
                                                                            next[partnerId] = arr;
                                                                            return next;
                                                                        });
                                                                    }}
                                                                        className={`py-2 rounded-lg text-xs font-semibold transition-all ${appt.time === time ? 'bg-primary text-white shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                                                                        {time}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep(selectedPartners.length > 1 ? 'DISTRIBUTE' : 'ITEMS')} className="h-14 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Voltar
                        </button>
                        <button onClick={() => setStep('SUMMARY')} disabled={!canProceedFromDates} className="flex-1 h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            Ver Resumo<span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ===== STEP 5: SUMMARY ===== */}
            {step === 'SUMMARY' && (() => {
                const stays = (Object.entries(distribution) as [string, number][]).filter(([, s]) => s > 0).map(([partnerId, sessions]) => ({
                    partnerId, partner: partners.find(p => p.id === partnerId), sessions, appointments: appointments[partnerId] || [],
                }));
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Resumo do Agendamento</h3>
                            <p className="text-sm text-gray-500">Confira os detalhes antes de ir para o pagamento.</p>
                        </div>

                        {selectedService && (
                            <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <span className="material-symbols-outlined text-blue-600 text-xl">spa</span>
                                <div>
                                    <p className="text-sm font-bold text-blue-900">{selectedService.name}</p>
                                    <p className="text-xs text-blue-600">R$ {selectedService.price?.toFixed(2)}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {stays.map((stay, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200" style={{ backgroundImage: `url('${stay.partner?.logo_url || IMAGES.PACKAGE_HERO}')` }} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate">{stay.partner?.company_name}</h4>
                                            <p className="text-xs text-gray-500">{stay.sessions} sessão(ões)</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-2">
                                        {stay.appointments.map((appt, i) => (
                                            <div key={i} className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-900 border border-gray-100">
                                                {formatDate(appt.date)} às {appt.time}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep('DATES')} className="h-14 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">arrow_back</span>Voltar
                            </button>
                            <button onClick={handleContinueToCheckout} className="flex-1 h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">lock</span>Ir para Pagamento
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>Pagamento 100% seguro
                        </p>
                    </div>
                );
            })()}
        </div>
    );
};

export default Estetica;