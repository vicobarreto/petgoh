import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationSettings: React.FC = () => {
    const navigate = useNavigate();
    
    // State for toggles
    const [settings, setSettings] = useState({
        master: true,
        health: true,
        appointments: true,
        promos: false,
        tips: true
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        // Logic to save preferences would go here
        navigate('/');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-start py-10 px-4">
            <div className="w-full max-w-2xl animate-fade-in-up">
                {/* Header Section */}
                <div className="mb-8 text-center sm:text-left">
                    <button 
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors md:hidden"
                    >
                        <span className="material-symbols-outlined">arrow_back</span> Voltar
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Configurações de Notificação</h2>
                    <p className="text-gray-500">Gerencie como e quando você deseja receber atualizações sobre seus pets.</p>
                </div>

                {/* Notification Settings Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Global Master Switch */}
                    <div className="p-6 border-b border-gray-100 bg-primary/5 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-primary text-lg">Notificações Push</h3>
                            <p className="text-sm text-gray-600">Habilitar notificações no dispositivo</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={settings.master}
                                onChange={() => toggle('master')}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Settings List */}
                    <div className={`divide-y divide-gray-100 transition-opacity duration-300 ${!settings.master ? 'opacity-50 pointer-events-none' : ''}`}>
                        
                        {/* Health Reminders */}
                        <div className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">medical_services</span>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">Lembretes de Saúde</h3>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={settings.health}
                                                onChange={() => toggle('health')}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500 pr-12">Alertas importantes para vacinas, vermífugos e exames pendentes para manter a saúde do seu pet em dia.</p>
                                </div>
                            </div>
                        </div>

                        {/* Appointments & Status */}
                        <div className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">calendar_today</span>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">Agendamentos e Status</h3>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={settings.appointments}
                                                onChange={() => toggle('appointments')}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500 pr-12">Atualizações em tempo real sobre banho, tosa e confirmações de consultas veterinárias.</p>
                                </div>
                            </div>
                        </div>

                        {/* Promotions & Offers */}
                        <div className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">local_offer</span>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">Promoções e Ofertas</h3>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={settings.promos}
                                                onChange={() => toggle('promos')}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500 pr-12">Descontos exclusivos em produtos, rações e serviços de parceiros selecionados.</p>
                                </div>
                            </div>
                        </div>

                        {/* Tips & News */}
                        <div className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">tips_and_updates</span>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">Dicas e Novidades</h3>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={settings.tips}
                                                onChange={() => toggle('tips')}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500 pr-12">Conteúdos educativos, curiosidades sobre raças e novidades do mundo pet.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors">
                        Restaurar Padrões
                    </button>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={() => navigate('/')} className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleSave} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105 active:scale-95">
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;