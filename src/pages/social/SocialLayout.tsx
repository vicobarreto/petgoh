import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoPetgoh from '../../imagens/logo-petgoh.png';

const SocialLayout: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const tabs = [
        { path: '/caomunicacao', icon: 'home', label: 'Feed', exact: true },
        { path: '/caomunicacao/buscar', icon: 'search', label: 'Buscar' },
        { path: '/caomunicacao/publicar', icon: 'add_circle', label: 'Publicar' },
        { path: '/caomunicacao/mensagens', icon: 'chat_bubble_outline', label: 'Mensagens' },
        { path: '/caomunicacao/meu-perfil', icon: 'person', label: 'Perfil' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* ═══ MAIN CONTENT — fills the left/center ═══ */}
            <div className="flex-1 flex flex-col min-h-screen md:mr-[220px]">
                {/* Top Header */}
                <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-11 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-1.5">
                        <img src={logoPetgoh} alt="PetGoH" className="h-8 w-auto" />
                    </button>
                    <div className="flex gap-2 items-center">
                        <button onClick={() => navigate('/caomunicacao/mensagens')} className="relative p-1 md:hidden">
                            <span className="material-symbols-outlined text-[22px] text-gray-800">chat_bubble_outline</span>
                        </button>
                    </div>
                </header>

                {/* Page content — centered with max-width for readability on desktop */}
                <main className="flex-1 bg-white md:bg-gray-50 pb-[52px] md:pb-0">
                    <div className="max-w-[600px] mx-auto md:my-0 bg-white md:border-x md:border-gray-200 min-h-[calc(100vh-44px)]">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* ═══ RIGHT SIDEBAR — desktop only (md+) ═══ */}
            <aside className="hidden md:flex fixed right-0 top-0 bottom-0 w-[220px] bg-white border-l border-gray-200 flex-col z-40">
                {/* Logo area */}
                <div className="px-5 h-14 flex items-center border-b border-gray-100">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2">
                        <img src={logoPetgoh} alt="PetGoH" className="h-9 w-auto" />
                    </button>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 py-3 px-3">
                    {tabs.map(tab => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            end={tab.exact}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all ${
                                    isActive
                                        ? 'bg-gray-100 text-gray-900 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className="material-symbols-outlined text-[24px]"
                                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                    >
                                        {tab.icon}
                                    </span>
                                    <span className="text-[14px]">{tab.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom user area */}
                {user && (
                    <div className="border-t border-gray-100 px-4 py-3">
                        <button
                            onClick={() => navigate('/caomunicacao/meu-perfil')}
                            className="flex items-center gap-2.5 w-full text-left"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent((user as any).user_metadata?.full_name || 'U')}&background=f97316&color=fff&size=32`}
                                className="size-8 rounded-full"
                                alt=""
                            />
                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-gray-900 truncate">{(user as any).user_metadata?.full_name || 'Usuário'}</p>
                                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                            </div>
                        </button>
                    </div>
                )}
            </aside>

            {/* ═══ BOTTOM NAV — mobile only ═══ */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
                <div className="flex justify-around items-center h-[50px]">
                    {tabs.map(tab => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            end={tab.exact}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                    isActive ? 'text-gray-900' : 'text-gray-400'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={`material-symbols-outlined ${tab.icon === 'add_circle' ? 'text-[30px]' : 'text-[24px]'}`}
                                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                    >
                                        {tab.icon}
                                    </span>
                                    {tab.label && tab.icon !== 'add_circle' && (
                                        <span className="text-[9px] mt-px leading-none">{tab.label}</span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default SocialLayout;
