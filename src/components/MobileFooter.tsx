import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// UI-10: Mobile footer — Clash Royale style icon-only bottom navigation
const NAV_ITEMS = [
    { to: '/', icon: 'home', label: 'Home' },
    { to: '/hospedagem', icon: 'hotel', label: 'Hospedagem' },
    { to: '/saude', icon: 'medical_services', label: 'Saúde' },
    { to: '/estetica', icon: 'spa', label: 'Estética' },
    { to: '/caomunicacao', icon: 'forum', label: 'Social' },
    { to: '/profile', icon: 'person', label: 'Perfil' },
];

const MobileFooter: React.FC = () => {
    const location = useLocation();

    const isActive = (to: string) => {
        if (to === '/') return location.pathname === '/';
        return location.pathname.startsWith(to);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0F172A] border-t border-white/10 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-1">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.to);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5 relative"
                        >
                            {active && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b-full bg-primary" />
                            )}
                            <span className={`material-symbols-outlined text-[24px] transition-colors ${
                                active ? 'text-primary' : 'text-gray-400'
                            }`} style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                                {item.icon}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileFooter;
