import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';

const AgendarConsulta: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
            <main className="flex-1 flex flex-col items-center w-full">
                <div className="w-full max-w-[800px] px-4 sm:px-6 py-6 flex flex-col gap-6">
                    {/* Filters */}
                    <section>
                        <div className="flex gap-3 overflow-x-auto w-full pb-2 no-scrollbar">
                            <button className="whitespace-nowrap rounded-full bg-secondary text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-secondary/90 transition-colors">
                                Presencial
                            </button>
                            <button className="whitespace-nowrap rounded-full bg-white border border-gray-200 text-gray-700 px-5 py-2 text-sm font-medium shadow-sm hover:border-secondary hover:text-secondary transition-colors">
                                Telemedicina
                            </button>
                            <button className="whitespace-nowrap rounded-full bg-white border border-gray-200 text-gray-700 px-5 py-2 text-sm font-medium shadow-sm hover:border-secondary hover:text-secondary transition-colors">
                                Domiciliar
                            </button>
                            <button className="whitespace-nowrap rounded-full bg-white border border-gray-200 text-gray-700 px-5 py-2 text-sm font-medium shadow-sm hover:border-secondary hover:text-secondary transition-colors">
                                Plantão
                            </button>
                        </div>
                    </section>

                    {/* Doctors List */}
                    <section className="flex flex-col gap-4">
                        {/* Doctor 1: Ana Silva */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div 
                                    className="size-16 rounded-full bg-gray-100 bg-cover bg-center shrink-0 border-2 border-white shadow-sm" 
                                    style={{ backgroundImage: `url('${IMAGES.DOCTOR_ANA}')` }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Dra. Ana Silva</h3>
                                            <p className="text-sm text-gray-500 font-medium">Clínico Geral</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-yellow-500 fill-current">star</span>
                                            <span className="text-sm font-bold text-gray-900">4.9</span>
                                            <span className="text-xs text-gray-500">(80)</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5 text-gray-500 text-sm">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        <span className="truncate">Rua Voluntários da Pátria, Botafogo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-4 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Hoje às 15:30
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">R$ 120</span>
                                </div>
                                <button className="w-full sm:w-auto border border-secondary text-secondary hover:bg-secondary hover:text-white font-semibold rounded-full px-6 py-2.5 text-sm transition-all shadow-sm">
                                    Ver Perfil
                                </button>
                            </div>
                        </div>

                        {/* Doctor 2: Carlos Mendes */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div 
                                    className="size-16 rounded-full bg-gray-100 bg-cover bg-center shrink-0 border-2 border-white shadow-sm" 
                                    style={{ backgroundImage: `url('${IMAGES.DOCTOR_CARLOS}')` }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Dr. Carlos Mendes</h3>
                                            <p className="text-sm text-gray-500 font-medium">Dermatologia</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-yellow-500 fill-current">star</span>
                                            <span className="text-sm font-bold text-gray-900">5.0</span>
                                            <span className="text-xs text-gray-500">(124)</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5 text-gray-500 text-sm">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        <span className="truncate">Av. Nossa Sra. de Copacabana, Copa</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-4 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Amanhã às 09:00
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">R$ 180</span>
                                </div>
                                <button className="w-full sm:w-auto border border-secondary text-secondary hover:bg-secondary hover:text-white font-semibold rounded-full px-6 py-2.5 text-sm transition-all shadow-sm">
                                    Ver Perfil
                                </button>
                            </div>
                        </div>

                        {/* Doctor 3: Juliana Costa */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div 
                                    className="size-16 rounded-full bg-gray-100 bg-cover bg-center shrink-0 border-2 border-white shadow-sm" 
                                    style={{ backgroundImage: `url('${IMAGES.DOCTOR_JULIANA}')` }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Dra. Juliana Costa</h3>
                                            <p className="text-sm text-gray-500 font-medium">Oftalmologia</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-yellow-500 fill-current">star</span>
                                            <span className="text-sm font-bold text-gray-900">4.8</span>
                                            <span className="text-xs text-gray-500">(56)</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5 text-gray-500 text-sm">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        <span className="truncate">Rua Visconde de Pirajá, Ipanema</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-4 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                        Seg, 14 Out às 11:15
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">R$ 200</span>
                                </div>
                                <button className="w-full sm:w-auto border border-secondary text-secondary hover:bg-secondary hover:text-white font-semibold rounded-full px-6 py-2.5 text-sm transition-all shadow-sm">
                                    Ver Perfil
                                </button>
                            </div>
                        </div>

                        {/* Doctor 4: Roberto Lima */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div 
                                    className="size-16 rounded-full bg-gray-100 bg-cover bg-center shrink-0 border-2 border-white shadow-sm" 
                                    style={{ backgroundImage: `url('${IMAGES.DOCTOR_ROBERTO}')` }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Dr. Roberto Lima</h3>
                                            <p className="text-sm text-gray-500 font-medium">Ortopedia</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-yellow-500 fill-current">star</span>
                                            <span className="text-sm font-bold text-gray-900">4.9</span>
                                            <span className="text-xs text-gray-500">(92)</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5 text-gray-500 text-sm">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        <span className="truncate">Av. das Américas, Barra</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-4 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Hoje às 17:00
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">R$ 250</span>
                                </div>
                                <button className="w-full sm:w-auto border border-secondary text-secondary hover:bg-secondary hover:text-white font-semibold rounded-full px-6 py-2.5 text-sm transition-all shadow-sm">
                                    Ver Perfil
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AgendarConsulta;