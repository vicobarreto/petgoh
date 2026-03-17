import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AnatomyZone } from '../../types';

interface InteractiveAnatomyProps {
    onZoneClick: (zone: AnatomyZone) => void;
    activeZoneId?: string;
}

const DOG_ANATOMY_IMG = 'https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=1974&auto=format&fit=crop'; // A side profile dog image

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
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
             <div className="text-center">
                 <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                    Anatomia <span className="text-primary italic">Interativa</span>
                 </h2>
                 <p className="text-gray-500 text-sm mt-2">Clique nos pontos para descobrir cuidados e serviços ideais.</p>
             </div>

             {/* Image Container with relative positioning for absolute hotspots */}
             <div className="relative w-full aspect-[4/3] max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-orange-50/50 flex items-center justify-center">
                 <img 
                    src={DOG_ANATOMY_IMG} 
                    alt="Anatomia do Cão" 
                    className="w-full h-full object-cover opacity-90 mix-blend-multiply" 
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
                             <div className={`absolute w-full h-full rounded-full animate-ping opacity-75 ${isActive ? 'bg-orange-400' : 'bg-white'}`}></div>
                             
                             {/* Core Button */}
                             <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 flex items-center justify-center shadow-lg transition-colors
                                 ${isActive 
                                     ? 'bg-primary border-white text-white rotate-12' 
                                     : 'bg-white border-primary text-primary group-hover:bg-orange-50'
                                 }`}>
                                 <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                                     {zone.icon || 'pets'}
                                 </span>
                             </div>

                             {/* Desktop Tooltip Hover (Hidden on mobile) */}
                             <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block pointer-events-none">
                                <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                                    {zone.name}
                                </div>
                             </div>
                         </button>
                     );
                 })}
             </div>
        </div>
    );
};
