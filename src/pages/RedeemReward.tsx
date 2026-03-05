import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const RedeemReward: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // In a real app, you'd fetch reward details with this ID.
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Mock data
    const reward = { name: "Banho & Tosa Higiênica", cost: 500, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDeRpWJlAMgEvJ5A2QxnbuwWFxtQw-h8BqJGW3VxTM1vDx8iukjlL7iZm9bWccRa4_Yu10R_PLS2Q4vk1kZoUylX2RPVNOcwiDd4TcrqP3uEpdrJghHlUhVvyVV9ALvTYlCIfgOnxUsTxg5-dbSRr2w5lWhhEv4aUTVO3KlUt7XGFf2tqQCAwksZ38c8cLh79lU8HvDrE40X1-_yO2dU2Yzq5MkN_VtvP0p384MeOjEO4CTMi2wdPI1bYhcvTs970ZCBfWdQFgT6Lf" };
    const userBalance = 1250;

    const handleConfirm = () => {
        // Here you would process the redemption
        setIsSuccess(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-scale-in">
                {!isSuccess ? (
                    <div>
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Confirmar Resgate</h2>
                                <p className="text-sm text-gray-500 mt-1">Revise os detalhes da sua troca.</p>
                            </div>
                            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined text-xl">close</span></button>
                        </div>
                        <div className="p-6 space-y-8">
                            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-background-light items-start">
                                <img src={reward.image} alt={reward.name} className="w-20 h-20 rounded-lg object-cover shadow-sm" />
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">{reward.name}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Válido para cães de pequeno porte.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Seu saldo atual</span><span className="font-medium text-gray-900">{userBalance} pts</span></div>
                                <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Valor do resgate</span><span className="font-bold text-red-500">- {reward.cost} pts</span></div>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-semibold text-gray-900">Saldo restante</span>
                                    <span className="text-xl font-bold text-primary">{userBalance - reward.cost} pts</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-gray-100">
                            <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors w-full sm:w-auto">Cancelar</button>
                            <button onClick={handleConfirm} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 w-full sm:w-auto">Confirmar Resgate</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-5xl text-green-500">check_circle</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Parabéns!</h2>
                        <p className="text-gray-500 mb-8">Seu cupom está disponível em "Meus Pedidos".</p>
                        <div className="flex flex-col gap-3 w-full">
                            <button onClick={() => navigate('/orders')} className="w-full px-5 py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-orange-600">Ver Meus Vouchers</button>
                            <button onClick={() => navigate('/fidelidade')} className="w-full px-5 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-800">Voltar para Fidelidade</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RedeemReward;