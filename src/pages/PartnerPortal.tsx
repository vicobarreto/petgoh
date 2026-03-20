import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import logoPetgoh from '../imagens/logo-petgoh.png';

const PartnerPortal: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If user is already logged in, check their role
    if (user) {
        if (user.role === 'partner' || user.role === 'admin') {
            return <Navigate to="/partner/dashboard" replace />;
        } else {
            // Tutor logged in trying to access partner portal
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-red-500 text-3xl">gpp_bad</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
                        <p className="text-gray-600 mb-6">
                            Esta área é exclusiva para profissionais, clínicas, pet shops, hotéis e prestadores de serviço parceiros da PetGoH. 
                            <br/><br/>
                            Verificamos que o seu perfil atual é de <strong>Tutor</strong>.
                        </p>
                        <Link to="/" className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">
                            <span className="material-symbols-outlined">home</span>
                            Voltar para o site
                        </Link>
                    </div>
                </div>
            );
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            if (authError) throw new Error(authError.message);
            if (!authUser) throw new Error('Erro ao autenticar.');

            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', authUser.id)
                .single();

            const role = userData?.role;
            if (role !== 'partner' && role !== 'admin') {
                await supabase.auth.signOut();
                throw new Error('Acesso negado: Somente parceiros autorizados.');
            }

            navigate('/partner/dashboard');

        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Link to="/">
                        <img src={logoPetgoh} alt="PetGoH Logo" className="h-14 w-auto hover:opacity-90 transition-opacity" />
                    </Link>
                </div>

                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <div className="bg-slate-900 p-6 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Portal do Parceiro</h1>
                        <p className="text-slate-400 text-sm">Acesse o seu painel de gerenciamento ou cadastre-se para ser um novo prestador.</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-2 border border-red-100">
                                <span className="material-symbols-outlined text-base mt-0.5">error</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail Profissional</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                                    <input 
                                        type="email" 
                                        required
                                        value={loginEmail}
                                        onChange={e => setLoginEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        placeholder="seu@negocio.com.br"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                                    <input 
                                        type="password" 
                                        required
                                        value={loginPassword}
                                        onChange={e => setLoginPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Link to="/forgot-password" className="text-xs text-secondary font-semibold hover:underline">Esqueceu a senha?</Link>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-secondary text-white font-bold text-sm py-3.5 rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        Entrar no Painel
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center pt-6 border-t border-gray-100">
                            <p className="text-gray-600 text-sm mb-3">Ainda não é um parceiro credenciado?</p>
                            <Link 
                                to="/register-partner" 
                                className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                                Registrar Novo Negócio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerPortal;
