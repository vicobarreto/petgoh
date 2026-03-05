import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../types';

const Cart: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="mb-8">
                <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Voltar para Minha Lista
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Meu Carrinho</h1>
                <p className="text-gray-500 mt-1">Revise seus itens e finalize sua reserva.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Item 1 */}
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-6">
                            <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                <img src={IMAGES.TWO_DOGS} className="w-full h-full object-cover" alt="Item" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Pacote Férias Dezembro</h3>
                                        <p className="text-sm text-gray-500 mt-1">Inclui 3 diárias + Transporte + Banho</p>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary mt-2">Hospedagem</span>
                                    </div>
                                    <button className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">delete_outline</span></button>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                        <button className="px-3 py-1 text-gray-600 hover:text-primary font-medium text-lg">-</button>
                                        <span className="px-3 py-1 text-gray-900 font-semibold">1</span>
                                        <button className="px-3 py-1 text-gray-600 hover:text-primary font-medium text-lg">+</button>
                                    </div>
                                    <p className="text-xl font-bold text-primary">R$ 480,00</p>
                                </div>
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className="p-6 flex flex-col sm:flex-row gap-6">
                            <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                <img src={IMAGES.DOG_BED} className="w-full h-full object-cover" alt="Item" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Spa Day Felino</h3>
                                        <p className="text-sm text-gray-500 mt-1">Corte de unhas, limpeza e banho seco</p>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary mt-2">Banho e Tosa</span>
                                    </div>
                                    <button className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">delete_outline</span></button>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                        <button className="px-3 py-1 text-gray-600 hover:text-primary font-medium text-lg">-</button>
                                        <span className="px-3 py-1 text-gray-900 font-semibold">1</span>
                                        <button className="px-3 py-1 text-gray-600 hover:text-primary font-medium text-lg">+</button>
                                    </div>
                                    <p className="text-xl font-bold text-primary">R$ 120,00</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Up-sell */}
                    <div className="pt-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Complete seu Pacote</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer">
                                <div className="size-16 rounded-lg bg-gray-100 overflow-hidden shrink-0"><img src={IMAGES.DOG_WALKER} className="w-full h-full object-cover opacity-80" alt="Extra" /></div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-sm">Pet Taxi Extra</h4>
                                    <p className="text-xs text-gray-500 mb-1">Busca em horário especial</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-primary">R$ 45,00</span>
                                        <button className="size-8 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-blue-900"><span className="material-symbols-outlined text-sm">add</span></button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer">
                                <div className="size-16 rounded-lg bg-gray-100 overflow-hidden shrink-0"><img src={IMAGES.HOTEL_INTERIOR} className="w-full h-full object-cover opacity-80" alt="Extra" /></div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-sm">Ração Premium</h4>
                                    <p className="text-xs text-gray-500 mb-1">Menu degustação gourmet</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-primary">R$ 25,00</span>
                                        <button className="size-8 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-blue-900"><span className="material-symbols-outlined text-sm">add</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="w-full lg:w-96 flex-shrink-0">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal (2 itens)</span><span className="font-medium text-gray-900">R$ 600,00</span></div>
                            <div className="flex justify-between text-sm text-gray-600"><span>Taxa de serviço</span><span className="font-medium text-gray-900">R$ 30,00</span></div>
                            <div className="flex justify-between text-sm text-green-600 font-medium"><span>Desconto de Fidelidade</span><span>- R$ 15,00</span></div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 mb-6">
                            <div className="flex justify-between items-end">
                                <span className="text-base font-semibold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-primary">R$ 615,00</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">ou em até 3x de R$ 205,00 sem juros</p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Cupom de Desconto</label>
                            <div className="flex gap-2">
                                <input className="flex-1 rounded-lg border-gray-300 bg-white text-sm px-3 py-2.5 focus:border-primary focus:ring-primary" placeholder="PET10" type="text" />
                                <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg text-sm font-semibold transition-colors">Aplicar</button>
                            </div>
                        </div>
                        <button className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-lg">
                            Finalizar Pagamento
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            <span>Compra 100% segura</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;