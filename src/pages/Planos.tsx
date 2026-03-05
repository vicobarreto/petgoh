import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Planos: React.FC = () => {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-1 flex flex-col items-center w-full">
                {/* Intro Section */}
                <div className="w-full bg-secondary text-white py-12 px-6 flex flex-col items-center text-center">
                    <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold mb-4 border border-white/20">Clube de Benefícios</span>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Planos PetGoH Prime</h1>
                    <p className="text-blue-100 text-lg max-w-2xl">Economize até R$ 2.400/ano em serviços e produtos para o seu pet. Cancele quando quiser.</p>
                    
                    {/* Toggle */}
                    <div className="mt-8 bg-blue-900/50 p-1 rounded-full inline-flex items-center relative border border-white/10">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all relative z-10 ${billingCycle === 'monthly' ? 'bg-white text-secondary shadow-sm' : 'text-white hover:text-white/90'}`}
                        >
                            Mensal
                        </button>
                        <button 
                            onClick={() => setBillingCycle('annual')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative z-10 ${billingCycle === 'annual' ? 'bg-white text-secondary shadow-sm' : 'text-white hover:text-white/90'}`}
                        >
                            Anual <span className="text-xs text-green-300 ml-1 font-bold">-20%</span>
                        </button>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="w-full max-w-[1200px] px-6 -mt-10 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {/* Basic Plan */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-gray-200 transition-all">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Básico</h3>
                            <p className="text-gray-500 text-sm mb-6 h-10">Para quem precisa de cuidados ocasionais.</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-3xl font-bold text-gray-900">R$ {billingCycle === 'monthly' ? '19,90' : '15,90'}</span>
                                <span className="text-gray-500 text-sm">/mês</span>
                            </div>
                            <button className="w-full py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-orange-50 transition-colors mb-8">
                                Começar Grátis
                            </button>
                            <ul className="space-y-4 text-sm text-gray-600">
                                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-[20px]">check</span><span>5% OFF em hospedagem</span></li>
                                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-[20px]">check</span><span>Sem taxa de serviço (até 2/mês)</span></li>
                                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-[20px]">check</span><span>Suporte por chat</span></li>
                            </ul>
                        </div>

                        {/* Standard Plan (Highlighted) */}
                        <div className="bg-white rounded-2xl p-0 shadow-xl border-2 border-primary relative transform md:-translate-y-4 z-10">
                            <div className="bg-primary text-white text-center text-sm font-bold py-2 rounded-t-lg uppercase tracking-wider">
                                Mais Popular
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Cuidadoso</h3>
                                <p className="text-gray-500 text-sm mb-6 h-10">O equilíbrio ideal para o dia a dia.</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-bold text-gray-900">R$ {billingCycle === 'monthly' ? '49,90' : '39,90'}</span>
                                    <span className="text-gray-500 text-sm">/mês</span>
                                </div>
                                <button className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-orange-600 shadow-md shadow-orange-200 transition-all transform hover:scale-[1.02] mb-8">
                                    Assinar Agora
                                </button>
                                <ul className="space-y-4 text-sm text-gray-700 font-medium">
                                    <li className="flex items-start gap-3"><div className="p-1 rounded-full bg-green-100 text-green-600"><span className="material-symbols-outlined text-[16px] font-bold">check</span></div><span>10% OFF em todos os serviços</span></li>
                                    <li className="flex items-start gap-3"><div className="p-1 rounded-full bg-green-100 text-green-600"><span className="material-symbols-outlined text-[16px] font-bold">check</span></div><span>Isenção total de taxa de serviço</span></li>
                                    <li className="flex items-start gap-3"><div className="p-1 rounded-full bg-green-100 text-green-600"><span className="material-symbols-outlined text-[16px] font-bold">check</span></div><span>Suporte Prioritário 24/7</span></li>
                                    <li className="flex items-start gap-3"><div className="p-1 rounded-full bg-green-100 text-green-600"><span className="material-symbols-outlined text-[16px] font-bold">check</span></div><span>Cashback em dobro</span></li>
                                </ul>
                            </div>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-gray-200 transition-all">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                            <p className="text-gray-500 text-sm mb-6 h-10">Cobertura completa e mimos exclusivos.</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-3xl font-bold text-gray-900">R$ {billingCycle === 'monthly' ? '89,90' : '71,90'}</span>
                                <span className="text-gray-500 text-sm">/mês</span>
                            </div>
                            <button className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 hover:bg-gray-50 transition-colors mb-8">
                                Escolher Premium
                            </button>
                            <ul className="space-y-4 text-sm text-gray-600">
                                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-[20px]">check</span><span>15% OFF + Frete Grátis</span></li>
                                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-[20px]">check</span><span>Consultas veterinárias online</span></li>
                                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-[20px]">check</span><span>Seguro Pet incluso</span></li>
                                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-[20px]">check</span><span>Presente surpresa trimestral</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-gray-500 text-sm">
                            Dúvidas sobre os planos? <a href="#" className="text-primary font-semibold hover:underline">Fale com nosso especialista</a>
                        </p>
                        <div className="flex justify-center gap-6 mt-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                             <span className="material-symbols-outlined text-4xl">verified_user</span>
                             <span className="material-symbols-outlined text-4xl">lock</span>
                             <span className="material-symbols-outlined text-4xl">credit_card</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Planos;