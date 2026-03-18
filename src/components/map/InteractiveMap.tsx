import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Accommodation } from './mapData';

// Fix for default Leaflet icons in Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a custom paw icon function
const createCustomIcon = (isSelected: boolean, price: number) => {
    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `
            <div class="relative group cursor-pointer transform transition-transform duration-300 ${isSelected ? 'scale-110 z-50' : 'hover:scale-105 z-40'}">
                <div class="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full shadow-lg border-2 ${isSelected ? 'bg-primary border-white text-white' : 'bg-white border-primary text-primary'} font-bold text-sm select-none">
                    <span class="material-symbols-outlined text-sm">pets</span>
                    R$ ${price}
                </div>
                <div class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] ${isSelected ? 'border-t-primary' : 'border-t-white'} drop-shadow-sm"></div>
            </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 45], // Center bottom
        popupAnchor: [0, -45] // Center top
    });
};

// Component to handle auto-panning when selection changes
const MapEffect: React.FC<{ selectedId: string | null; accommodations: Accommodation[] }> = ({ selectedId, accommodations }) => {
    const map = useMap();
    
    useEffect(() => {
        if (selectedId) {
            const selected = accommodations.find(a => a.id === selectedId);
            if (selected && isFinite(selected.lat) && isFinite(selected.lng)) {
                map.flyTo([selected.lat, selected.lng], 14, {
                    animate: true,
                    duration: 1.5
                });
            }
        }
    }, [selectedId, map, accommodations]);

    return null;
};

interface InteractiveMapProps {
    accommodations: Accommodation[];
    selectedId: string | null;
    onSelectAccommodation: (id: string) => void;
    onViewDetails: (id: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
    accommodations, 
    selectedId, 
    onSelectAccommodation,
    onViewDetails
}) => {
    // Recife and Jaboatão central point
    const centerLatLng: [number, number] = [-8.08, -34.90];

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 z-0">
            <MapContainer 
                center={centerLatLng} 
                zoom={12} 
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={true}
                attributionControl={false}
            >
                {/* Clean, modern CartoDB Positron tiles for Airbnb-like vibe */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                
                <MapEffect selectedId={selectedId} accommodations={accommodations} />

                {accommodations
                    .filter((acc) => typeof acc.lat === 'number' && typeof acc.lng === 'number' && isFinite(acc.lat) && isFinite(acc.lng))
                    .map((acc) => (
                    <Marker 
                        key={acc.id} 
                        position={[acc.lat, acc.lng]}
                        icon={createCustomIcon(selectedId === acc.id, acc.price)}
                        eventHandlers={{
                            click: () => onSelectAccommodation(acc.id)
                        }}
                    >
                        <Popup className="petgoh-popup" closeButton={false}>
                            <div className="w-56 rounded-xl overflow-hidden cursor-pointer" onClick={() => onViewDetails(acc.id)}>
                                <div className="h-32 w-full relative">
                                    <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                        <span className="material-symbols-outlined text-yellow-400 text-[12px]">star</span>
                                        <span className="text-[11px] font-bold text-gray-800">{acc.rating}</span>
                                    </div>
                                    <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase">
                                        {acc.category}
                                    </div>
                                </div>
                                <div className="p-3 bg-white">
                                    <h4 className="font-bold text-gray-900 leading-tight mb-1 text-sm bg-transparent line-clamp-1">{acc.name}</h4>
                                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">{acc.description}</p>
                                    
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                        <div className="text-sm">
                                            <span className="font-bold text-gray-900">R$ {acc.price}</span>
                                            <span className="text-gray-400 text-xs font-normal"> / noite</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};
