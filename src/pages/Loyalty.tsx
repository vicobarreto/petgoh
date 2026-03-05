import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';

const Loyalty: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'points' | 'catalog'>('points');

    return (
        <div className="bg-background-light min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="md:w-64 flex-shrink-0">
                        <div className="sticky top-28 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                            <div className="flex items-center gap-3 mb-6 p-2">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-primary text-2xl">loyalty</span>
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold tracking-tight text-slate-900">Fidelidade</h1>
                                    <p className="text-xs text-slate-500 font-medium">Seus pontos e prêmios</p>
                                </div>
                            </div>
                            <nav className="flex-1 space-y-1">
                                <button onClick={() => setActiveTab('points')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'points' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <span className="material-symbols-outlined text-[20px]">stars</span>
                                    Meus Pontos
                                </button>
                                <button onClick={() => setActiveTab('catalog')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'catalog' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <span className="material-symbols-outlined text-[20px]">redeem</span>
                                    Catálogo de Prêmios
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1">
                        {activeTab === 'points' && <MyPointsView onSeeRewards={() => setActiveTab('catalog')} />}
                        {activeTab === 'catalog' && <RewardsCatalogView />}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-component for My Points
// FIX: Destructured onSeeRewards from props to make it available in the component scope.
const MyPointsView: React.FC<{ onSeeRewards: () => void }> = ({ onSeeRewards }) => {
    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Programa de Fidelidade</h2>
                <p className="text-slate-500 mt-1">Gerencie seus pontos e troque por recompensas exclusivas.</p>
            </div>

            {/* Main Balance Card */}
            <div className="relative overflow-hidden bg-primary rounded-2xl shadow-lg p-8 text-white flex flex-col justify-between min-h-[240px] mb-8">
                 <div className="relative z-10">
                    <h3 className="text-5xl font-bold mb-1">1.250 <span className="text-2xl font-normal opacity-80">pts</span></h3>
                    <p className="text-white/80 text-sm">Pontos disponíveis</p>
                    <div className="mt-8 flex gap-3">
                        <button onClick={onSeeRewards} className="bg-white text-primary hover:bg-slate-50 font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                            Ver Recompensas <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                 </div>
            </div>

            {/* How to Earn Section */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Como Ganhar Pontos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group bg-white rounded-xl p-5 border border-slate-100">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">+50 pts</span>
                        <h4 className="font-semibold text-slate-900 my-1">Agendamentos</h4>
                        <p className="text-sm text-slate-500">Ganhe a cada serviço concluído.</p>
                    </div>
                    <div className="group bg-white rounded-xl p-5 border border-slate-100">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">+20 pts</span>
                        <h4 className="font-semibold text-slate-900 my-1">Avaliações</h4>
                        <p className="text-sm text-slate-500">Avalie os profissionais e serviços.</p>
                    </div>
                     <div className="group bg-white rounded-xl p-5 border border-slate-100">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">+100 pts</span>
                        <h4 className="font-semibold text-slate-900 my-1">Indicações</h4>
                        <p className="text-sm text-slate-500">Convide amigos para o PetGoH.</p>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Histórico de Pontos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="px-6 py-4 font-medium">12 Out, 2023</td>
                                <td className="px-6 py-4">Banho & Tosa - Thor</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">+50 pts</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium">05 Out, 2023</td>
                                <td className="px-6 py-4">Resgate de Cupom R$50</td>
                                <td className="px-6 py-4 text-right font-bold text-slate-500">-500 pts</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Sub-component for Rewards Catalog
const RewardsCatalogView: React.FC = () => {
    const navigate = useNavigate();
    const userPoints = 850;

    const rewards = [
        { id: 1, name: "Banho & Tosa Completo", type: "Serviço", cost: 800, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_hmMuqsrCd7o2JfgpJvB-hfQZxiq71G0DhvUpDds3bpZc7Iy0gcNCn7TPc1f38Z7ViJD_ZtIOS4T812MP7_iDq6AGDpQCIzMSVS5UQMu9HdHIInfuB9j-CEu06ecbDc7wVW7kr-B2B39Y2sAHq3kmtTrvb0TEJuSKB3obDQllhr-hV0w2uIQ6GdM5pUAmSCIsV3Ki_caT8s1qkjNzHOX49c7QARpNdhSP2dxhsTDtG94EEylZ72LaRStzZjBeUDKwlLEqvWW7erJT" },
        { id: 2, name: "Ração Premium 15kg", type: "Produto", cost: 1500, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQOnkMFiKaI4SE0Iu6cq3Xvfmwr1EdIVM4lOju1bl0Kf6fQ0bK9ieNZoOdPJH7Sp9ej2g2mOyDxZohrHie7nzFDvRSWv3QcXr5m_zf3DusqLCX8p160rm_ePplEzz-CVK2IuCnC4zxAw3cOJK1n7kLNA4optQmcqSeNZGWucCKUwwQ_ezFFsAAMJ08wCWVN6bnBwsynPKao3BnWp_grGTT0B_rO3Y_KIQWKPUma3jDKlqND3mcZLyFrKnjB0TPaPihMSExsj9hqMP9" },
        { id: 3, name: "Brinquedo Mordedor", type: "Produto", cost: 300, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGC-PefLq185v3OLftWyjDx52zc2-U9Fd42WZ0U2seOIv0c332Rrbxg3ROHvCQ36f4oGMuOkMobBpZP67VcufVJup7blUKLCW80RhNlse0jOqd7_a2OrPUJ9i2QAp9JqAksrTLd_7GbHHkjcX2T3LLLkiEyuhxJFzxJBZlO8vUKI4HYFiggAuUgp8Egc9r5JKmkCVyWPbAViAfkGlXH8Bz74H---a1mqD3E62WFisThzRHpC8QOsK_sZr5G7-DCaSrKl31iOrsSo6L" },
        { id: 4, name: "Consulta Veterinária", type: "Serviço", cost: 500, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeyWQeRfnCszhgk23T68dIuR4NNtY6f_PN7Ub_X92QARA_p43ictPcn_nbIRv-DWd65lz57mgcY3axpjdd7ArbL-odQvHTgeLev7-4-lpQkMQsGbBwJKIrDjVe4B66qymdvf5hW_DCZBliTOv4p2Gb-uB_J4vn4sBvG5dWWdo2baoAJUDiOoQPzbxlobAwm_9Sofy6RvqQajTciy_znRb19U-hoqa962VytvhcB9OaoGem6isSGl-ARz-HIsPVi1LlzNTeWdYfQvSY" },
    ];

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Catálogo de Prêmios</h2>
                <p className="text-slate-500 mt-1">Troque seus pontos por serviços e produtos para seu pet.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {rewards.map(reward => {
                    const canRedeem = userPoints >= reward.cost;
                    const progress = canRedeem ? 100 : (userPoints / reward.cost) * 100;
                    
                    return (
                        <div key={reward.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                            <div className="relative aspect-video overflow-hidden">
                                <img className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" src={reward.image} alt={reward.name} />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">{reward.type}</div>
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">{reward.name}</h3>
                                <div className="mt-auto pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-500">Custo</span>
                                        <span className={`font-bold text-lg flex items-center gap-1 ${canRedeem ? 'text-primary' : 'text-slate-900 opacity-60'}`}>
                                            {reward.cost} <span className="material-symbols-outlined text-sm">stars</span>
                                        </span>
                                    </div>
                                    {!canRedeem && (
                                        <div className="mb-3">
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <p className="text-xs text-primary mt-1 font-medium">Faltam {reward.cost - userPoints} pontos</p>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => canRedeem && navigate(`/resgatar/${reward.id}`)}
                                        disabled={!canRedeem}
                                        className={`w-full font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
                                            canRedeem 
                                                ? 'bg-primary hover:bg-orange-600 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                        }`}
                                    >
                                        {canRedeem && <span className="material-symbols-outlined text-sm">redeem</span>}
                                        Resgatar
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default Loyalty;