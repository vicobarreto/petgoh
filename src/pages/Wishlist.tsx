import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';

const Wishlist: React.FC = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'list' | 'compare'>('list');
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    if (view === 'compare') {
        return (
            <div className="flex-col min-h-screen bg-gray-50 flex items-center w-full">
                <main className="w-full max-w-7xl px-4 sm:px-6 py-8">
                    <div className="bg-secondary rounded-xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-2">
                                <button onClick={() => setView('list')} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-white">arrow_back</span>
                                </button>
                                <h1 className="text-2xl font-bold">Comparar Itens Salvos</h1>
                            </div>
                            <p className="text-blue-100 pl-14 max-w-xl">Compare lado a lado os detalhes dos pacotes selecionados.</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="p-6 w-1/4 bg-gray-50/50"><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Itens</span></th>
                                    <th className="p-6 w-1/4">
                                        <h3 className="font-bold text-gray-900 text-lg">Pacote Férias</h3>
                                        <p className="text-xs text-gray-500">Dezembro</p>
                                    </th>
                                    <th className="p-6 w-1/4 bg-primary/5 border-x-2 border-t-2 border-primary/20 rounded-t-xl relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-b-md">MELHOR OPÇÃO</div>
                                        <h3 className="font-bold text-gray-900 text-lg text-primary mt-2">Final de Semana</h3>
                                        <p className="text-xs text-gray-500">Relax</p>
                                    </th>
                                    <th className="p-6 w-1/4">
                                        <h3 className="font-bold text-gray-900 text-lg">Passeio VIP</h3>
                                        <p className="text-xs text-gray-500">Mensal</p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="p-6 font-semibold text-gray-700 bg-gray-50/30">Preço</td>
                                    <td className="p-6"><span className="text-2xl font-bold text-gray-900">R$ 480</span></td>
                                    <td className="p-6 bg-primary/5 border-x border-primary/10"><span className="text-2xl font-bold text-primary">R$ 290</span></td>
                                    <td className="p-6"><span className="text-2xl font-bold text-gray-900">R$ 650</span></td>
                                </tr>
                                <tr>
                                    <td className="p-6 font-semibold text-gray-700 bg-gray-50/30">Duração</td>
                                    <td className="p-6">3 Dias</td>
                                    <td className="p-6 bg-primary/5 border-x border-primary/10">2 Dias</td>
                                    <td className="p-6">30 Dias</td>
                                </tr>
                                <tr>
                                    <td className="p-6 border-b-0"></td>
                                    <td className="p-6 border-b-0"><button className="w-full bg-secondary text-white py-2 rounded-lg font-bold text-sm">Adicionar</button></td>
                                    <td className="p-6 border-b-0 bg-primary/5 border-x border-b border-primary/10 rounded-b-xl"><button className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm">Adicionar</button></td>
                                    <td className="p-6 border-b-0"><button className="w-full bg-secondary text-white py-2 rounded-lg font-bold text-sm">Adicionar</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex-col min-h-screen bg-gray-50 flex items-center w-full">
            <main className="w-full max-w-7xl px-4 sm:px-6 py-8">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 text-primary">
                            <span className="material-symbols-outlined text-2xl">bookmark</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Minha Lista</h1>
                            <p className="text-sm text-gray-500">Gerencie seus pacotes e serviços favoritos</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setView('compare')} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">compare_arrows</span> Comparar
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">filter_list</span> Filtrar
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Card 1 */}
                    <div className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 flex flex-col sm:flex-row gap-5">
                        <div className="relative w-full sm:w-40 sm:h-40 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <img src={IMAGES.TWO_DOGS} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Pack" />
                            <div className="absolute bottom-2 left-2 flex gap-1">
                                <div className="bg-white/90 p-1.5 rounded-md text-primary shadow-sm"><span className="material-symbols-outlined text-[16px]">hotel</span></div>
                                <div className="bg-white/90 p-1.5 rounded-md text-primary shadow-sm"><span className="material-symbols-outlined text-[16px]">directions_car</span></div>
                                <div className="bg-white/90 p-1.5 rounded-md text-primary shadow-sm"><span className="material-symbols-outlined text-[16px]">bathtub</span></div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">PROMO</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsAlertModalOpen(true)} className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined text-[20px]">notifications_active</span></button>
                                        <button className="text-gray-300 hover:text-red-500"><span className="material-symbols-outlined text-[20px]">delete_outline</span></button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">Pacote Férias Dezembro</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">Inclui 3 diárias de hospedagem premium + Transporte ida e volta + Banho relaxante.</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 line-through">R$ 520,00</span>
                                    <span className="text-xl font-bold text-primary">R$ 480,00</span>
                                </div>
                                <button onClick={() => navigate('/cart')} className="bg-secondary hover:bg-blue-900 text-white py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2">
                                    <span className="text-sm font-semibold hidden sm:inline">Adicionar</span>
                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 flex flex-col sm:flex-row gap-5">
                        <div className="relative w-full sm:w-40 sm:h-40 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <img src={IMAGES.DOG_WALKER} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Pack" />
                            <div className="absolute bottom-2 left-2 flex gap-1">
                                <div className="bg-white/90 p-1.5 rounded-md text-primary shadow-sm"><span className="material-symbols-outlined text-[16px]">directions_walk</span></div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Assinatura</span>
                                    <div className="flex gap-2">
                                        <button className="text-gray-300 hover:text-red-500"><span className="material-symbols-outlined text-[20px]">delete_outline</span></button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">Passeio VIP Mensal</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">Passeios diários de 1 hora com adestrador profissional.</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 line-through">R$ 800,00</span>
                                    <span className="text-xl font-bold text-primary">R$ 650,00</span>
                                </div>
                                <button className="bg-secondary hover:bg-blue-900 text-white py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2">
                                    <span className="text-sm font-semibold hidden sm:inline">Adicionar</span>
                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Modal */}
                {isAlertModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAlertModalOpen(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                            <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">notifications_active</span>
                                    <h3 className="text-lg font-bold">Criar Alerta de Preço</h3>
                                </div>
                                <button onClick={() => setIsAlertModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                            </div>
                            <div className="p-6">
                                <div className="flex gap-4 mb-6">
                                    <img src={IMAGES.TWO_DOGS} alt="Pkg" className="size-16 rounded-lg object-cover" />
                                    <div>
                                        <h4 className="font-bold text-gray-900">Pacote Férias Dezembro</h4>
                                        <p className="text-sm text-gray-500">Preço atual: <span className="text-primary font-bold">R$ 480,00</span></p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Avise-me quando o preço for menor que:</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                        <input type="number" defaultValue="450.00" className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 text-lg font-bold text-gray-900 focus:border-primary focus:ring-primary" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">BRL</span>
                                    </div>
                                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">trending_down</span> Você economizará R$ 30,00 (6%)</p>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-sm">mail</span></div>
                                            <span className="text-sm font-medium text-gray-700">Notificar por E-mail</span>
                                        </div>
                                        <input type="checkbox" defaultChecked className="text-primary focus:ring-primary rounded" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><span className="material-symbols-outlined text-sm">chat</span></div>
                                            <span className="text-sm font-medium text-gray-700">Notificar por WhatsApp</span>
                                        </div>
                                        <input type="checkbox" className="text-primary focus:ring-primary rounded" />
                                    </label>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <button onClick={() => setIsAlertModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">Cancelar</button>
                                    <button onClick={() => setIsAlertModalOpen(false)} className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-blue-900 font-medium text-sm">Criar Alerta</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Wishlist;