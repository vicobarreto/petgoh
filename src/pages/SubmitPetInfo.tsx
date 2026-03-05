import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SubmitPetInfo: React.FC = () => {
    const { petId } = useParams();
    const navigate = useNavigate();

    // Mock pet data
    const pet = { name: "Thor", breed: "Golden Retriever", age: "3 anos", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJS6kxrQ7ae2OtDTWLG2fK2jdiLFLdANiQdVa2AS8T-ZAS-Ct_Qf6koqMVy7m7KS2LmSOVT0QRabOSp0j36DQZs3lZTqM0gDsiNJ59vhQFyqO4h-XnmqKlFadIXNdAwo9olH4lc4_HkLPMY0uAHes-TdpySUqAeH9j4D-5FDpZUfFAZVzdxe9Y0J6J4ptzsAmHsAFS7AT5FBZPZcxzrzT5bHdM_4uPKLSGu2kX0WuGQIRiS0tCGu-Z2IvsPnpvY2H9a7RYgT7wyjDo" };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Informações enviadas com sucesso! Obrigado pela sua ajuda.');
        navigate('/mural');
    };
    
    return (
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-background-light">
            <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-4">
                            <img alt={pet.name} className="w-full h-48 object-cover" src={pet.image} />
                            <div className="p-4">
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-1 inline-block">PERDIDO</span>
                                <h3 className="text-lg font-bold">{pet.name}</h3>
                                <p className="text-sm text-slate-500">{pet.breed}, {pet.age}</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                             <div className="mb-6">
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Envie uma pista</h1>
                                <p className="text-slate-500">Forneça o máximo de detalhes sobre o avistamento.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Onde você viu o pet?</label>
                                    <input type="text" placeholder="Pesquisar rua ou local..." className="block w-full rounded-lg border-slate-300 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="description">Descrição da Pista</label>
                                    <textarea className="block w-full rounded-lg border-slate-300 shadow-sm" id="description" rows={4} placeholder="Ex: Vi o Thor andando perto da padaria..."></textarea>
                                </div>
                                 <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => navigate('/mural')} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium">Cancelar</button>
                                    <button type="submit" className="px-6 py-2 bg-secondary text-white rounded-lg font-medium text-sm">Enviar Pista</button>
                                 </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SubmitPetInfo;
