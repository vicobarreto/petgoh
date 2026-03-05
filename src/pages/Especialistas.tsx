import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';

const Especialistas: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
            <main className="flex-1 flex flex-col items-center w-full">
                <div className="w-full max-w-[1200px] px-6 py-6 flex flex-col gap-8">
                    {/* Directory List */}
                    <section className="flex flex-col gap-3">
                        {[
                            { name: "Dermatologia", count: "12 médicos", icon: "dermatology" },
                            { name: "Ortopedia", count: "8 médicos", icon: "orthopedics" },
                            { name: "Oftalmologia", count: "5 médicos", icon: "visibility" },
                            { name: "Odontologia", count: "7 médicos", icon: "dentistry" },
                            { name: "Cardiologia", count: "4 médicos", icon: "cardiology" }
                        ].map((spec, idx) => (
                            <div key={idx} onClick={() => navigate('/agendar')} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[24px]">{spec.icon}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 text-lg">{spec.name}</span>
                                        <span className="text-sm text-gray-500">{spec.count}</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">chevron_right</span>
                            </div>
                        ))}
                    </section>

                    {/* Top Rated Carousel */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">Especialistas Bem Avaliados</h2>
                            <button onClick={() => navigate('/agendar')} className="text-primary text-sm font-semibold hover:underline">Ver todos</button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar snap-x snap-mandatory">
                            {[
                                { name: "Dr. Rafael Santos", role: "Dermatologia", score: "5.0", reviews: "124", img: IMAGES.DOC_RAFAEL },
                                { name: "Dra. Camila Oliveira", role: "Ortopedia", score: "4.9", reviews: "98", img: IMAGES.DOC_CAMILA },
                                { name: "Dr. Pedro Alves", role: "Oftalmologia", score: "4.8", reviews: "85", img: IMAGES.DOC_PEDRO },
                                { name: "Dra. Mariana Costa", role: "Odontologia", score: "5.0", reviews: "150", img: IMAGES.DOC_MARIANA },
                            ].map((doc, idx) => (
                                <div key={idx} className="snap-center shrink-0 w-[280px] bg-white rounded-2xl border-2 border-yellow-400 shadow-sm p-4 relative overflow-hidden group hover:shadow-lg transition-all">
                                    <div className="absolute top-0 right-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 uppercase tracking-wide">Top Rated</div>
                                    <div className="flex flex-col items-center text-center gap-3">
                                        <div className="relative">
                                            <div className="size-24 rounded-full bg-gray-100 border-4 border-white shadow-md bg-cover bg-center" style={{ backgroundImage: `url('${doc.img}')` }}></div>
                                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                                                <div className="bg-blue-100 text-blue-600 rounded-full p-1">
                                                    <span className="material-symbols-outlined text-[16px]">verified</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{doc.name}</h3>
                                            <p className="text-primary text-sm font-medium">{doc.role}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full text-yellow-700 text-xs font-bold border border-yellow-100">
                                            <span>{doc.score}</span>
                                            <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                                            <span className="text-gray-400 font-normal ml-1">({doc.reviews} avaliações)</span>
                                        </div>
                                        <button onClick={() => navigate('/agendar')} className="w-full mt-2 bg-secondary/5 hover:bg-secondary hover:text-white text-secondary font-medium rounded-lg py-2 text-sm transition-all">
                                            Ver Perfil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Especialistas;