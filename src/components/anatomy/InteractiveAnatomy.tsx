import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AnatomyZone } from '../../types';

interface InteractiveAnatomyProps {
    onZoneClick: (zone: AnatomyZone) => void;
    activeZoneId?: string;
}

const DOG_ANATOMY_IMG = '/foto.saude.jpeg'; // Updated to use the exact jpeg file name

export const InteractiveAnatomy: React.FC<InteractiveAnatomyProps> = ({ onZoneClick, activeZoneId }) => {
    const [zones, setZones] = useState<AnatomyZone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const { data, error } = await supabase
                    .from('anatomy_zones')
                    .select('*')
                    .order('name');
                if (error) throw error;
                setZones(data || []);
            } catch (err) {
                console.error('Error fetching anatomy zones:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchZones();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-6">
             <div className="text-center">
                 <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                    Anatomia <span className="text-primary italic">Interativa</span>
                 </h2>
                 <p className="text-gray-500 text-sm mt-2">Clique nos pontos para descobrir cuidados e serviços ideais.</p>
             </div>

             {/* Image Container with relative positioning for absolute hotspots */}
             <div className="relative w-full aspect-[4/3] max-w-3xl rounded-3xl shadow-2xl border-4 border-white bg-orange-50/50 flex items-center justify-center">
                 <img 
                    src={DOG_ANATOMY_IMG} 
                    alt="Anatomia do Cão" 
                    className="w-full h-full object-cover opacity-90 mix-blend-multiply rounded-[1.25rem]" 
                 />
                 
                 {/* Hotspots Overlay */}
                 {zones.map((zone) => {
                     const isActive = activeZoneId === zone.id;
                     return (
                         <button
                             key={zone.id}
                             className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-all duration-300 group
                                 ${isActive ? 'scale-125 z-20' : 'hover:scale-110'}
                             `}
                             style={{ left: `${zone.x_pos}%`, top: `${zone.y_pos}%` }}
                             onClick={() => onZoneClick(zone)}
                             aria-label={`Ver informações sobre ${zone.name}`}
                         >
                             {/* Pulse effect rings */}
                             <div className={`absolute w-full h-full rounded-full animate-ping opacity-60 ${isActive ? 'bg-[#124b6d]' : 'bg-transparent'}`}></div>
                             
                             {/* Core Button */}
                             <div className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white flex items-center justify-center shadow-md transition-all
                                 ${isActive 
                                     ? 'bg-[#0c3650] text-white scale-110 shadow-xl' 
                                     : 'bg-[#124b6d] text-white/90 hover:bg-[#0c3650] hover:scale-105'
                                 }`}>
                                 <span className="material-symbols-outlined text-[16px] sm:text-[20px] leading-none">
                                     {zone.icon === 'default' ? 'pets' : 'pets'}
                                 </span>
                             </div>

                             {/* Desktop Tooltip Hover (Hidden on mobile) */}
                             <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block pointer-events-none w-56 z-50">
                                <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 text-left relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-b border-l border-gray-100 rotate-45"></div>
                                    <h4 className="font-bold text-[#124b6d] text-sm mb-1">{zone.name}</h4>
                                    <p className="text-xs text-gray-500 leading-snug mb-2 line-clamp-2">{zone.description}</p>
                                    <div className="text-[10px] font-bold text-[#124b6d]/60 uppercase tracking-widest flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">ads_click</span>
                                        Ver informações
                                    </div>
                                </div>
                             </div>
                         </button>
                     );
                 })}
             </div>
        </div>
    );
};
