import React, { useState, useEffect } from 'react';
import { IMAGES } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const UserProfile: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'wishlist' | 'history' | 'compare' | 'pets' | 'personal' | 'favorites' | 'fidelidade'>('wishlist');
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, user, pets, loading } = useAuth(); // Using Auth Context

    // Check URL query params for initial tab
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['wishlist', 'history', 'compare', 'pets', 'personal', 'favorites', 'fidelidade'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [location]);

    const handleTabChange = (tab: string) => {
        if (tab === 'fidelidade') {
            navigate('/fidelidade');
            return;
        }
        setActiveTab(tab as any);
        // Optional: Update URL without reloading
        navigate(`/profile?tab=${tab}`, { replace: true });
    };

    const handleLogout = () => {
        signOut();
        navigate('/login');
    };

    // Render Components based on activeTab
    const renderContent = () => {
    // Loading State
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            );
        }

        // Unauthenticated State for Protected Tabs
        if (!user && ['wishlist', 'history', 'compare', 'pets', 'personal', 'favorites', 'fidelidade'].includes(activeTab)) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm h-full">
                    <div className="bg-orange-50 p-6 rounded-full mb-6 animate-bounce-slow">
                        <span className="material-symbols-outlined text-5xl text-primary">lock</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Acesso Restrito</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                        Para acessar seus <strong>{activeTab === 'pets' ? 'Pets' : activeTab === 'personal' ? 'Dados Pessoais' : 'Favoritos'}</strong>, você precisa estar logado.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">login</span>
                            Fazer Login
                        </button>
                        <button 
                            onClick={() => navigate('/register')}
                            className="bg-white border-2 border-gray-100 hover:border-primary/30 text-gray-700 hover:text-primary px-8 py-3 rounded-xl font-bold transition-all"
                        >
                            Criar Conta
                        </button>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'wishlist':
                return <WishlistView onOpenAlert={() => setIsAlertModalOpen(true)} onCompare={() => handleTabChange('compare')} />;
            case 'history':
                return <HistoryView />;
            case 'compare':
                return <CompareView onBack={() => handleTabChange('wishlist')} />;
            case 'favorites':
                return <FavoritesView />;
            case 'pets':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Meus Pets</h2>
                            <button 
                                onClick={() => navigate('/register-pet')}
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-orange-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Adicionar Pet
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pets.map((pet) => (
                                <div key={pet.id} className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transform transition-transform hover:scale-[1.01] duration-300">
                                    {/* Card Header Color */}
                                    <div className={`h-2 bg-gradient-to-r from-primary to-${pet.color || 'orange'}-400`}></div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                                <span className="material-symbols-outlined text-[16px] fill-1">check_circle</span>
                                                Vacinas em dia
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400 text-[24px]">qr_code_2</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                            <div className="relative">
                                                <div className="size-20 rounded-full bg-gray-200 ring-4 ring-white shadow-md overflow-hidden">
                                                    <img alt={pet.name} className="w-full h-full object-cover" src={pet.image || IMAGES.THOR_DOG} />
                                                </div>
                                                <div className="absolute bottom-0 right-0 bg-secondary text-white p-1 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[14px]">pets</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-xl font-bold text-gray-900 mb-1">{pet.name}</h2>
                                                <p className="text-sm text-gray-500 font-medium mb-3">{pet.breed} • {pet.age} • {pet.gender}</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                        <p className="text-gray-400 mb-0.5">Peso</p>
                                                        <p className="font-bold text-gray-800">{pet.weight} kg</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                        <p className="text-gray-400 mb-0.5">Pedigree</p>
                                                        <p className="font-bold text-gray-800">{pet.chipId || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                                        <button onClick={() => navigate(`/carteira?petId=${pet.id}`)} className="text-secondary text-sm font-bold hover:underline flex items-center gap-1">
                                            Ver Carteira Completa <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'personal':
                return <PersonalDataView />;

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <span className="material-symbols-outlined text-4xl mb-2">construction</span>
                        <p>Em desenvolvimento...</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28">
                    <div className="space-y-1">
                        <button onClick={() => handleTabChange('personal')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'personal' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <span className="material-symbols-outlined text-[20px]">person</span>
                            Dados Pessoais
                        </button>
                         <button onClick={() => handleTabChange('pets')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'pets' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <span className="material-symbols-outlined text-[20px]">pets</span>
                            Meus Pets
                        </button>
                        <button onClick={() => handleTabChange('history')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <span className="material-symbols-outlined text-[20px]">history</span>
                            Histórico de Pedidos
                        </button>
                        <button onClick={() => handleTabChange('fidelidade')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'fidelidade' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <span className="material-symbols-outlined text-[20px]">loyalty</span>
                            Fidelidade
                        </button>
                        <button onClick={() => handleTabChange('favorites')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'favorites' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                            Meus Favoritos
                        </button>
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {renderContent()}
            </div>

            {/* Alert Modal */}
            {isAlertModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAlertModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined">notifications_active</span>
                                <h3 className="text-lg font-bold">Criar Alerta de Preço</h3>
                            </div>
                            <button onClick={() => setIsAlertModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 mb-6">
                                <img src={IMAGES.TWO_DOGS} alt="Pkg" className="size-16 rounded-lg object-cover" />
                                <div>
                                    <h4 className="font-bold text-gray-900">Pacote Férias Dezembro</h4>
                                    <p className="text-sm text-gray-500">Preço atual: <span className="text-primary font-bold">R$ 480,00</span></p>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Avise-me quando o preço for menor que:</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                    <input type="number" defaultValue="450.00" className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 text-lg font-bold text-gray-900 focus:border-primary focus:ring-primary" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">BRL</span>
                                </div>
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">trending_down</span> Você economizará R$ 30,00 (6%)</p>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-sm">mail</span></div>
                                        <span className="text-sm font-medium text-gray-700">Notificar por E-mail</span>
                                    </div>
                                    <input type="checkbox" defaultChecked className="text-primary focus:ring-primary rounded" />
                                </label>
                                <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><span className="material-symbols-outlined text-sm">chat</span></div>
                                        <span className="text-sm font-medium text-gray-700">Notificar por WhatsApp</span>
                                    </div>
                                    <input type="checkbox" className="text-primary focus:ring-primary rounded" />
                                </label>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button onClick={() => setIsAlertModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">Cancelar</button>
                                <button onClick={() => setIsAlertModalOpen(false)} className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-blue-900 font-medium text-sm">Criar Alerta</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... (WishlistView, HistoryView, CompareView, FavoritesView components remain the same)
// UI-09: Profile photo + personal data editor
const PersonalDataView: React.FC = () => {
    const { user } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
    const [uploading, setUploading] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `avatars/${user.id}.${ext}`;
            const { error } = await supabase.storage.from('pet-photos').upload(path, file, { upsert: true });
            if (error) throw error;
            const { data } = supabase.storage.from('pet-photos').getPublicUrl(path);
            setAvatarUrl(data.publicUrl);
            await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', user.id);
        } catch (err: any) {
            alert('Erro ao fazer upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">Dados Pessoais</h2>
            <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                    <img
                        src={avatarUrl || IMAGES.AVATAR_WOMAN}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-white text-xl">{uploading ? 'hourglass_empty' : 'photo_camera'}</span>
                    </button>
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-900">{user?.name || 'Visitante'}</h3>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="text-primary text-xs font-semibold hover:underline mt-1"
                    >
                        Alterar foto de perfil
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input type="text" className="w-full p-2.5 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={user?.name} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="text" className="w-full p-2.5 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={user?.email} readOnly />
                </div>
            </div>
            <div className="mt-6">
                <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors">
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
};

// NOTE: I am keeping the other sub-components inside this file for brevity as they are only used here.
// In a real-world scenario, they would be broken out into their own files.

const WishlistView: React.FC<{ onOpenAlert: () => void, onCompare: () => void }> = ({ onOpenAlert, onCompare }) => {
    const navigate = useNavigate();
    return (
        <>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 text-primary">
                        <span className="material-symbols-outlined text-2xl">bookmark</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Minha Lista</h1>
                        <p className="text-sm text-gray-500">Gerencie seus pacotes e serviços favoritos</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCompare} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">compare_arrows</span> Comparar
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 <div className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 flex flex-col sm:flex-row gap-5">
                    <div className="relative w-full sm:w-40 sm:h-40 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img src={IMAGES.TWO_DOGS} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Pack" />
                        <div className="absolute bottom-2 left-2 flex gap-1">
                            <div className="bg-white/90 p-1.5 rounded-md text-primary shadow-sm"><span className="material-symbols-outlined text-[16px]">hotel</span></div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">PROMO</span>
                                <div className="flex gap-2">
                                    <button onClick={onOpenAlert} className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined text-[20px]">notifications_active</span></button>
                                    <button className="text-gray-300 hover:text-red-500"><span className="material-symbols-outlined text-[20px]">delete_outline</span></button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">Pacote Férias Dezembro</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">Inclui 3 diárias de hospedagem premium.</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 line-through">R$ 520,00</span>
                                <span className="text-xl font-bold text-primary">R$ 480,00</span>
                            </div>
                            <button onClick={() => navigate('/cart')} className="bg-secondary hover:bg-blue-900 text-white py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2">
                                <span className="text-sm font-semibold hidden sm:inline">Adicionar</span>
                                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const HistoryView: React.FC = () => {
    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Histórico de Pedidos</h1>
                    <p className="text-gray-500 text-sm mt-1">Acompanhe seus serviços e compras anteriores.</p>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col sm:flex-row relative group border border-gray-100">
                    <div className="p-5 flex-1 flex flex-col sm:flex-row gap-5">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
                                <img src={IMAGES.DOG_BED} className="w-full h-full object-cover" alt="Order" />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Banho & Tosa</h3>
                                <p className="text-sm text-gray-500 mt-1">12 de Outubro, 2023</p>
                            </div>
                            <button className="w-full sm:w-auto mt-4 px-6 py-2.5 bg-primary hover:bg-orange-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
                                Agendar Novamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const CompareView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="flex-1">
            <div className="bg-secondary rounded-xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <button onClick={onBack} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-white">arrow_back</span>
                        </button>
                        <h1 className="text-2xl font-bold">Comparar Itens</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FavoritesView: React.FC = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'mural' | 'partners'>('mural');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) fetchFavorites();
    }, [user, activeTab]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            // Busca os favoritos baseados na aba ativa
            let query = supabase.from('post_favorites').select('id, source_id, source_type, post_id, source_metadata').eq('user_id', user?.id).order('created_at', { ascending: false });
            
            if (activeTab === 'mural') {
                query = query.in('source_type', ['wall_post', 'adoption_pet', 'lost_pet']);
            } else {
                query = query.eq('source_type', 'partner');
            }

            const { data: favData, error } = await query;

            if (error) throw error;
            if (!favData || favData.length === 0) {
                setFavorites([]);
                return;
            }

            if (activeTab === 'partners') {
                // Para parceiros, usamos os dados salvos no source_metadata
                const enriched = favData.map(fav => ({
                    ...fav,
                    entity: fav.source_metadata,
                    sourceType: 'partner'
                }));
                setFavorites(enriched);
            } else {
                // Para mural, enriquece cada favorito com dados da entidade correspondente
                const enriched = await Promise.all(
                    favData.map(async (fav: any) => {
                        const sid = fav.source_id || fav.post_id;
                        const stype = fav.source_type || 'wall_post';

                        if (stype === 'adoption_pet') {
                            const { data } = await supabase.from('adoption_pets').select('id, name, main_image').eq('id', sid).maybeSingle();
                            return { ...fav, entity: data, sourceType: stype };
                        } else if (stype === 'lost_pet') {
                            const { data } = await supabase.from('lost_pets').select('id, pet_name, image_url').eq('id', sid).maybeSingle();
                            return { ...fav, entity: data, sourceType: stype };
                        } else {
                            // wall_post
                            const { data } = await supabase.from('wall_posts').select('id, images, likes:post_likes(count), comments:post_comments(count)').eq('id', sid).maybeSingle();
                            return { ...fav, entity: data, sourceType: stype };
                        }
                    })
                );
                setFavorites(enriched.filter(f => f.entity));
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (favId: string) => {
        await supabase.from('post_favorites').delete().eq('id', favId);
        setFavorites(prev => prev.filter(f => f.id !== favId));
    };

    const getImage = (fav: any): string => {
        const e = fav.entity;
        if (!e) return IMAGES.DOG_RUNNING;
        if (fav.sourceType === 'partner') return e.image || IMAGES.DOG_RUNNING;
        if (fav.sourceType === 'adoption_pet') return e.main_image || IMAGES.DOG_RUNNING;
        if (fav.sourceType === 'lost_pet') return e.image_url || IMAGES.DOG_RUNNING;
        // wall_post
        const imgs = typeof e.images === 'string' ? JSON.parse(e.images) : e.images;
        return imgs?.[0] || IMAGES.DOG_RUNNING;
    };

    const getLabel = (fav: any): string => {
        if (fav.sourceType === 'partner') return fav.entity?.name || 'Parceiro';
        if (fav.sourceType === 'adoption_pet') return fav.entity?.name || 'Pet para Adoção';
        if (fav.sourceType === 'lost_pet') return fav.entity?.pet_name || 'Pet Perdido';
        return 'Post do Mural';
    };

    const getBadge = (type: string, entity?: any) => {
        if (type === 'partner') return { label: entity?.type || 'Serviço', color: 'bg-green-600' };
        if (type === 'adoption_pet') return { label: 'Adoção', color: 'bg-secondary' };
        if (type === 'lost_pet') return { label: 'Perdido', color: 'bg-primary' };
        return { label: 'Mural', color: 'bg-gray-600' };
    };

    return (
        <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meus Favoritos</h1>
                    <p className="text-gray-500 text-sm mt-1">Posts e serviços que você salvou para ver depois.</p>
                </div>
                <button onClick={() => navigate(activeTab === 'mural' ? '/mural' : '/')} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">explore</span>
                    Explorar {activeTab === 'mural' ? 'Mural' : 'Serviços'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('mural')}
                    className={`py-2 pt-0 px-4 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'mural' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Mural da Comunidade
                </button>
                <button
                    onClick={() => setActiveTab('partners')}
                    className={`py-2 pt-0 px-4 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'partners' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Hospedagens & Creches
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Carregando...</div>
            ) : favorites.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">bookmark_border</span>
                    <p className="text-gray-600 font-semibold">Nenhum item salvo em {activeTab === 'mural' ? 'Mural' : 'Hospedagens'}</p>
                    <p className="text-gray-400 text-sm mt-1">Navegue e clique no ícone <span className="font-bold">🔖</span> ou <span className="font-bold">❤️</span> para salvar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {favorites.map((fav) => {
                        const badge = getBadge(fav.sourceType, fav.entity);
                        return (
                            <div key={fav.id} className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 aspect-square shadow-sm">
                                <img src={getImage(fav)} alt={getLabel(fav)} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                    <p className="text-white text-xs font-bold truncate">{getLabel(fav)}</p>
                                    <button
                                        onClick={() => handleRemove(fav.id)}
                                        className="mt-2 w-full text-xs bg-white/20 hover:bg-red-500 text-white border border-white/30 rounded-lg py-1.5 font-semibold transition-all flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">bookmark_remove</span>
                                        Remover
                                    </button>
                                </div>
                                {/* Badge */}
                                <div className={`absolute top-2 left-2 ${badge.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md`}>
                                    {badge.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
// FIX: Added default export for UserProfile component.
export default UserProfile;
