import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AdoptionApplicationForm: React.FC = () => {
    const { petId } = useParams();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would handle form submission
        navigate('/mural/adocao/sucesso');
    };

    return (
        <div className="bg-background-light min-h-screen">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Voltar
                    </button>
                    <span className="text-sm font-medium text-slate-500">Passo 1 de 1</span>
                </div>
            </header>
            <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <section className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-primary/10">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6">Dados Pessoais</h3>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Form fields */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700" htmlFor="fullname">Nome Completo</label>
                                <input className="mt-1 w-full px-4 py-3 rounded-lg border border-slate-200" id="fullname" type="text" placeholder="Seu nome" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700" htmlFor="email">E-mail</label>
                                <input className="mt-1 w-full px-4 py-3 rounded-lg border border-slate-200" id="email" type="email" placeholder="seu@email.com" />
                            </div>
                        </div>
                    </section>
                    <section className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-primary/10">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6">Termo de Responsabilidade</h3>
                        <div className="flex items-start">
                            <input id="terms" name="terms" type="checkbox" className="h-5 w-5 text-primary border-slate-300 rounded focus:ring-primary" required />
                            <div className="ml-3 text-sm"><label htmlFor="terms" className="font-medium text-slate-700">Li e concordo com o Termo de Adoção Responsável</label></div>
                        </div>
                    </section>
                    <div className="pt-4 flex flex-col items-center">
                        <button type="submit" className="w-full md:w-auto md:min-w-[300px] bg-primary hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg transition-all">
                            Enviar Solicitação
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AdoptionApplicationForm;
