import React, { useState } from 'react';
import { IMAGES } from '../types';
import { useFavorites } from '../context/FavoritesContext';

const Favorites: React.FC = () => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const { favorites } = useFavorites();

    const getCategoryStyle = (type: string) => {
        switch (type) {
            case 'Veterinário': return { color: 'blue', icon: 'medical_services' };
            case 'Estética': return { color: 'purple', icon: 'content_cut' };
            case 'Lazer': return { color: 'green', icon: 'park' };
            case 'Loja': return { color: 'orange', icon: 'store' };
            case 'Emergência': return { color: 'red', icon: 'local_hospital' };
            case 'Hotel': return { color: 'indigo', icon: 'hotel' };
            case 'Creche': return { color: 'yellow', icon: 'pets' };
            case 'Day Use': return { color: 'teal', icon: 'pool' }; 
            case 'Outros': return { color: 'gray', icon: 'help' };
            default: return { color: 'gray', icon: 'pets' };
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light">
            <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-8 flex gap-8">
                {/* Sidebar Filters */}
                <aside className="w-64 flex-shrink-0 hidden lg:block h-fit sticky top-28">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                            <button className="text-xs text-primary font-medium hover:underline">Limpar</button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Categorias</h3>
                                <div className="space-y-3">
                                    {['Veterinários', 'Pet Shops', 'Hospedagem', 'Estética', 'Lazer'].map((cat, i) => (
                                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" defaultChecked={i === 0} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-offset-0" />
                                            <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Distância Máxima</h3>
                                <input type="range" min="1" max="50" defaultValue="10" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>1km</span>
                                    <span>50km</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Avaliação</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="rating" className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
                                        <div className="flex text-yellow-400 text-sm">
                                            {[1, 2, 3, 4].map(s => <span key={s} className="material-symbols-outlined text-[16px] fill-current">star</span>)}
                                            <span className="material-symbols-outlined text-[16px]">star_outline</span>
                                        </div>
                                        <span className="text-xs text-gray-500">& acima</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="rating" defaultChecked className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
                                        <span className="text-sm text-gray-700">Qualquer nota</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Favoritos</h1>
                                <button 
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20 transition-colors" 
                                    title="Compartilhar Lista"
                                >
                                    <span className="material-symbols-outlined text-xl">share</span>
                                </button>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">{favorites.length} parceiros salvos na sua lista.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 hidden md:inline">Ordenar por:</span>
                            <div className="relative">
                                <select className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm cursor-pointer hover:bg-gray-50">
                                    <option>Relevância</option>
                                    <option>Distância: Menor para Maior</option>
                                    <option>Avaliação: Melhor para Pior</option>
                                    <option>Adicionados Recentemente</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </div>
                            </div>
                            <button className="md:hidden p-2 bg-white border border-gray-200 rounded-lg text-gray-600 shadow-sm">
                                <span className="material-symbols-outlined text-xl">filter_list</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {favorites.map((fav) => (
                            <div key={fav.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col h-[340px]">
                                <div className="h-48 relative overflow-hidden bg-gray-100">
                                    <img src={fav.image} alt={fav.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-red-50 text-red-500 hover:scale-110 transition-all z-10">
                                        <span className="material-symbols-outlined text-[20px] fill-current">favorite</span>
                                    </button>
                                    <div className="absolute bottom-3 left-3 flex gap-2">
                                        <span className={`bg-${getCategoryStyle(fav.type).color}-600/90 text-white text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm shadow-sm flex items-center gap-1`}>
                                            <span className="material-symbols-outlined text-[12px]">{getCategoryStyle(fav.type).icon}</span>
                                            {fav.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-1" title={fav.name}>{fav.name}</h3>
                                            <div className="flex items-center text-primary font-bold text-sm bg-orange-50 px-1.5 py-0.5 rounded shrink-0">
                                                <span className="material-symbols-outlined text-[16px] mr-1 fill-current">star</span>
                                                {fav.rating}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-gray-500 text-sm mb-3">
                                            <span className="material-symbols-outlined text-[16px] mr-1">location_on</span>
                                            {fav.location}
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors text-sm group/btn">
                                            <span className="material-symbols-outlined text-[20px] group-hover/btn:fill-current">edit_note</span>
                                            <span className="font-medium">Anotar</span>
                                        </button>
                                        <button className="text-primary hover:text-orange-600 text-sm font-semibold hover:underline">Ver detalhes</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsShareModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] animate-scale-in">
                        <div className="bg-secondary p-6 pb-8 relative">
                            <div className="flex justify-between items-center text-white mb-4">
                                <h2 className="text-lg font-semibold">Compartilhar Favoritos</h2>
                                <button onClick={() => setIsShareModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="size-20 rounded-full border-4 border-white/20 overflow-hidden mb-3 bg-white">
                                    <img alt="Golden Retriever" className="w-full h-full object-cover" src={IMAGES.THOR_DOG} />
                                </div>
                                <h3 className="text-white font-bold text-lg">Os favoritos do Thor! 🐾</h3>
                                <p className="text-blue-100 text-xs mt-1">Compartilhe suas recomendações com amigos</p>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-6">
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Link Público</label>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2 pr-3">
                                    <span className="material-symbols-outlined text-gray-400 ml-1">link</span>
                                    <input className="bg-transparent border-none text-sm text-gray-600 focus:ring-0 flex-1 w-full truncate" readOnly type="text" value="petgoh.com/lista/thor-favoritos"/>
                                    <button className="text-primary font-semibold text-sm hover:underline whitespace-nowrap">Copiar</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <button className="flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 py-3 px-4 rounded-xl transition-colors font-medium text-sm">
                                    <span className="material-symbols-outlined text-lg">chat</span>
                                    WhatsApp
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 py-3 px-4 rounded-xl transition-colors font-medium text-sm">
                                    <span className="material-symbols-outlined text-lg">mail</span>
                                    Email
                                </button>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-800">Prévia da Lista (3 de 12)</h4>
                                    <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Ver todos</span>
                                </div>
                                <div className="space-y-3">
                                    {favorites.slice(0, 3).map((fav) => (
                                        <div key={fav.id} className="flex gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <img alt={fav.name} className="size-16 rounded-lg object-cover flex-shrink-0" src={fav.image} />
                                            <div className="flex-1 flex flex-col justify-center">
                                                <h5 className="font-semibold text-sm text-gray-900">{fav.name}</h5>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`bg-${getCategoryStyle(fav.type).color}-50 text-${getCategoryStyle(fav.type).color}-600 text-[10px] px-1.5 py-0.5 rounded font-medium`}>{fav.type}</span>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <span className="material-symbols-outlined text-primary text-[12px] mr-0.5 fill-current">star</span>
                                                        {fav.rating}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">share</span>
                                Compartilhar Lista
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Favorites;