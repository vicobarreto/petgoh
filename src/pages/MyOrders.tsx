import React, { useState, useEffect } from 'react';
import { IMAGES } from '../types';
import { useLocation } from 'react-router-dom';

const MyOrders: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const location = useLocation();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('success')) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000); // Hide after 5s
        }
    }, [location]);

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-background-light relative">
            
            {/* Success Toast */}
            {showSuccess && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="font-bold">Pagamento confirmado com sucesso!</span>
                </div>
            )}

            <div className="w-full max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 overflow-hidden">
                {/* Left Panel: Orders List */}
                <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-[#181310] mb-1">Seus Pedidos</h2>
                        <p className="text-sm text-gray-500">Gerencie agendamentos e vouchers.</p>
                        <div className="flex gap-1 bg-background-light p-1 rounded-lg mt-4">
                            <button 
                                onClick={() => setActiveTab('active')}
                                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Ativos
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Histórico
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                        {/* New Order from Checkout (Mock) */}
                        {showSuccess && activeTab === 'active' && (
                             <div className="group relative flex flex-col gap-3 p-4 rounded-xl bg-orange-50 border-2 border-primary/50 cursor-pointer transition-all animate-pulse">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="size-12 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary">local_taxi</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#181310] text-sm leading-tight">Pacote Férias Premium</h3>
                                            <p className="text-xs text-gray-500 mt-1">Vários Parceiros</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">Novo</span>
                                </div>
                                <div className="flex items-center justify-between mt-1 pt-3 border-t border-primary/10">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                        <span>14 Out, 08:00</span>
                                    </div>
                                    <span className="text-primary font-bold text-sm">R$ 480,00</span>
                                </div>
                            </div>
                        )}

                        {/* Card 1 (Active) */}
                        {activeTab === 'active' && (
                            <>
                                <div className="group relative flex flex-col gap-3 p-4 rounded-xl bg-primary/5 border-2 border-primary cursor-pointer transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="size-12 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-primary">shower</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#181310] text-sm leading-tight">Banho Premium</h3>
                                                <p className="text-xs text-gray-500 mt-1">PetShop AuAu</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">Agendado</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1 pt-3 border-t border-primary/10">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                            <span>Hoje, 14:00</span>
                                        </div>
                                        <span className="text-primary font-bold text-sm">R$ 85,00</span>
                                    </div>
                                </div>
                                <div className="group relative flex flex-col gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-300 cursor-pointer transition-all hover:shadow-md">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="size-12 rounded-lg bg-background-light flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-gray-500">vaccines</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#181310] text-sm leading-tight">Vacinação V10</h3>
                                                <p className="text-xs text-gray-500 mt-1">VetCare Center</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">Aguardando</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                            <span>15 Out, 09:30</span>
                                        </div>
                                        <span className="text-gray-900 font-bold text-sm">R$ 120,00</span>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {/* History (Mock) */}
                        {activeTab === 'history' && (
                             <div className="group relative flex flex-col gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 opacity-75">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="size-12 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-gray-400">content_cut</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-600 text-sm leading-tight">Tosa Higiênica</h3>
                                            <p className="text-xs text-gray-400 mt-1">PetStyle</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wide">Concluído</span>
                                </div>
                                <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                        <span className="material-symbols-outlined text-[16px]">event_available</span>
                                        <span>10 Set, 10:00</span>
                                    </div>
                                    <span className="text-gray-500 font-bold text-sm">R$ 60,00</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Voucher Details */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
                    {/* Background Decoration */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-orange-100/30 z-0"></div>
                    <div className="relative z-10 flex flex-col h-full overflow-y-auto">
                        {/* Header */}
                        <div className="px-6 md:px-10 pt-8 pb-6 flex items-start justify-between">
                            <div className="flex gap-5 items-center">
                                <div className="size-16 md:size-20 rounded-2xl bg-white shadow-md flex items-center justify-center p-1 shrink-0">
                                    <div className="w-full h-full rounded-xl bg-gray-100 bg-center bg-cover" style={{ backgroundImage: `url('${IMAGES.PARTNER_LOGO}')` }}></div>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#181310] tracking-tight">Banho Premium</h1>
                                    <div className="flex items-center gap-2 mt-1 text-gray-500">
                                        <span className="material-symbols-outlined text-sm">storefront</span>
                                        <span className="text-sm font-medium">PetShop AuAu</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold border border-green-200">Split Pago</span>
                                        <span className="text-xs text-gray-400">• Pedido #4829</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Content Body */}
                        <div className="flex-1 px-6 md:px-10 py-4 flex flex-col items-center">
                            {/* Voucher Card */}
                            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col items-center p-8 mb-8 relative">
                                {/* Top cutouts for ticket look */}
                                <div className="absolute top-1/2 -left-3 size-6 bg-background-light rounded-full"></div>
                                <div className="absolute top-1/2 -right-3 size-6 bg-background-light rounded-full"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Voucher de Serviço</p>
                                {/* QR Code */}
                                <div className="size-48 md:size-56 bg-white p-2 rounded-2xl border-4 border-primary/20 flex items-center justify-center mb-6">
                                    <img src={IMAGES.QR_CODE} alt="QR Code" className="w-full h-full object-contain opacity-90" />
                                </div>
                                {/* Code Display */}
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <span className="text-xs text-gray-500 font-medium">Código do Voucher</span>
                                    <div className="flex items-center gap-3 px-6 py-3 bg-background-light rounded-xl border border-gray-200 w-full justify-center group cursor-pointer hover:border-primary/50 transition-colors" onClick={() => alert('Código copiado!')}>
                                        <span className="text-2xl md:text-3xl font-mono font-bold text-[#181310] tracking-wider">PET-X92-B71</span>
                                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-xl">content_copy</span>
                                    </div>
                                </div>
                                <div className="w-full h-px border-t border-dashed border-gray-300 my-8"></div>
                                {/* Voucher Info */}
                                <div className="w-full flex justify-between items-end">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500">Data</span>
                                        <span className="font-bold text-sm text-[#181310]">12 Outubro, 2023</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-right">
                                        <span className="text-xs text-gray-500">Horário</span>
                                        <span className="font-bold text-sm text-[#181310]">14:00 - 15:30</span>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md pb-6">
                                <button onClick={() => alert('Abrindo instruções...')} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md shadow-orange-200 transition-all">
                                    <span className="material-symbols-outlined text-[20px]">info</span>
                                    Ver Instruções
                                </button>
                                <button onClick={() => alert('Abrindo mapas...')} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#181310] font-bold text-sm transition-all">
                                    <span className="material-symbols-outlined text-[20px]">map</span>
                                    Como Chegar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyOrders;