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
                style={{ filter: 'drop-shadow(0 -4px 24px rgba(0,0,0,0.45))' }}
            >
                {/* Outer shell — dark glossy background like CR interface */}
                <div
                    className="relative flex items-end justify-around px-1 pb-safe"
                    style={{
                        background: 'linear-gradient(180deg, #1a2744 0%, #0d1a35 100%)',
                        borderTop: '2px solid rgba(255,215,90,0.25)',
                        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
                        paddingTop: '6px',
                    }}
                >
                    {/* Golden top border shimmer */}
                    <div
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,200,50,0.5) 50%, transparent)' }}
                    />

                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.to);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="relative flex flex-col items-center justify-end flex-1 py-1 gap-0 focus:outline-none select-none"
                            >
                                {/* Active button: raised coin-style platform */}
                                <div
                                    className="flex flex-col items-center justify-center relative transition-transform duration-150"
                                    style={{
                                        transform: active ? 'translateY(-6px)' : 'translateY(0)',
                                    }}
                                >
                                    {/* glowing halo behind active icon */}
                                    {active && (
                                        <div
                                            className="absolute inset-0 rounded-2xl blur-sm"
                                            style={{
                                                background: 'radial-gradient(circle, rgba(255,170,30,0.55) 0%, transparent 70%)',
                                                transform: 'scale(1.5)',
                                            }}
                                        />
                                    )}

                                    {/* Icon platform */}
                                    <div
                                        className="relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200"
                                        style={active ? {
                                            background: 'linear-gradient(160deg, #ffcc44 0%, #ff8c00 100%)',
                                            boxShadow: '0 4px 0 #a45200, 0 6px 16px rgba(255,140,0,0.6)',
                                        } : {
                                            background: 'linear-gradient(160deg, #2a3a60 0%, #1a2744 100%)',
                                            boxShadow: '0 3px 0 #0a1020',
                                        }}
                                    >
                                        <span
                                            className="material-symbols-outlined text-[22px] transition-colors duration-200"
                                            style={{
                                                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                                                color: active ? '#fff' : 'rgba(150,170,210,0.85)',
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                    </div>

                                    {/* Label badge under icon */}
                                    <span
                                        className="mt-1 text-[9px] font-black uppercase tracking-wide leading-none"
                                        style={{ color: active ? '#ffd040' : 'rgba(130,155,200,0.7)' }}
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
