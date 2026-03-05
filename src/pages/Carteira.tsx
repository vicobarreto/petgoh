import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IMAGES, Pet } from '../types';
import { useAuth } from '../context/AuthContext';

const Carteira: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const petId = searchParams.get('petId');
    const { pets, loading } = useAuth();
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

    useEffect(() => {
        if (!loading && pets.length > 0) {
            if (petId) {
                const found = pets.find(p => p.id === petId);
                setSelectedPet(found || pets[0]);
            } else {
                setSelectedPet(pets[0]);
            }
        }
    }, [pets, loading, petId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!selectedPet) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-gray-500">Nenhum pet encontrado.</p>
                <button onClick={() => navigate('/register-pet')} className="text-primary font-bold hover:underline">
                    Cadastrar Pet
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
            {/* Header Background */}
            <div className="absolute top-0 left-0 w-full h-[35vh] bg-secondary z-0 rounded-b-[3rem]"></div>
            
            <main className="relative z-10 flex-1 flex flex-col items-center w-full px-4 sm:px-6">
                <div className="w-full max-w-[500px] flex flex-col gap-6 pt-6 pb-12">
                    {/* Pet Card */}
                    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-transform hover:scale-[1.01] duration-300 border border-white/20">
                        <div className={`h-2 bg-gradient-to-r from-primary to-${selectedPet.color || 'orange'}-400`}></div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                    <span className="material-symbols-outlined text-[16px] fill-1">check_circle</span>
                                    Vacinas em dia
                                </div>
                                <span className="material-symbols-outlined text-gray-400 text-[24px]">qr_code_2</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                                <div className="relative">
                                    <div className="size-24 rounded-full bg-gray-200 ring-4 ring-white shadow-md overflow-hidden">
                                        <img alt={selectedPet.name} className="w-full h-full object-cover" src={selectedPet.image || IMAGES.THOR_DOG} />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-secondary text-white p-1 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[16px]">pets</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedPet.name}</h2>
                                    <p className="text-sm text-gray-500 font-medium mb-3">{selectedPet.breed || 'Raça não definida'} • {selectedPet.age} anos • {selectedPet.gender}</p>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                            <p className="text-gray-400 mb-0.5">Peso</p>
                                            <p className="font-bold text-gray-800">{selectedPet.weight} kg</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                            <p className="text-gray-400 mb-0.5">Chip ID</p>
                                            <p className="font-bold text-gray-800 truncate" title={selectedPet.chipId}>{selectedPet.chipId || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                            <p className="text-xs text-gray-500">Última atualização: Hoje</p>
                            <button onClick={() => navigate('/profile?tab=pets')} className="text-secondary text-sm font-bold hover:underline">Voltar para Perfil</button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Histórico de Saúde</h3>
                        {/* Placeholder Content - In a real app, this would be fetched from a 'health_records' table */}
                        <div className="relative flex flex-col gap-0">
                            {/* Item 1 */}
                            <div className="flex gap-4 pb-8 relative timeline-item group">
                                <div className="absolute left-[24px] top-8 bottom-0 w-0.5 bg-gray-200 z-0"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="size-12 rounded-full bg-orange-100 text-primary flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">event</span>
                                    </div>
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-900">Reforço Antirrábica</h4>
                                        <span className="text-xs font-semibold text-primary bg-orange-50 px-2 py-0.5 rounded">Próxima</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">Vence em 15 dias</p>
                                    <button onClick={() => navigate('/agendar')} className="inline-flex items-center text-sm font-bold text-primary hover:text-orange-700 transition-colors">
                                        Agendar agora
                                        <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                            {/* Item 2 */}
                            <div className="flex gap-4 pb-8 relative timeline-item">
                                <div className="absolute left-[24px] top-8 bottom-0 w-0.5 bg-gray-200 z-0"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="size-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-4 border-white shadow-sm">
                                        <span className="material-symbols-outlined">vaccines</span>
                                    </div>
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-900">Vacina V10</h4>
                                        <span className="text-xs text-gray-400">12 Out 2023</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Aplicada por Dr. Carlos Mendes</p>
                                    <div className="mt-2 flex items-center gap-1 text-xs text-green-700 font-medium">
                                        <span className="material-symbols-outlined text-[14px]">verified</span>
                                        Validada
                                    </div>
                                </div>
                            </div>
                            {/* Item 3 */}
                            <div className="flex gap-4 relative timeline-item">
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="size-12 rounded-full bg-blue-100 text-secondary flex items-center justify-center border-4 border-white shadow-sm">
                                        <span className="material-symbols-outlined">medication</span>
                                    </div>
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-900">Vermífugo</h4>
                                        <span className="text-xs text-gray-400">15 Set 2023</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Dose única - Drontal</p>
                                    <div className="mt-2 flex items-center gap-1 text-xs text-green-700 font-medium">
                                        <span className="material-symbols-outlined text-[14px]">verified</span>
                                        Validada
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center justify-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <span className="material-symbols-outlined text-secondary text-3xl">upload_file</span>
                            <span className="text-sm font-semibold text-gray-700">Adicionar Exame</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <span className="material-symbols-outlined text-primary text-3xl">add_alert</span>
                            <span className="text-sm font-semibold text-gray-700">Criar Lembrete</span>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
                <div className="w-full max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© 2024 PetGoH. Todos os direitos reservados.</p>
                    <div className="flex gap-6">
                        <a className="hover:text-primary transition-colors" href="#">Termos de Uso</a>
                        <a className="hover:text-primary transition-colors" href="#">Privacidade</a>
                        <a className="hover:text-primary transition-colors" href="#">Ajuda</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Carteira;