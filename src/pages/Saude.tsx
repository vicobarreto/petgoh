import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { supabase } from '../lib/supabase';

type ViewState = 'LIST' | 'DETAILS' | 'PARTNERS';

interface HealthService {
    id: string;
    name: string;
    category: string;
    description: string | null;
    price: number;
    is_active: boolean;
}

interface VetPartner {
    id: string;
    company_name: string;
    category: string;
    phone: string | null;
    email: string | null;
    rating: number;
    logo_url: string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
    consulta: 'stethoscope',
    vacina: 'vaccines',
    hemograma: 'bloodtype',
    bioquimica: 'science',
    imagem: 'radiology',
    cardio: 'cardiology',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    consulta: { bg: 'bg-blue-100', text: 'text-blue-600' },
    vacina: { bg: 'bg-green-100', text: 'text-green-600' },
    hemograma: { bg: 'bg-red-100', text: 'text-red-600' },
    bioquimica: { bg: 'bg-purple-100', text: 'text-purple-600' },
    imagem: { bg: 'bg-amber-100', text: 'text-amber-600' },
    cardio: { bg: 'bg-rose-100', text: 'text-rose-600' },
};

const Saude: React.FC = () => {
    const [view, setView] = useState<ViewState>('LIST');
    const [selectedService, setSelectedService] = useState<HealthService | null>(null);
    const [services, setServices] = useState<HealthService[]>([]);
    const [vets, setVets] = useState<VetPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const { isFavorite, toggleFavorite } = useFavorites();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [servicesRes, vetsRes] = await Promise.all([
            supabase
                .from('health_services')
                .select('*')
                .eq('is_active', true)
                .order('category'),
            supabase
                .from('partners')
                .select('*')
                .eq('category', 'Veterinário')
                .eq('status', 'active')
                .order('rating', { ascending: false }),
        ]);

        if (servicesRes.data) setServices(servicesRes.data);
        if (vetsRes.data) setVets(vetsRes.data);
        setLoading(false);
    };

    const handleSelectService = (service: HealthService) => {
        setSelectedService(service);
        setView('DETAILS');
    };

    const handleChooseVet = () => setView('PARTNERS');

    const handleSelectVet = (vet: VetPartner) => {
        navigate('/checkout', {
            state: {
                package: {
                    id: selectedService?.id,
                    title: `Agendamento: ${selectedService?.name}`,
                    price: `R$ ${selectedService?.price?.toFixed(2)}`,
                },
                partner: {
                    id: vet.id,
                    name: vet.company_name,
                    type: 'Veterinário',
                    rating: vet.rating,
                    image: vet.logo_url || IMAGES.VET_EXAM,
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
                        {view === 'LIST' && 'Saúde Pet'}
                        {view === 'DETAILS' && 'Detalhes do Serviço'}
                        {view === 'PARTNERS' && 'Escolher Veterinário'}
                    </h1>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-6">

                {/* VIEW 1: SERVICE LIST */}
                {view === 'LIST' && (
                    <div className="space-y-6">
                        {/* Hero */}
                        <div className="relative rounded-2xl overflow-hidden h-44 shadow-md">
                            <img src={IMAGES.VET_EXAM} alt="Saúde Hero" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-6">
                                <div>
                                    <h2 className="text-white text-2xl font-bold mb-1">Saúde & Bem-Estar</h2>
                                    <p className="text-gray-200 text-sm">Consultas, vacinas e exames com profissionais qualificados.</p>
                                </div>
                            </div>
                        </div>

                        {/* Services Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">medical_services</span>
                                Serviços Disponíveis
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {services.map((service) => {
                                    const colors = CATEGORY_COLORS[service.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                                    const icon = CATEGORY_ICONS[service.category] || 'medical_services';
                                    return (
                                        <div
                                            key={service.id}
                                            onClick={() => handleSelectService(service)}
                                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className={`size-14 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                                                <span className={`material-symbols-outlined text-[28px] ${colors.text}`}>{icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 truncate">{service.name}</h4>
                                                {service.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-1 mb-1">{service.description}</p>
                                                )}
                                                <span className="text-sm font-bold text-secondary">
                                                    R$ {service.price?.toFixed(2)}
                                                </span>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-300 flex-shrink-0">chevron_right</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Vets Section */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">stethoscope</span>
                                Veterinários Parceiros
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {vets.map((vet) => (
                                    <div
                                        key={vet.id}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                                    >
                                        <div className="relative h-40 bg-gray-200">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                style={{ backgroundImage: `url('${vet.logo_url || IMAGES.VET_EXAM}')` }}
                                            ></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                            <div className="absolute top-3 left-3">
                                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-green-500 text-[14px]">verified</span>
                                                    Veterinário
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite({
                                                        id: vet.id,
                                                        name: vet.company_name,
                                                        type: 'Veterinário',
                                                        image: vet.logo_url || IMAGES.VET_EXAM,
                                                        rating: vet.rating,
                                                        location: 'Parceiro PetGoH',
                                                    });
                                                }}
                                                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10"
                                            >
                                                <span className={`material-symbols-outlined text-[20px] ${isFavorite(vet.id) ? 'fill-current text-red-500' : 'text-gray-400'}`}>
                                                    favorite
                                                </span>
                                            </button>

                                            <div className="absolute bottom-3 left-3 text-white">
                                                <h3 className="text-lg font-bold drop-shadow-sm">{vet.company_name}</h3>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <span className="material-symbols-outlined text-yellow-400 text-[16px] fill-current">star</span>
                                                    <span>{vet.rating || '—'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                                                {vet.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">call</span>
                                                        {vet.phone}
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
                                                        if (services.length > 0) {
                                                            setSelectedService(services[0]);
                                                        }
                                                        handleSelectVet(vet);
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
                        <div className="relative h-52 rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white/20 text-[120px]">
                                {CATEGORY_ICONS[selectedService.category] || 'medical_services'}
                            </span>
                            <div className="absolute inset-0 flex items-end p-6">
                                <div>
                                    <span className="inline-block bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-md mb-2 backdrop-blur-sm capitalize">
                                        {selectedService.category}
                                    </span>
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
                                <div className="flex flex-col items-end">
                                    <span className="text-sm text-gray-500">Categoria</span>
                                    <span className="text-sm font-semibold text-gray-800 capitalize">{selectedService.category}</span>
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
                                onClick={handleChooseVet}
                                className="w-full bg-primary hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span>Encontrar Veterinário</span>
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* VIEW 3: VET PARTNERS */}
                {view === 'PARTNERS' && (
                    <div className="flex flex-col gap-4 animate-fade-in">
                        <div className="bg-green-50 p-4 rounded-xl flex gap-3 text-green-800 text-sm mb-2 border border-green-100">
                            <span className="material-symbols-outlined flex-shrink-0">stethoscope</span>
                            <p>Veterinários qualificados para <strong>{selectedService?.name}</strong>.</p>
                        </div>

                        {vets.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
                                <p>Nenhum veterinário disponível no momento.</p>
                            </div>
                        ) : (
                            vets.map((vet) => (
                                <div
                                    key={vet.id}
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => handleSelectVet(vet)}
                                >
                                    <div className="relative h-44 bg-gray-200">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${vet.logo_url || IMAGES.VET_EXAM}')` }}
                                        ></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                        <div className="absolute top-3 left-3">
                                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                                <span className="material-symbols-outlined text-green-500 text-[14px]">verified</span>
                                                Veterinário
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite({
                                                    id: vet.id,
                                                    name: vet.company_name,
                                                    type: 'Veterinário',
                                                    image: vet.logo_url || IMAGES.VET_EXAM,
                                                    rating: vet.rating,
                                                    location: 'Parceiro PetGoH',
                                                });
                                            }}
                                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10"
                                        >
                                            <span className={`material-symbols-outlined text-[20px] ${isFavorite(vet.id) ? 'fill-current text-red-500' : 'text-gray-400'}`}>
                                                favorite
                                            </span>
                                        </button>

                                        <div className="absolute bottom-3 left-3 text-white">
                                            <h3 className="text-lg font-bold drop-shadow-sm">{vet.company_name}</h3>
                                            <div className="flex items-center gap-1 text-sm">
                                                <span className="material-symbols-outlined text-yellow-400 text-[16px] fill-current">star</span>
                                                <span>{vet.rating || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                                            {vet.phone && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">call</span>
                                                    {vet.phone}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                <span>Parceiro Verificado</span>
                                            </div>
                                            <button className="bg-secondary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-all shadow-sm">
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

export default Saude;