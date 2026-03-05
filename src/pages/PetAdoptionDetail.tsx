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
        <main className="flex-grow pt-8 pb-16 bg-background-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                             <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                {pet.name} 
                                <span className="material-symbols-outlined text-secondary" title="Verificado">verified</span>
                            </h1>
                            <p className="text-slate-500 flex items-center gap-1 text-sm">{pet.location} • {pet.breed}</p>
                        </div>
                    </div>

                    <div className="lg:col-span-4 row-start-1 lg:row-start-auto">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="bg-secondary/10 p-4 border-b border-secondary/10">
                                    <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined">volunteer_activism</span>
                                        Quero Conhecer
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <button onClick={() => navigate(`/mural/adocao/${petId}/formulario`)} className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
                                        Preencher formulário de interesse
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PetAdoptionDetail;
