import React from 'react';
// FIX: import `useNavigate` from `react-router-dom`.
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoPetgoh from '../../imagens/logo-petgoh.png';

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: 'dashboard', label: 'Visão Geral' },
        { path: '/admin/tutors', icon: 'group', label: 'Gestão de Usuários' },
        { path: '/admin/partners', icon: 'storefront', label: 'Gestão de Parceiros' },
        { path: '/admin/packages', icon: 'inventory_2', label: 'Gestão de Pacotes' },
        { path: '/admin/promotions', icon: 'local_offer', label: 'Promoções' },
        { path: '/admin/giveaways', icon: 'celebration', label: 'Sorteios' },
        { path: '/admin/financial', icon: 'bar_chart', label: 'Relatórios' },
        { path: '/admin/mural-moderation', icon: 'forum', label: 'Moderação do Mural' },
    ];

    const cadastroItems = [
        { path: '/admin/vets', icon: 'stethoscope', label: 'Veterinários' },
        { path: '/admin/hotels', icon: 'hotel', label: 'Hotéis & Creches' },
        { path: '/admin/petshops', icon: 'storefront', label: 'Pet Shops' },
        { path: '/admin/grooming', icon: 'bathtub', label: 'Banho e Tosa' },
        { path: '/admin/trainers', icon: 'pets', label: 'Adestradores' },
        { path: '/admin/walkers', icon: 'directions_walk', label: 'Passeadores' },
        { path: '/admin/others', icon: 'more_horiz', label: 'Outros Parceiros' },
        { path: '/admin/health-services', icon: 'medical_information', label: 'Saúde' },
        { path: '/admin/beauty-services', icon: 'spa', label: 'Estética' },
    ];
    
    return (
        <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col fixed h-full z-20">
            <div className="p-6 flex items-center gap-3 justify-center border-b border-slate-100 dark:border-zinc-800">
                <img src={logoPetgoh} alt="PetGoH Logo" className="h-12 w-auto" />
            </div>
            <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
                {navItems.map(item => (
                     <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 h-11 rounded-lg transition-all ${location.pathname.startsWith(item.path) ? 'bg-primary/10 text-primary border-l-4 border-primary font-semibold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-white'}`}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
                <div className="pt-4 pb-2 px-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cadastros</p>
                </div>
                {cadastroItems.map(item => (
                    <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 h-11 rounded-lg transition-all ${location.pathname.startsWith(item.path) ? 'bg-primary/10 text-primary border-l-4 border-primary font-semibold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-white'}`}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
                 <div className="pt-4 pb-2 px-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema</p>
                </div>
                <Link to="/admin/settings" className={`flex items-center gap-3 px-4 h-11 rounded-lg transition-all ${location.pathname === '/admin/settings' ? 'bg-primary/10 text-primary border-l-4 border-primary font-semibold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-white'}`}>
                    <span className="material-symbols-outlined">settings</span>
                    <span>Configurações</span>
                </Link>
            </nav>
            <div className="p-4 mt-auto">
                <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-white dark:border-zinc-700" style={{ backgroundImage: `url('${user?.avatar}')` }}></div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-slate-800 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role === 'admin' ? 'Super Admin' : 'Usuário'}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full h-10 bg-secondary text-white text-sm font-bold rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Sair
                    </button>
                </div>
            </div>
        </aside>
    );
};

const AdminHeader: React.FC = () => {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input className="w-full h-11 pl-10 pr-4 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400" placeholder="Buscar transações, tutores ou parceiros..." type="text" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:text-primary transition-colors flex items-center justify-center relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border border-white"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800">Backoffice V2.4</p>
                    <p className="text-xs text-slate-400">Build Estável</p>
                </div>
            </div>
        </header>
    );
};


const AdminLayout: React.FC = () => {
    return (
         <div className="flex min-h-screen bg-background-light font-display text-slate-800">
            <AdminSidebar />
            <main className="flex-1 lg:ml-72 min-h-screen">
                <AdminHeader />
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;