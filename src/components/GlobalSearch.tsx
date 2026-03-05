import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchIndex, SearchItem } from '../data/searchIndex';
import { useAuth } from '../context/AuthContext';

const GlobalSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // 1. Listeners for Open/Close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const handleOpenEvent = () => setIsOpen(true);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-search', handleOpenEvent); // Custom event listener

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-search', handleOpenEvent);
        };
    }, []);

    // 2. Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    // 3. Search Logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        
        // Filter search index based on user role
        const accessibleIndex = searchIndex.filter(item => 
            !item.role || (item.role === 'admin' && user?.role === 'admin')
        );

        const filtered = accessibleIndex.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) || 
            item.content.toLowerCase().includes(lowerQuery)
        ).slice(0, 5); // Limit to 5 results

        setResults(filtered);
        setSelectedIndex(0);
    }, [query, user]);

    // 4. Navigation Logic
    const handleSelect = (item: SearchItem) => {
        setIsOpen(false);
        navigate(item.url);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results.length > 0) {
            handleSelect(results[selectedIndex]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 animate-scale-in">
                {/* Header Input */}
                <div className="flex items-center border-b border-gray-100 px-4 py-4">
                    <span className="material-symbols-outlined text-primary text-2xl mr-3">search</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none text-lg text-gray-900 placeholder-gray-400 focus:ring-0 p-0"
                        placeholder="Buscar serviços, parceiros, admin..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                    />
                    <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                        <span className="text-[10px]">ESC</span>
                        <span>fechar</span>
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {results.length > 0 ? (
                        <div className="p-2">
                            <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">Sugestões</div>
                            {results.map((item, index) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors text-left group ${index === selectedIndex ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${index === selectedIndex ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-semibold text-sm ${index === selectedIndex ? 'text-gray-900' : ''}`}>{item.title}</h4>
                                        <p className={`text-xs truncate ${index === selectedIndex ? 'text-primary/80' : 'text-gray-400'}`}>{item.content}</p>
                                    </div>
                                    {index === selectedIndex && (
                                        <span className="material-symbols-outlined text-sm text-primary">keyboard_return</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        query && (
                            <div className="p-8 text-center text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">search_off</span>
                                <p>Nenhum resultado para "{query}"</p>
                            </div>
                        )
                    )}
                    
                    {!query && (
                        <div className="p-4">
                            <p className="text-xs font-semibold text-gray-400 px-2 uppercase tracking-wider mb-2">Acesso Rápido</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => navigate('/agendar')} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors">
                                    <span className="material-symbols-outlined text-secondary text-lg">calendar_month</span>
                                    Agendar Consulta
                                </button>
                                <button onClick={() => navigate('/carteira')} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors">
                                    <span className="material-symbols-outlined text-orange-500 text-lg">wallet</span>
                                    Carteira Digital
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;