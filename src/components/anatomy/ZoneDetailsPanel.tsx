import React from 'react';
import { AnatomyZone } from '../../types';

interface ZoneDetailsPanelProps {
    zone: AnatomyZone | null;
    onBookService?: (serviceName: string) => void;
}

export const ZoneDetailsPanel: React.FC<ZoneDetailsPanelProps> = ({ zone, onBookService }) => {
    if (!zone) {
        return (
            <div className="w-full max-w-2xl mx-auto mt-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center animate-in fade-in">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">touch_app</span>
                <p className="text-gray-500 font-medium">Selecione uma área no corpo do cão acima para ver recomendações.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto mt-6 bg-white border border-gray-100 shadow-xl shadow-orange-900/5 rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 text-primary flex items-center justify-center flex-shrink-0 border border-orange-100">
                     <span className="material-symbols-outlined text-3xl sm:text-4xl">{zone.icon || 'pets'}</span>
                </div>
                <div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">{zone.name}</h3>
                    <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{zone.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Symptoms / Risk factors */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span>
                        Sintomas Comuns
                    </h4>
                    {zone.symptoms && zone.symptoms.length > 0 ? (
                        <ul className="space-y-2">
                            {zone.symptoms.map((symptom, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                    <span>{symptom}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Nenhum sintoma específico listado.</p>
                    )}
                </div>

                {/* Recommended Services (Simplified for now - can be dynamic) */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-green-500 text-[18px]">medical_services</span>
                        Serviços Recomendados
                    </h4>
                    
                    <div className="space-y-3">
                         <div className="bg-white border-2 border-primary/20 hover:border-primary p-3 rounded-xl transition-colors cursor-pointer group" onClick={() => onBookService?.(`Consulta focada: ${zone.name}`)}>
                             <div className="flex items-center justify-between">
                                 <div>
                                     <h5 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">Exame Clínico de Rotina</h5>
                                     <p className="text-xs text-gray-500 mt-0.5">Diagnóstico especializado</p>
                                 </div>
                                 <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                     <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
