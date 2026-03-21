import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// UI-10: Mobile footer — Clash-Royale-style premium icon-only bottom nav
const NAV_ITEMS = [
    { to: '/',            icon: 'home',             label: 'Home' },
    { to: '/hospedagem',  icon: 'hotel',            label: 'Hotel' },
    { to: '/saude',       icon: 'medical_services', label: 'Saúde' },
    { to: '/estetica',    icon: 'spa',              label: 'Estética' },
    { to: '/caomunicacao',icon: 'forum',            label: 'Social' },
    { to: '/profile',     icon: 'person',           label: 'Perfil' },
];

const MobileFooter: React.FC = () => {
    const location = useLocation();

    const isActive = (to: string) =>
        to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

    return (
        <>
            {/* Spacer so page content isn't hidden behind the fixed bar */}
            <div className="h-20 md:hidden" />

            <nav
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
                style={{ filter: 'drop-shadow(0 -4px 20px rgba(0,0,0,0.08))' }}
            >
                {/* Outer shell */}
                <div
                    className="relative flex items-end justify-around px-1 pb-safe bg-white border-t border-gray-200"
                    style={{
                        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
                        paddingTop: '6px',
                    }}
                >

                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.to);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="relative flex flex-col items-center justify-end flex-1 py-1 gap-0 focus:outline-none select-none"
                            >
                                {/* Active button: raised platform */}
                                <div
                                    className="flex flex-col items-center justify-center relative transition-transform duration-150 group"
                                    style={{
                                        transform: active ? 'translateY(-6px)' : 'translateY(0)',
                                    }}
                                >
                                    {/* Icon platform */}
                                    <div
                                        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                                            active 
                                            ? 'bg-primary shadow-lg shadow-primary/40' 
                                            : 'bg-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <span
                                            className={`material-symbols-outlined text-[22px] transition-colors duration-200 ${
                                                active ? 'text-white' : 'text-gray-400 group-hover:text-secondary'
                                            }`}
                                            style={{
                                                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0"
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                    </div>

                                    {/* Label badge under icon */}
                                    <span
                                        className={`mt-1 text-[10px] font-bold tracking-wide leading-none transition-colors ${
                                            active ? 'text-primary' : 'text-gray-400 group-hover:text-secondary'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default MobileFooter;
