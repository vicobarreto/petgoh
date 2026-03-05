import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Inbox: React.FC = () => {
    const navigate = useNavigate();

    return (
        <body className="bg-background-light dark:bg-background-dark font-display h-screen flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
            {/* Header */}
            <header className="bg-navy-header text-white shadow-lg z-20 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary">pets</span>
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight">PetGoH <span className="opacity-50 mx-2">|</span> Mensagens</h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-navy-header"></span>
                        </button>
                    </div>
                </div>
            </header>
            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
                {/* Sidebar / List View */}
                <div className="w-full md:w-[400px] lg:w-[450px] bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full z-10 shadow-sm">
                    {/* Search & Filter */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                        {/* ... search and filter buttons */}
                    </div>
                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        <div onClick={() => navigate('/mensagens/123')} className="group relative p-4 hover:bg-primary/5 cursor-pointer transition-colors border-l-4 border-primary bg-primary/5 dark:bg-primary/10">
                            {/* ... conversation item content ... */}
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">Caso #420 - Thor</h3>
                        </div>
                    </div>
                </div>
                {/* Detail View (Placeholder) */}
                <div className="hidden md:flex flex-col flex-1 bg-white/50 dark:bg-slate-900/50 relative items-center justify-center text-center p-8">
                    <span className="material-symbols-outlined text-6xl text-slate-300">chat</span>
                    <h2 className="mt-4 text-xl font-bold text-slate-600">Selecione uma conversa</h2>
                    <p className="text-sm text-slate-400">Escolha um caso na barra lateral para ver os detalhes.</p>
                </div>
            </div>
        </body>
    );
};

export default Inbox;
