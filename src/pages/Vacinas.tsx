import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Vaccine {
    id: number;
    name: string;
    subtitle: string;
    description: string;
    price: string;
    tags: string[];
    icon: string;
    available?: boolean;
}

const Vacinas: React.FC = () => {
    const navigate = useNavigate();
    const [expandedId, setExpandedId] = useState<number | null>(1); // Default open first

    const vaccines: Vaccine[] = [
        {
            id: 1,
            name: "V10/V8 (Polivalente)",
            subtitle: "Essencial para cães",
            description: "Protege contra diversas doenças graves como cinomose, parvovirose, coronavirose, adenovirose, parainfluenza e leptospirose. Recomendada anualmente para todos os cães.",
            price: "80,00",
            tags: ["Disponível em casa", "Dose única"],
            icon: "vaccines",
            available: true
        },
        {
            id: 2,
            name: "Antirrábica",
            subtitle: "Obrigatória por lei",
            description: "A vacina contra raiva é obrigatória por lei e protege contra uma doença fatal e transmissível para humanos.",
            price: "60,00",
            tags: [],
            icon: "pets",
            available: true
        },
        {
            id: 3,
            name: "Giardia",
            subtitle: "Proteção intestinal",
            description: "Protege contra a giardíase, uma infecção intestinal comum causada por protozoários.",
            price: "Consulte preço",
            tags: [],
            icon: "bug_report",
            available: true
        },
        {
            id: 4,
            name: "Tosse dos Canis",
            subtitle: "Gripe canina",
            description: "Previne a traqueobronquite infecciosa canina, altamente contagiosa em locais com muitos cães.",
            price: "",
            tags: [],
            icon: "healing",
            available: false
        }
    ];

    const toggleAccordion = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
            {/* Warning Banner */}
            <div className="bg-orange-50 border-b border-orange-100 px-6 py-4">
                <div className="max-w-[600px] mx-auto flex items-start gap-3">
                    <div className="bg-orange-100 p-2 rounded-full shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                    </div>
                    <div>
                        <p className="font-medium text-orange-900 text-sm leading-relaxed">
                            A raiva é obrigatória anualmente. <br />
                            <span className="font-bold underline cursor-pointer">Verifique a carteirinha.</span>
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center w-full pb-24">
                <div className="w-full max-w-[600px] px-6 py-6 flex flex-col gap-6">
                    {/* Search */}
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 focus:border-primary focus:ring-primary shadow-sm text-sm" placeholder="Buscar vacina..." type="text" />
                    </div>

                    {/* Accordion List */}
                    <div className="flex flex-col gap-4">
                        {vaccines.map((v) => (
                            <div 
                                key={v.id} 
                                className={`bg-white rounded-2xl border ${expandedId === v.id ? 'border-primary/30 shadow-md' : 'border-gray-100 shadow-sm'} overflow-hidden transition-all ${!v.available ? 'opacity-60' : ''}`}
                            >
                                <div 
                                    className={`p-4 flex justify-between items-center cursor-pointer ${expandedId === v.id ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}
                                    onClick={() => toggleAccordion(v.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${expandedId === v.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                            <span className="material-symbols-outlined">{v.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${expandedId === v.id ? 'text-gray-900' : 'text-gray-700'}`}>{v.name}</h3>
                                            <p className="text-xs text-gray-500">{v.subtitle}</p>
                                        </div>
                                    </div>
                                    {expandedId === v.id ? (
                                        <span className="material-symbols-outlined text-primary transition-transform rotate-180">expand_more</span>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            {v.price && <span className={`text-sm font-bold ${v.price.includes('Consulte') ? 'text-gray-400 font-medium text-xs' : 'text-gray-900'}`}>{v.price.includes('Consulte') ? v.price : `R$ ${v.price}`}</span>}
                                            <span className="material-symbols-outlined text-gray-300">expand_more</span>
                                        </div>
                                    )}
                                </div>
                                
                                {expandedId === v.id && (
                                    <div className="p-4 border-t border-gray-100 animate-fadeIn">
                                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                            {v.description}
                                        </p>
                                        {v.tags.length > 0 && (
                                            <div className="flex items-center gap-2 mb-4">
                                                {v.tags.map((tag, i) => (
                                                    <span key={i} className={`text-xs font-semibold px-2 py-1 rounded ${tag.includes('casa') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end mt-2">
                                            <div>
                                                <span className="text-xs text-gray-500 block">Preço estimado</span>
                                                <span className="text-xl font-bold text-gray-900">R$ {v.price}</span>
                                            </div>
                                            <button onClick={() => navigate('/agendar')} className="bg-primary text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-orange-600 transition-colors">
                                                Selecionar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Safe Badge */}
                    <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            Vacinação Segura
                        </h4>
                        <p className="text-xs text-blue-800 leading-relaxed">
                            Todos os nossos parceiros veterinários seguem rigorosos protocolos de refrigeração e aplicação. A carteirinha é atualizada digitalmente após a aplicação.
                        </p>
                    </div>
                </div>
            </main>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-[600px] mx-auto flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm px-1">
                        <span className="text-gray-500">Total selecionado:</span>
                        <span className="font-bold text-gray-900 text-lg">R$ 80,00</span>
                    </div>
                    <button onClick={() => navigate('/agendar')} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl py-3.5 text-base transition-colors shadow-lg flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">home_health</span>
                        Agendar Vacinação em Casa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Vacinas;