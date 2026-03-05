import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../types';

const PackageDetails: React.FC = () => {
    const [mainImage, setMainImage] = useState(IMAGES.DOG_RUNNING);
    const [isFavorite, setIsFavorite] = useState(false);

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    return (
        <div className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm mb-6 text-gray-500">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link to="/" className="hover:text-primary transition-colors">Pacotes</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="font-semibold text-[#181310]">Pacote Férias Premium</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Gallery */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 relative group cursor-pointer shadow-sm">
                        <img src={mainImage} alt="Main" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center">
                            <span className="text-primary mr-1 text-base">★</span> Destaque
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[IMAGES.DOG_BED, IMAGES.DOG_CAR, IMAGES.TWO_DOGS].map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setMainImage(img)}
                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'}`}
                            >
                                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                        <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors">
                            <span className="text-sm font-medium">+5 fotos</span>
                        </div>
                    </div>
                    {/* Description (Desktop) */}
                    <div className="mt-8 hidden lg:block">
                        <h3 className="text-xl font-bold mb-4">Sobre este pacote</h3>
                        <div className="prose max-w-none text-gray-600 leading-relaxed">
                            <p>Garanta as melhores férias para o seu melhor amigo! O <strong>Pacote Férias Premium</strong> combina hospedagem de luxo com transporte seguro, garantindo tranquilidade total para você e diversão para seu pet.</p>
                            <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-primary">
                                <li>Monitoramento 24h com câmeras ao vivo.</li>
                                <li>Atividades recreativas diárias e socialização.</li>
                                <li>Transporte climatizado com cinto de segurança pet.</li>
                                <li>Relatórios diários via WhatsApp com fotos e vídeos.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Info & Action */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Main Info Card */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-[#181310] leading-tight">Pacote Férias Premium</h1>
                            <button 
                                onClick={toggleFavorite}
                                className={`transition-colors ${isFavorite ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}
                            >
                                <span className={`material-symbols-outlined ${isFavorite ? 'material-symbols-filled' : ''}`}>favorite</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-400 text-lg">
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star_half</span>
                            </div>
                            <span className="text-sm font-semibold text-[#181310]">4.8</span>
                            <span className="text-sm text-gray-500">• 124 avaliações</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-black text-primary">R$ 480,00</span>
                            <span className="text-sm text-gray-500 line-through">R$ 520,00</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Em até 3x de R$ 160,00 sem juros</p>
                        <Link to="/checkout" className="w-full bg-primary hover:bg-[#e67a35] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                            <span>Comprar Agora</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                            Pagamento 100% seguro e dividido automaticamente.
                        </div>
                    </div>

                    {/* Partners Breakdown Section */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-[#181310] mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">group_work</span>
                            Quem vai cuidar do seu pet?
                        </h3>
                        <div className="space-y-4">
                            {/* Partner 1 */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-background-light border border-transparent hover:border-primary/30 transition-colors group">
                                <div className="bg-white p-3 rounded-lg shadow-sm text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">bed</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-[#181310] text-base">Hotel PetLove</h4>
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-semibold">Parceiro Ouro</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Hospedagem completa com ar condicionado.</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">2 diárias</span>
                                        <Link to="/partner" className="text-xs text-primary hover:underline ml-auto">Ver perfil</Link>
                                    </div>
                                </div>
                            </div>
                            {/* Dotted Line */}
                            <div className="flex justify-center -my-2">
                                <div className="h-6 border-l-2 border-dashed border-gray-300"></div>
                            </div>
                            {/* Partner 2 */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-background-light border border-transparent hover:border-primary/30 transition-colors group">
                                <div className="bg-white p-3 rounded-lg shadow-sm text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">local_taxi</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-[#181310] text-base">Táxi Dog Express</h4>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-semibold">4.9 ★</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Transporte especializado com segurança.</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Ida e volta</span>
                                        <Link to="/partner" className="text-xs text-primary hover:underline ml-auto">Ver perfil</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex gap-3 items-start">
                            <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">info</span>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Ao comprar este pacote, o pagamento é dividido automaticamente entre o <strong>Hotel PetLove</strong> e o <strong>Táxi Dog Express</strong>. Transparência total para você e nossos parceiros.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

             {/* Reviews Section */}
             <div className="mt-12 lg:mt-20 border-t border-gray-200 pt-10">
                <h2 className="text-2xl font-bold mb-8">Avaliações de quem comprou</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Review 1 */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={IMAGES.AVATAR_WOMAN} alt="User" className="size-10 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-sm">Mariana Silva</p>
                                <div className="flex text-yellow-400 text-xs">
                                     {[1,2,3,4,5].map(i => <span key={i} className="material-symbols-outlined fill-current text-[14px]">star</span>)}
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 ml-auto">Há 2 dias</span>
                        </div>
                        <p className="text-sm text-gray-600">"Incrível! O táxi chegou pontualmente e recebi fotos do Rex no hotel o tempo todo. A divisão do pagamento facilitou muito."</p>
                    </div>
                    {/* Review 2 */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={IMAGES.AVATAR_MAN} alt="User" className="size-10 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-sm">Carlos Eduardo</p>
                                <div className="flex text-yellow-400 text-xs">
                                    {[1,2,3,4].map(i => <span key={i} className="material-symbols-outlined fill-current text-[14px]">star</span>)}
                                    <span className="material-symbols-outlined text-gray-300 text-[14px]">star</span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 ml-auto">Há 1 semana</span>
                        </div>
                        <p className="text-sm text-gray-600">"Muito prático contratar tudo junto. O Hotel PetLove é excelente, voltarei a usar com certeza."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageDetails;