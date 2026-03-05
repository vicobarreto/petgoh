import React from 'react';
import { useNavigate } from 'react-router-dom';

const Exames: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
            <main className="flex-1 flex flex-col items-center w-full">
                <div className="w-full max-w-[1200px] px-6 py-8 flex flex-col gap-8">
                    {/* Search Big */}
                    <section className="w-full">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400">search</span>
                            </div>
                            <input className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none text-gray-700 placeholder-gray-400 text-lg" placeholder="Qual exame seu pet precisa?" type="text" />
                        </div>
                    </section>

                    {/* Categories Grid */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Categorias de Exames</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { name: "Sangue & Urina", icon: "water_drop", color: "blue" },
                                { name: "Raio-X & Imagem", icon: "tibia", color: "purple" },
                                { name: "Cardiológico", icon: "cardiology", color: "red" },
                                { name: "Check-up Completo", icon: "biotech", color: "green" }
                            ].map((cat, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-3 aspect-square text-center group">
                                    <div className={`size-16 rounded-full bg-${cat.color}-50 flex items-center justify-center group-hover:bg-${cat.color}-100 transition-colors`}>
                                        <span className={`material-symbols-outlined text-${cat.color}-600 text-3xl`}>{cat.icon}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Labs List */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Laboratórios Parceiros</h2>
                            <button className="text-primary font-semibold text-sm hover:underline">Ver mapa</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {[
                                { name: "LabPet Diagnósticos", addr: "Av. das Américas, 500 - Barra da Tijuca", badge: "Resultado em 24h", tag: "Coleta Domiciliar", score: "4.9", logo: "LAB 1" },
                                { name: "Centro Vet Imagem", addr: "Rua Voluntários da Pátria, 120 - Botafogo", badge: "Laudo Imediato", tag: "Estacionamento", score: "4.8", logo: "LAB 2" },
                                { name: "ProVet Análises", addr: "Av. Copacabana, 800 - Copacabana", badge: "Resultado em 12h", tag: "Plantão 24h", score: "5.0", logo: "LAB 3" }
                            ].map((lab, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all flex items-center gap-4">
                                    <div className="size-20 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                        <span className="font-bold text-gray-400 text-xs text-center leading-tight">LOGO<br />{lab.logo}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900 text-lg truncate">{lab.name}</h3>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700 text-xs font-bold">
                                                <span>{lab.score}</span>
                                                <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2 truncate">{lab.addr}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-semibold">
                                                <span className="material-symbols-outlined text-[14px]">timer</span>
                                                {lab.badge}
                                            </div>
                                            <span className="text-xs text-gray-400">• {lab.tag}</span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-col items-end justify-center">
                                        <button className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-colors">
                                            Agendar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Promo Banner */}
                    <section className="w-full mt-2">
                        <div className="bg-gradient-to-r from-primary to-orange-400 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-xl mb-1">Não sabe qual exame agendar?</h3>
                                    <p className="text-orange-50 text-sm">Envie a foto do pedido médico e nós agendamos para você.</p>
                                </div>
                                <button className="bg-white text-primary font-bold py-2.5 px-6 rounded-xl hover:bg-orange-50 transition-colors shadow-sm w-full md:w-auto text-sm">
                                    Enviar Pedido
                                </button>
                            </div>
                            <div className="absolute -right-6 -bottom-10 opacity-20 transform rotate-12">
                                <span className="material-symbols-outlined text-[140px]">receipt_long</span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Exames;