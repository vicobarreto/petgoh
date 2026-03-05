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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {pets.map((pet) => (
                <div key={pet.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col h-full ring-1 ring-black/5 hover:-translate-y-1">
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                        <img alt={pet.name} className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700" src={pet.main_image || pet.img} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute top-3 left-3"><span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg backdrop-blur-md bg-opacity-90">Disponível</span></div>
                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-lg">favorite</span>
                        </button>
                        <div className="absolute bottom-4 left-4 text-white">
                            <p className="text-sm font-medium opacity-90 flex items-center gap-1"><span className="material-symbols-outlined text-base">location_on</span> {pet.location}</p>
                        </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 group-hover:text-secondary transition-colors">{pet.name}</h3>
                                <p className="text-sm font-medium text-slate-500">{pet.breed}</p>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pet.gender === 'Macho' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                                <span className="material-symbols-outlined text-lg">{pet.gender === 'Macho' ? 'male' : 'female'}</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                                <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider">Idade</span>
                                <span className="text-sm font-bold text-slate-700">{pet.age}</span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                                <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider">Peso</span>
                                <span className="text-sm font-bold text-slate-700">{pet.weight}</span>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button onClick={() => navigate(`/mural/adocao/${pet.id}`)} className="w-full py-3 px-4 bg-primary hover:bg-secondary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-secondary/30 transition-all flex items-center justify-center gap-2 group-hover:gap-3">
                                Quero Conhecer
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {lostPets.map((pet) => (
                <div key={pet.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col ring-1 ring-black/5 hover:-translate-y-1">
                    <div className="relative h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-slate-900/10 z-10 group-hover:bg-transparent transition-colors"></div>
                        <img alt={pet.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" src={pet.photo_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} />
                        <div className="absolute top-3 left-3 z-20"><span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg animate-pulse">PROCURA-SE</span></div>
                        {pet.reward && (
                            <div className="absolute top-3 right-3 z-20">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                                    <span className="material-symbols-outlined text-sm mr-1">paid</span>
                                    Recompensa: {pet.reward}
                                </span>
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 z-20">
                            <p className="text-white text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-red-200">
                                <span className="material-symbols-outlined text-sm">schedule</span> Desaparecido: {new Date(pet.last_seen_date).toLocaleDateString()}
                            </p>
                            <h3 className="text-2xl font-bold text-white mb-1">{pet.name}</h3>
                            <p className="text-white/80 text-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">place</span> {pet.last_seen_location}
                            </p>
                        </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow bg-red-50/30">
                        <div className="space-y-3 mb-6">
                            <div className="bg-white p-3 rounded-xl border border-red-100 flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                    {pet.description}
                                </p>
                            </div>
                            {pet.contact_info && (
                                <div className="bg-white p-2 rounded-lg border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                                     <span className="material-symbols-outlined text-green-600">contact_phone</span>
                                     {pet.contact_info}
                                </div>
                            )}
                        </div>
                        <button onClick={() => navigate(`/mural/perdido/${pet.id}/informar`)} className="w-full mt-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-xl">visibility</span>
                            Tenho Informações
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommunityWall;

