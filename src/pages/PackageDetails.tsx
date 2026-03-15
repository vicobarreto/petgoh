import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../types';

interface PackageItem {
    id: string;
    service_type: string;
    quantity: number;
}

interface Package {
    id: string;
    name: string;
    description: string;
    price: number;
    type: string;
    validity_days: number;
    is_active: boolean;
    image_url?: string;
    items?: PackageItem[];
}

const SERVICE_LABELS: Record<string, string> = {
    hotel: 'Diárias',
    daycare: 'Creche',
    bath: 'Banho',
    grooming: 'Tosa',
    vet: 'Veterinário',
    vaccine: 'Vacina',
    walk: 'Passeio',
};

const PackageDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [pkg, setPkg] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [mainImage, setMainImage] = useState(IMAGES.DOG_RUNNING);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (!id) {
            navigate('/packages');
            return;
        }
        fetchPackage();
    }, [id]);

    const fetchPackage = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('packages')
                .select('*, items:package_items(*)')
                .eq('id', id)
                .single();

            if (error || !data) {
                navigate('/packages');
                return;
            }
            setPkg(data);
            if (data.image_url) {
                setMainImage(data.image_url);
            }
        } catch {
            navigate('/packages');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/package/${id}` } });
            return;
        }

        setAddingToCart(true);
        try {
            const { error } = await supabase
                .from('cart_items')
                .upsert(
                    { user_id: user.id, package_id: id, quantity: 1 },
                    { onConflict: 'user_id,package_id' }
                );

            if (error) throw error;

            window.dispatchEvent(new CustomEvent('cartUpdated'));

            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 3000);
        } catch (err: any) {
            alert('Erro ao adicionar ao carrinho: ' + err.message);
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-grow w-full flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    <p className="text-gray-500 text-sm">Carregando pacote...</p>
                </div>
            </div>
        );
    }

    if (!pkg) return null;

    const priceFormatted = pkg.price.toFixed(2).replace('.', ',');
    const installment = (pkg.price / 3).toFixed(2).replace('.', ',');
    const hasHotelItems = pkg.items?.some(i => i.service_type === 'hotel') || false;

    return (
        <div className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm mb-6 text-gray-500">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link to="/packages" className="hover:text-primary transition-colors">Pacotes</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="font-semibold text-[#181310]">{pkg.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Gallery */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 relative group cursor-pointer shadow-sm">
                        <img src={mainImage} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        {pkg.type === 'especial' && (
                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center">
                                <span className="text-primary mr-1 text-base">★</span> Destaque
                            </div>
                        )}
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

                    {/* Description */}
                    <div className="mt-8 hidden lg:block">
                        <h3 className="text-xl font-bold mb-4">Sobre este pacote</h3>
                        <div className="prose max-w-none text-gray-600 leading-relaxed">
                            <p>{pkg.description || 'Garanta o melhor cuidado para o seu pet com este pacote completo!'}</p>
                            {pkg.items && pkg.items.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    {pkg.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                            <div>
                                                <span className="text-sm font-semibold text-gray-800">{item.quantity}x</span>
                                                <span className="text-sm text-gray-600 ml-1">{SERVICE_LABELS[item.service_type] || 'Serviço'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Info & Actions */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-[#181310] leading-tight">{pkg.name}</h1>
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`transition-colors ${isFavorite ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}
                            >
                                <span className={`material-symbols-outlined ${isFavorite ? 'material-symbols-filled' : ''}`}>favorite</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pkg.type === 'especial' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                {pkg.type === 'especial' ? '⭐ Plano Especial' : 'Plano Básico'}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{pkg.validity_days} dias de validade</span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-black text-primary">R$ {priceFormatted}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Em até 3x de R$ {installment} sem juros</p>

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart}
                            className={`w-full font-bold text-lg py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mb-3 ${
                                addedToCart
                                    ? 'bg-green-500 text-white shadow-green-200'
                                    : 'bg-secondary hover:bg-blue-900 text-white shadow-secondary/30'
                            }`}
                        >
                            {addingToCart ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Adicionando...
                                </>
                            ) : addedToCart ? (
                                <>
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Adicionado ao Carrinho!
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                    Adicionar ao Carrinho
                                </>
                            )}
                        </button>

                        {addedToCart && (
                            <Link
                                to="/cart"
                                className="w-full mb-3 h-12 bg-gray-100 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                                Ver Carrinho
                            </Link>
                        )}

                        {/* Buy Now / Booking Flow */}
                        <Link
                            to={hasHotelItems ? `/package/${pkg.id}/booking` : `/checkout/${pkg.id}`}
                            className="w-full bg-primary hover:bg-[#e67a35] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span>{hasHotelItems ? 'Escolher Hotéis e Datas' : 'Comprar Agora'}</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                            Pagamento 100% seguro e dividido automaticamente.
                        </div>
                    </div>

                    {/* Services Included (mobile visible) */}
                    {pkg.items && pkg.items.length > 0 && (
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 lg:hidden">
                            <h3 className="text-lg font-bold text-[#181310] mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">inventory_2</span>
                                Serviços Inclusos
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {pkg.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                        <div>
                                            <span className="text-sm font-semibold text-gray-800">{item.quantity}x</span>
                                            <span className="text-sm text-gray-600 ml-1">{SERVICE_LABELS[item.service_type] || 'Serviço'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PackageDetails;