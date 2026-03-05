import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logoPetgoh from '../imagens/logo-petgoh.png';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password',
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ 
                    type: 'success', 
                    text: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.' 
                });
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setMessage({ type: 'error', text: 'Ocorreu um erro inesperado. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <Link to="/" className="flex justify-center mb-6">
                        <img src={logoPetgoh} alt="PetGoH Logo" className="h-16 w-auto mx-auto" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900">Redefinir Senha</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Digite seu e-mail e enviaremos um link para você criar uma nova senha.
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {message && (
                        <div className={`p-4 rounded-md border-l-4 ${message.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className={`material-symbols-outlined ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                        {message.type === 'success' ? 'check_circle' : 'error'}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                        {message.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <span className="material-symbols-outlined text-orange-200 group-hover:text-orange-100 text-lg">send</span>
                                </span>
                            )}
                            {isLoading ? 'Enviando...' : 'Enviar Link'}
                        </button>
                    </div>
                    
                    <div className="text-center">
                        <Link to="/login" className="font-medium text-gray-600 hover:text-primary transition-colors flex items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar para Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
