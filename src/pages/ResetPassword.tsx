import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logoPetgoh from '../imagens/logo-petgoh.png';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true);
                setIsCheckingSession(false);
            }
        });

        // Also check for existing session (user may have already been redirected)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsValidSession(true);
            }
            setIsCheckingSession(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password.length < 8) {
            setMessage({ type: 'error', text: 'A senha deve ter no mínimo 8 caracteres.' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                if (error.message.includes('should be different')) {
                    setMessage({ type: 'error', text: 'A nova senha deve ser diferente da senha atual.' });
                } else {
                    setMessage({ type: 'error', text: error.message });
                }
            } else {
                setMessage({ type: 'success', text: 'Senha redefinida com sucesso!' });
                setTimeout(() => navigate('/login'), 2500);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Ocorreu um erro inesperado. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500">Validando link de redefinição...</p>
                </div>
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center space-y-6">
                    <Link to="/" className="flex justify-center">
                        <img src={logoPetgoh} alt="PetGoH Logo" className="h-16 w-auto" />
                    </Link>
                    <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-500 text-4xl">link_off</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Link inválido ou expirado</h2>
                    <p className="text-sm text-gray-600">
                        Este link de redefinição de senha não é mais válido. Solicite um novo link.
                    </p>
                    <div className="space-y-3">
                        <Link
                            to="/forgot-password"
                            className="block w-full py-3 px-4 text-sm font-medium rounded-xl text-white bg-primary hover:bg-orange-600 transition-all text-center"
                        >
                            Solicitar novo link
                        </Link>
                        <Link
                            to="/login"
                            className="block text-sm text-gray-600 hover:text-primary transition-colors"
                        >
                            Voltar para Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <Link to="/" className="flex justify-center mb-6">
                        <img src={logoPetgoh} alt="PetGoH Logo" className="h-16 w-auto mx-auto" />
                    </Link>
                    <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-green-600 text-2xl">shield_lock</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Nova Senha</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Crie uma senha para proteger sua conta.
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    {message && (
                        <div
                            className={`p-4 rounded-md border-l-4 ${
                                message.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                            }`}
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span
                                        className={`material-symbols-outlined ${
                                            message.type === 'success' ? 'text-green-500' : 'text-red-500'
                                        }`}
                                    >
                                        {message.type === 'success' ? 'check_circle' : 'error'}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p
                                        className={`text-sm font-medium ${
                                            message.type === 'success' ? 'text-green-700' : 'text-red-700'
                                        }`}
                                    >
                                        {message.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Nova Senha
                        </label>
                        <input
                            id="new-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Nova Senha
                        </label>
                        <input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                                confirmPassword.length > 0 && confirmPassword !== password
                                    ? 'border-red-400 bg-red-50'
                                    : confirmPassword.length > 0 && confirmPassword === password
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-300'
                            }`}
                            placeholder="Repita a nova senha"
                        />
                        {confirmPassword.length > 0 && confirmPassword !== password && (
                            <p className="mt-1 text-xs text-red-600">As senhas não coincidem.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || password.length < 8 || password !== confirmPassword}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all ${
                            isLoading || password.length < 8 || password !== confirmPassword
                                ? 'opacity-70 cursor-not-allowed'
                                : ''
                        }`}
                    >
                        {isLoading ? (
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <span className="material-symbols-outlined text-orange-200 group-hover:text-orange-100 text-lg">
                                    lock_reset
                                </span>
                            </span>
                        )}
                        {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
