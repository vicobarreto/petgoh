import React from 'react';
import { Accommodation } from './mapData';
import { PartnerFavoriteButton } from '../../pages/Hospedagem';

interface AccommodationCardProps {
    accommodation: Accommodation;
    isSelected: boolean;
    onHover: (id: string | null) => void;
    onClick: (id: string) => void;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
    accommodation,
    isSelected,
    onHover,
    onClick
}) => {
    return (
        <div 
            className={`w-full flex-shrink-0 snap-center md:snap-align-none bg-white rounded-2xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col sm:flex-row h-full sm:h-auto
                ${isSelected ? 'border-primary ring-4 ring-primary/10 shadow-md' : 'border-gray-100 hover:border-gray-200 shadow-sm'}
            `}
            onMouseEnter={() => onHover(accommodation.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(accommodation.id)}
        >
            {/* Image Section */}
            <div className="relative w-full sm:w-48 h-48 sm:h-full flex-shrink-0">
                <img src={accommodation.image} alt={accommodation.name} className="w-full h-full object-cover" />
                
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-blue-500 text-[14px]">verified</span>
                    {accommodation.category}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-base sm:text-lg leading-tight line-clamp-2">{accommodation.name}</h4>
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 font-bold px-2 py-1 rounded-lg shrink-0">
                            <span className="material-symbols-outlined text-[14px] text-yellow-500">star</span>
                            <span className="text-sm">{accommodation.rating}</span>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 line-clamp-2 sm:line-clamp-3 mb-2">{accommodation.description}</p>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate">{accommodation.address}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                    <div>
                        <div className="text-xs text-gray-500 mb-0.5">A partir de</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg sm:text-2xl font-black text-gray-900">R$ {accommodation.price}</span>
                            <span className="text-xs text-gray-400">/ noite</span>
                        </div>
                    </div>
                    
                    {/* Botão Agendar ou Info */}
                    <button className={`h-10 px-4 rounded-xl font-bold text-sm transition-all sm:w-auto w-full max-w-[120px] ${
                        isSelected 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-orange-600' 
                            : 'bg-orange-50 text-primary hover:bg-primary/10'
                    }`}>
                        Ver Unidade
                    </button>
                </div>
            </div>
        </div>
    );
};
