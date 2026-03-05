import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';

const NotificationOnboarding: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Visual Section */}
                    <div className="relative order-2 lg:order-1 flex justify-center lg:justify-end">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl -z-10"></div>
                        <div className="relative w-full max-w-md aspect-square bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${IMAGES.NOTIFICATIONS_HERO}')` }}></div>
                            
                            {/* Floating Cards */}
                            <div className="absolute top-12 -right-4 bg-white p-3 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined text-xl">vaccines</span>
                                </div>
                                <div className="text-xs font-medium pr-2">
                                    <p className="text-gray-900 font-bold">Vacina Amanhã!</p>
                                    <p className="text-gray-500">10:00 AM</p>
                                </div>
                            </div>
                            
                            <div className="absolute bottom-12 -left-4 bg-white p-3 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                </div>
                                <div className="text-xs font-medium pr-2">
                                    <p className="text-gray-900 font-bold">Banho Confirmado</p>
                                    <p className="text-gray-500">PetShop Amigo</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="order-1 lg:order-2 text-center lg:text-left space-y-8 max-w-lg mx-auto lg:mx-0">
                        <div className="space-y-4">
                            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-2">
                                <span className="material-symbols-outlined text-primary text-3xl">notifications_active</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                                Fique por dentro <br className="hidden sm:block"/> do cuidado
                            </h2>
                            <p className="text-lg text-gray-600">
                                Não deixe passar nada. Ative as notificações para receber atualizações importantes sobre a saúde e bem-estar do seu pet em tempo real.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">medical_services</span>
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900">Lembretes de vacina</h3>
                                    <p className="text-sm text-gray-500">Nunca perca uma data importante de imunização.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">task_alt</span>
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900">Confirmação instantânea</h3>
                                    <p className="text-sm text-gray-500">Saiba na hora quando seu agendamento for aceito.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">favorite</span>
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900">Dicas de bem-estar</h3>
                                    <p className="text-sm text-gray-500">Conteúdos personalizados para o seu melhor amigo.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <button 
                                onClick={() => navigate('/notifications/settings')}
                                className="w-full py-4 px-6 bg-primary hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                Ativar Notificações
                            </button>
                            <button 
                                onClick={() => navigate('/')}
                                className="text-gray-500 font-medium hover:text-gray-800 transition-colors py-2 text-center"
                            >
                                Agora não
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotificationOnboarding;