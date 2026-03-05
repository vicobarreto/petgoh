import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { IMAGES } from '../types';
import logoPetgoh from '../imagens/logo-petgoh.png';

interface HeaderProps {
    simple?: boolean;
}

const Header: React.FC<HeaderProps> = ({ simple }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        if (!user) {
            setCartCount(0);
            return;
        }
        
        try {
            const { count, error } = await supabase
                .from('cart_items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
                
            if (!error && count !== null) {
                setCartCount(count);
            }
        } catch (err) {
            console.error('Error fetching cart count:', err);
        }
    };

    useEffect(() => {
        fetchCartCount();
        
        const handleCartUpdate = () => fetchCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [user]);

    const triggerSearch = () => {
        window.dispatchEvent(new CustomEvent('open-search'));
    };

    // Header simples para Checkout (opcional, mantendo por segurança de UI)
    if (simple) {
        return (
            <header className="fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-[1280px] mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logoPetgoh} alt="PetGoH Logo" className="h-10 w-auto" />
                    </Link>
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        <span>Checkout Seguro</span>
                    </div>
                </div>
            </header>
        );
    }

    // Header Padrão Universal
    return (
        <header className="fixed top-0 left-0 z-50 w-full bg-white border-b border-[#f5f2f0]">
            <div className="max-w-[1280px] mx-auto px-6 py-3 flex items-center justify-between">
                
                {/* Logo & Search Container */}
                <div className="flex items-center gap-4 md:gap-8 flex-1">
                    <Link to="/" className="flex items-center gap-2 text-[#181310] group shrink-0">
                         <img src={logoPetgoh} alt="PetGoH Logo" className="h-12 w-auto" />
                    </Link>

                    {/* Desktop Search Bar (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center w-full max-w-md group" onClick={triggerSearch}>
                        <div className="relative w-full cursor-text">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <span className="material-symbols-outlined">search</span>
                            </span>
                            <div className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f5f2f0] flex items-center text-sm text-gray-500 border border-transparent group-hover:border-primary/20 group-hover:bg-white transition-all">
                                Buscar serviços, parceiros...
                            </div>
                             <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400 pointer-events-none border border-gray-200 rounded px-1.5 h-6 my-auto bg-white">
                                Ctrl+K
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 md:gap-6">
                    <nav className="hidden lg:flex items-center gap-6">
                        <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Serviços</Link>
                        <Link to="/partner" className="text-sm font-medium hover:text-primary transition-colors">Parceiros</Link>
                    </nav>
                    
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Mobile Search Button (Visible only on Mobile) */}
                        <button 
                            onClick={triggerSearch}
                            className="md:hidden relative p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        >
                            <span className="material-symbols-outlined text-2xl">search</span>
                        </button>

                        {/* Notification Button */}
                        <Link to="/notifications" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-2xl text-gray-600">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
                        </Link>
                        
                        <Link to="/profile?tab=favorites" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-2xl text-gray-600">favorite</span>
                        </Link>
                        
                        <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-2xl text-gray-600">shopping_cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        
                        <Link to="/profile" className="flex items-center gap-3 pl-2 cursor-pointer">
                            <div className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url('${IMAGES.THOR_DOG || IMAGES.AVATAR_WOMAN}')` }}></div>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;