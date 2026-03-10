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
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className={`relative overflow-hidden transition-colors duration-500 ${activeTab === 'adoption' ? 'bg-gradient-to-r from-secondary to-orange-400' : 'bg-gradient-to-r from-primary to-blue-900'} text-white py-16 lg:py-20`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold tracking-wider mb-4 border border-white/30">
                        {activeTab === 'adoption' ? 'ADOÇÃO RESPONSÁVEL' : 'UTILIDADE PÚBLICA'}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 drop-shadow-sm">
                        {activeTab === 'adoption' ? 'Encontre seu novo melhor amigo' : 'Ajude um pet a voltar para casa'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
                        {activeTab === 'adoption'
                            ? 'Centenas de animais estão esperando por um lar cheio de amor. Conheça as histórias e transforme uma vida hoje mesmo.'
                            : 'A solidariedade é nossa maior força. Veja os pets desaparecidos na sua região e compartilhe para reunir famílias.'}
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full -mt-8 relative z-20">
                {/* Tabs & Actions */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                     <div className="flex gap-1 p-1 bg-slate-100/50 rounded-xl w-full sm:w-auto">
                        <button onClick={() => setActiveTab('adoption')} className={`flex-1 sm:flex-none px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'adoption' ? 'bg-white text-secondary shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                            Quero Adotar
                        </button>
                        <button onClick={() => setActiveTab('lost')} className={`flex-1 sm:flex-none px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'lost' ? 'bg-white text-primary shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                            Pets Perdidos
                        </button>
                    </div>
                    <button onClick={handleActionClick} className={`w-full sm:w-auto font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 ${activeTab === 'adoption' ? 'bg-secondary hover:bg-orange-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 hover:shadow-red-500/30'}`}>
                        <span className="material-symbols-outlined text-xl">{activeTab === 'adoption' ? 'pets' : 'campaign'}</span>
                        {activeTab === 'adoption' ? 'Cadastrar Pet para Adoção' : 'Reportar Desaparecimento'}
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

