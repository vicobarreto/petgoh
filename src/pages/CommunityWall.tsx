import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CommunityWall: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'adoption' | 'lost'>('adoption');
    const navigate = useNavigate();

    const handleActionClick = () => {
        if (activeTab === 'adoption') {
            navigate('/mural/postar-adocao');
        } else {
            navigate('/mural/reportar-perdido');
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-[50px] md:pb-0">
            {/* Thin Instagram-like Tabs for Mural */}
            <div className="bg-white border-b border-gray-100 flex sticky top-0 z-30">
                {(['adoption', 'lost'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-center text-[13px] font-semibold transition-colors relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                        {tab === 'adoption' ? 'Adoção' : 'Perdidos'}
                        {activeTab === tab && <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gray-900" />}
                    </button>
                ))}
            </div>

            <main className="max-w-[600px] mx-auto w-full pt-4 px-0 sm:px-4">
                {/* Action button placed inside the feed discretely */}
                <div className="px-4 mb-4">
                    <button 
                        onClick={handleActionClick} 
                        className={`w-full font-semibold py-2.5 px-4 rounded-xl shadow-sm text-[14px] flex items-center justify-center gap-2 transition-all ${
                            activeTab === 'adoption' 
                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100' 
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {activeTab === 'adoption' ? 'add_circle' : 'campaign'}
                        </span>
                        {activeTab === 'adoption' ? 'Cadastrar para Adoção' : 'Reportar Desaparecimento'}
                    </button>
                </div>

                {/* Content */}
                <div className="animate-fade-in-up">
                    {activeTab === 'adoption' ? <AdoptionView /> : <LostPetsView />}
                </div>
            </main>
        </div>
    );
};

const AdoptionView: React.FC = () => {
    const navigate = useNavigate();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdoptionPets();
    }, []);

    const fetchAdoptionPets = async () => {
        try {
            const { data, error } = await supabase
                .from('adoption_pets')
                .select('*')
                .eq('status', 'available')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setPets(data || []);
        } catch (error) {
            console.error('Error fetching adoption pets:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading pets...</div>;
    }

    return (
        <div className="max-w-[600px] mx-auto space-y-8">
            {pets.map((pet) => (
                <article key={pet.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    {/* User Header */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">volunteer_activism</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold hover:underline cursor-pointer">{pet.organization_name || 'Abrigo PetGoH'}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {pet.location || 'Local não informado'}
                                </p>
                            </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>

                    {/* Image Section */}
                    <div className="relative aspect-square w-full bg-slate-100 group">
                        <img alt={pet.name} className="w-full h-full object-cover" src={pet.main_image || pet.img} />
                        {/* Floating Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="bg-secondary text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">favorite</span>
                                ADOÇÃO
                            </span>
                        </div>
                    </div>

                    {/* Interaction Bar */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <button className="hover:scale-110 transition-transform text-secondary dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[28px]">favorite</span>
                                </button>
                                <button className="hover:scale-110 transition-transform text-secondary dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[28px]">chat_bubble</span>
                                </button>
                                <button className="hover:scale-110 transition-transform text-secondary dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[28px]">share</span>
                                </button>
                            </div>
                            <button className="text-secondary dark:text-slate-300">
                                <span className="material-symbols-outlined text-[28px]">bookmark</span>
                            </button>
                        </div>
                        
                        {/* Caption */}
                        <div className="space-y-1">
                            <p className="text-sm">
                                <span className="font-bold mr-2">{pet.name}</span>
                                {pet.description || `Este lindo pet está à procura de um lar. Ele(a) é ${pet.gender}, ${pet.breed} e tem ${pet.age}.`}
                            </p>
                            <div className="mt-4">
                                <button onClick={() => navigate(`/mural/adocao/${pet.id}`)} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    Quero Adotar
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase mt-4">
                                {new Date(pet.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

const LostPetsView: React.FC = () => {
    const navigate = useNavigate();
    const [lostPets, setLostPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLostPets();
    }, []);

    const fetchLostPets = async () => {
        try {
            const { data, error } = await supabase
                .from('lost_pets')
                .select('*')
                .eq('status', 'lost')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setLostPets(data || []);
        } catch (error) {
            console.error('Error fetching lost pets:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading lost pets...</div>;
    }

    return (
        <div className="max-w-[600px] mx-auto space-y-8">
            {lostPets.map((pet) => (
                <article key={pet.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    {/* User Header */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-primary/20 p-0.5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">person</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold hover:underline cursor-pointer">{pet.owner_name || 'Tutor do Pet'}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {pet.last_seen_location || 'Local desconhecido'}
                                </p>
                            </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>

                    {/* Image Section */}
                    <div className="relative aspect-square w-full bg-slate-100 group">
                        <img alt={pet.name} className="w-full h-full object-cover" src={pet.photo_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} />
                        {/* Floating Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">warning</span>
                                PERDIDO
                            </span>
                        </div>
                    </div>

                    {/* Interaction Bar */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <button className="hover:scale-110 transition-transform text-secondary dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[28px]">favorite</span>
                                </button>
                                <button className="hover:scale-110 transition-transform text-secondary dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[28px]">chat_bubble</span>
                                </button>
                                <button className="hover:scale-110 transition-transform text-secondary dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[28px]">share</span>
                                </button>
                            </div>
                            <button className="text-secondary dark:text-slate-300">
                                <span className="material-symbols-outlined text-[28px]">bookmark</span>
                            </button>
                        </div>
                        
                        {/* Caption */}
                        <div className="space-y-1">
                            <p className="text-sm">
                                <span className="font-bold mr-2">{pet.name}</span>
                                {pet.description}
                            </p>
                            <div className="mt-4">
                                <button onClick={() => navigate(`/mural/perdido/${pet.id}/informar`)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    Tem informações?
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase mt-4">
                                Desaparecido em: {pet.last_seen_date ? new Date(pet.last_seen_date).toLocaleDateString() : 'Não informado'}
                            </p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default CommunityWall;

