import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';
import { useFavorites } from '../context/FavoritesContext';

type ViewState = 'LIST' | 'DETAILS' | 'PARTNERS';

interface CrecheService {
    id: string;
    title: string;
    description: string;
    schedule: string;
    price: string;
    features: string[];
    image: string;
    partnerTypeMatch: string;
    badge?: string;
}

const SERVICES: CrecheService[] = [
    {
        id: 'daycare-integral',
        title: 'Daycare Integral (12h)',
        description: 'Um dia completo de diversão, socialização e gastos de energia. Ideal para quem trabalha fora o dia todo.',
        schedule: '07:00 às 19:00',
        price: 'A partir de R$ 85,00/dia',
        features: ['Monitoramento 100%', 'Atividades Recreativas', 'Soneca Climatizada', 'Alimentação Supervisionada'],
        image: IMAGES.TWO_DOGS,
        partnerTypeMatch: 'Creche',
        badge: 'Mais Popular'
    },
    {
        id: 'daycare-meio',
        title: 'Daycare Meio Período (6h)',
        description: 'Perfeito para gastar energia em um turno (manhã ou tarde). Socialização na medida certa.',
        schedule: 'Manhã ou Tarde',
        price: 'A partir de R$ 60,00/dia',
        features: ['Socialização', 'Gasto de Energia', 'Enriquecimento Ambiental', 'Descanso'],
        image: IMAGES.DOG_RUNNING || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop',
        partnerTypeMatch: 'Creche'
    },
    {
        id: 'hotel-pet',
        title: 'Hospedagem (Pernoite)',
        description: 'Cuidado 24 horas para quando você viajar. Seu pet dorme em quartos confortáveis ou baias individuais.',
        schedule: 'Check-in 14h / Check-out 12h',
        price: 'A partir de R$ 90,00/noite',
        features: ['Câmeras Ao Vivo', 'Relatório Diário', 'Passeios Externos', 'Ambiente Familiar'],
        image: IMAGES.HOTEL_INTERIOR,
        partnerTypeMatch: 'Hotel',
        badge: 'Férias'
    }
];

