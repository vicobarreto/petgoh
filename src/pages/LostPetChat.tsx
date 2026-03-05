import React from 'react';
import { Link } from 'react-router-dom';

const LostPetChat: React.FC = () => {
    return (
        <body className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-100 h-screen flex flex-col overflow-hidden">
            {/* Fixed Pet Context Banner */}
            <div className="bg-primary/10 dark:bg-primary/20 border-b border-primary/20 p-3 sm:p-4 flex items-center justify-between shadow-sm z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <img alt="Golden Retriever dog smiling in park" className="w-12 h-12 rounded-lg object-cover border-2 border-white dark:border-gray-700 shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF1MckWolXkkCZOtb3s6yeWWLuACq0oSFATUdhgF-EuXABn_Rf8kq-ZsavyMjeiuyLmuitkdBNv-OUkLjlnMM7iyvbAC06EZGTlXaNsdWfv4e0jca-bImuxEgY2EREVhdwlQhSExogPQk3DmHRHnRSCXww_SOeok9K7dwzjbShP5fsoF8iBHkl-tEmqWTCfYOejoHg1nkjUDTUYIb36IOv_PtYONU27CB6lRTiH-zj8HZKBsX8zO67Q_iaLvdaXTi5DmygwPRuaPAI" />
                        <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-gray-800">PERDIDO</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Procurando por: Thor
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 hidden sm:inline-block">• Golden Retriever</span>
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px] text-red-500">place</span>
                            Visto por último em Moema, SP
                        </p>
                    </div>
                </div>
                <Link to="/mural" className="hidden sm:flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                    Ver detalhes
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
            </div>
            {/* Main Content Area */}
            <div className="flex-1 flex max-w-6xl mx-auto w-full h-full relative overflow-hidden bg-surface-light dark:bg-surface-dark shadow-xl sm:my-4 sm:rounded-xl border border-gray-200 dark:border-gray-800">
                {/* Active Chat Section */}
                <main className="flex-1 flex flex-col h-full relative bg-[#fafafa] dark:bg-[#0f151e]">
                    {/* Chat Header */}
                    <header className="h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark flex items-center justify-between shrink-0 z-10">
                        {/* ... chat header content ... */}
                    </header>
                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                         {/* ... messages ... */}
                    </div>
                    {/* Input Area */}
                    <footer className="p-4 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 shrink-0">
                        <textarea className="flex-1 bg-transparent border-0 focus:ring-0 p-2 text-sm text-gray-800 dark:text-gray-100 resize-none max-h-32" placeholder="Digite uma mensagem..." rows={1} style={{ minHeight: '40px' }}></textarea>
                    </footer>
                </main>
            </div>
        </body>
    );
};

export default LostPetChat;
