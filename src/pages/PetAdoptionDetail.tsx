import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PetAdoptionDetail: React.FC = () => {
    const { petId } = useParams();
    const navigate = useNavigate();

    const [pet, setPet] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPet = async () => {
            if (!petId) return;
            try {
                const { data, error } = await supabase
                    .from('adoption_pets')
                    .select('*')
                    .eq('id', petId)
                    .single();
                
                if (error) throw error;
                setPet(data);
            } catch (error) {
                console.error("Error fetching pet details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPet();
    }, [petId]);

    if (loading) return <div className="p-8 text-center text-slate-500">Caregando detalhes do pet...</div>;
    if (!pet) return <div className="p-8 text-center text-slate-500">Pet não encontrado.</div>;
    
    return (
        <div className="flex h-auto min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-900">
            <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                {/* Modal Post View Container */}
                <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[80vh]">
                    {/* Left Side: Image Gallery/Main Photo */}
                    <div className="w-full md:w-1/2 relative bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full">
                             <img src={pet.main_image || pet.img} alt={pet.name} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                        </div>
                    </div>

                    {/* Right Side: Content & Chat */}
                    <div className="w-full md:w-1/2 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">
                        {/* Header Section */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-center bg-no-repeat aspect-square bg-slate-200 rounded-full h-12 w-12 border-2 border-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400">volunteer_activism</span>
                                </div>
                                <div>
                                    <h3 className="text-slate-900 dark:text-white font-bold text-base leading-none mb-1">{pet.organization_name || 'Abrigo PetGoH'}</h3>
                                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                                        <span className="material-symbols-outlined text-xs mr-1">location_on</span>
                                        {pet.location}
                                    </div>
                                </div>
                            </div>
                            <button className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Pet Info */}
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase">{pet.name}</h1>
                                    <span className="text-slate-400 text-xs">Adoção</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                    Este lindo pet está à procura de um lar. Ele(a) é {pet.gender}, {pet.breed} e tem {pet.age}.
                                </p>
                            </div>

                            {/* Stats/Traits */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Raça</span>
                                    <span className="text-sm font-semibold">{pet.breed}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Idade</span>
                                    <span className="text-sm font-semibold">{pet.age}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Peso</span>
                                    <span className="text-sm font-semibold">{pet.weight}</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button onClick={() => navigate(`/caomunicacao/mensagens`)} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">chat_bubble</span>
                                    Enviar Mensagem
                                </button>
                                <button onClick={() => navigate(`/mural/adocao/${petId}/formulario`)} className="w-full mt-4 bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                                    Preencher formulário de interesse
                                </button>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="px-6 py-4 flex gap-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 h-11 rounded-lg font-bold text-sm transition-colors">
                                <span className="material-symbols-outlined text-lg">share</span>
                                Compartilhar
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 h-11 rounded-lg font-bold text-sm transition-colors">
                                <span className="material-symbols-outlined text-lg">favorite</span>
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PetAdoptionDetail;