const Creche: React.FC = () => {
    const [view, setView] = useState<ViewState>('LIST');
    const [selectedService, setSelectedService] = useState<CrecheService | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { isFavorite, toggleFavorite } = useFavorites();
    const navigate = useNavigate();

    // Mock Partners
    const partners = [
        {
            id: "quintal-da-alegria",
            name: "Quintal da Alegria Daycare",
            type: "Creche",
            rating: 4.9,
            reviews: 120,
            price: 85,
            location: "Jardim Botânico, RJ",
            image: IMAGES.DOG_DAYCARE,
            verified: true,
            features: ["Piscina", "Gramado Natural"]
        },
        {
            id: "vila-dos-pets-leblon",
            name: "Vila dos Pets Leblon",
            type: "Hotel",
            rating: 5.0,
            reviews: 215,
            price: 110,
            location: "Leblon, RJ",
            image: IMAGES.PACKAGE_HERO,
            verified: true,
            premium: true,
            features: ["Suítes Individuais", "Webcam 24h"]
        },
        {
            id: "espaco-zen-pet",
            name: "Espaço Zen Pet",
            type: "Creche",
            rating: 4.8,
            reviews: 56,
            price: 55,
            location: "Gávea, RJ",
            image: IMAGES.HOTEL_INTERIOR,
            features: ["Musicoterapia", "Massagem"]
        },
        {
            id: "auau-school",
            name: "AuAu School",
            type: "Creche",
            rating: 4.7,
            reviews: 320,
            price: 75,
            location: "Copacabana, RJ",
            image: "https://images.unsplash.com/photo-1597524213799-a3528b122785?q=80&w=2070&auto=format&fit=crop",
            verified: true,
            features: ["Adestramento", "Agility"]
        }
    ];

    const filteredPartners = useMemo(() => {
        let filtered = partners;
        
        // Filter by Service Type
        if (selectedService) {
            filtered = filtered.filter(p => !selectedService.partnerTypeMatch || p.type === selectedService.partnerTypeMatch || (selectedService.partnerTypeMatch === 'Creche' && p.type === 'Hotel')); // Hotels often do daycare
        }

        // Filter by Location/Name
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(term) || 
                p.location.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [partners, selectedService, searchTerm]);

    const handleSelectService = (service: CrecheService) => {
        setSelectedService(service);
        setView('DETAILS');
    };

    const handleChoosePartners = () => {
        setView('PARTNERS');
    };

    const handleSelectPartner = (partner: any) => {
        navigate('/checkout', { 
            state: { 
                package: {
                    ...selectedService,
                    title: `Reserva: ${selectedService?.title}`
                },
                partner: partner
            } 
        });
    };

    const handleBack = () => {
        if (view === 'PARTNERS') setView('DETAILS');
        else if (view === 'DETAILS') setView('LIST');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Nav */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-50">
                <div className="max-w-3xl mx-auto flex items-center">
                    {view !== 'LIST' && (
                        <button onClick={handleBack} className="mr-4 text-gray-600 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-gray-800">
                        {view === 'LIST' && 'Creche & Hotel'}
                        {view === 'DETAILS' && 'Detalhes do Serviço'}
                        {view === 'PARTNERS' && 'Escolher Local'}
                    </h1>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-6">
                
                {/* VIEW 1: LIST OF SERVICES */}
                {view === 'LIST' && (
                    <div className="space-y-6">
                        {/* Hero Banner Mini */}
                        <div className="relative rounded-2xl overflow-hidden h-48 shadow-sm group">
                            <img src={IMAGES.TWO_DOGS} alt="Creche Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-6">
                                <div className="max-w-md">
                                    <h2 className="text-white text-2xl font-bold mb-1">Segunda Casa do seu Pet</h2>
                                    <p className="text-gray-200 text-sm">Diversão, segurança e muito carinho enquanto você trabalha ou viaja.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {SERVICES.map((service) => (
                                <div 
                                    key={service.id} 
                                    onClick={() => handleSelectService(service)}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    {service.badge && (
                                        <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                                            {service.badge}
                                        </div>
                                    )}
                                    
                                    <div className="size-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-gray-800 truncate pr-6">{service.title}</h3>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{service.description}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-primary">{service.price}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite({
                                                    id: service.id,
                                                    name: service.title,
                                                    type: 'Creche',
                                                    image: service.image,
                                                    rating: 5.0,
                                                    location: 'PetGoH',
                                                    description: service.description
                                                });
                                            }}
                                            className="p-2 rounded-full hover:bg-red-50 transition-colors group/fav flex-shrink-0"
                                        >
                                            <span className={`material-symbols-outlined text-[24px] ${isFavorite(service.id) ? 'fill-current text-red-500' : 'text-gray-300 group-hover/fav:text-red-400'}`}>
                                                {isFavorite(service.id) ? 'favorite' : 'favorite'}
                                            </span>
                                        </button>
                                        <span className="material-symbols-outlined text-gray-300 self-center">chevron_right</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VIEW 2: SERVICE DETAILS */}
                {view === 'DETAILS' && selectedService && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div className="relative h-64 rounded-2xl overflow-hidden shadow-md">
                            <img src={selectedService.image} alt={selectedService.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                                <div>
                                    {selectedService.badge && (
                                        <span className="inline-block bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md mb-2">{selectedService.badge}</span>
                                    )}
                                    <h2 className="text-3xl font-bold text-white leading-tight">{selectedService.title}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Valor Estimado</span>
                                    <span className="text-2xl font-bold text-primary">{selectedService.price}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm text-gray-500">Horário</span>
                                    <span className="text-lg font-semibold text-gray-800">{selectedService.schedule}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Incluso no Pacote</h3>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedService.features.map((feat, idx) => (
                                        <li key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                                 <span className="material-symbols-outlined text-[18px]">check</span>
                                            </div>
                                            <span className="text-gray-700 text-sm font-medium">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição</h3>
                                <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {selectedService.description}
                                </p>
                            </div>
                        </div>

                        <div className="sticky bottom-4 z-20">
                            <button 
                                onClick={handleChoosePartners}
                                className="w-full bg-secondary hover:bg-blue-900 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span>Buscar Creches Próximas</span>
                                <span className="material-symbols-outlined">location_on</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* VIEW 3: PARTNERS LIST WITH SEARCH */}
                {view === 'PARTNERS' && (
                    <div className="flex flex-col gap-4 animate-fade-in">
                        {/* Search Bar */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-[72px] z-40">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-secondary focus:border-secondary transition-all outline-none" 
                                    placeholder="Buscar por bairro (ex: Leblon) ou nome..." 
                                    autoFocus
                                />
                            </div>
                            {searchTerm && (
                                <p className="text-xs text-gray-500 mt-2 ml-1">
                                    Encontrados {filteredPartners.length} locais para sua busca.
                                </p>
                            )}
                        </div>

                        {filteredPartners.length > 0 ? (
                            filteredPartners.map((p, idx) => (
                                <div key={idx} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer" onClick={() => handleSelectPartner(p)}>
                                    <div className="relative h-48 md:h-56 bg-gray-200">
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${p.image}')` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                                        
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                                {p.verified && <span className="material-symbols-outlined text-blue-500 text-[14px]">verified</span>}
                                                {p.type}
                                            </div>
                                            {p.premium && (
                                                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">diamond</span> Premium
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite({
                                                    id: p.id,
                                                    name: p.name,
                                                    type: p.type,
                                                    image: p.image,
                                                    rating: p.rating,
                                                    location: p.location,
                                                    reviews: p.reviews
                                                });
                                            }}
                                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10"
                                        >
                                            <span className={`material-symbols-outlined text-[20px] ${isFavorite(p.id) ? 'fill-current text-red-500' : 'text-gray-400'}`}>
                                                {isFavorite(p.id) ? 'favorite' : 'favorite'}
                                            </span>
                                        </button>

                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <h3 className="text-xl font-bold mb-1 shadow-black/50 drop-shadow-sm">{p.name}</h3>
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                                                    <span className="material-symbols-outlined text-yellow-400 text-[16px] fill-current">star</span>
                                                    <span>{p.rating}</span>
                                                </div>
                                                <span className="opacity-90">({p.reviews} avaliações)</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                                            {p.features?.map((feat, i) => (
                                                <span key={i} className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 flex-shrink-0">
                                                    {feat}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                <span className="truncate max-w-[150px]">{p.location}</span>
                                            </div>
                                            <button 
                                                className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-orange-600 transition-all shadow-sm hover:shadow-md"
                                            >
                                                Ver Disponibilidade
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <div className="mx-auto size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-gray-400 text-3xl">wrong_location</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum local encontrado</h3>
                                <p className="text-gray-500 text-sm">Tente buscar por outro bairro ou nome.</p>
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
};

export default Creche;