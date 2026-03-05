
import React from 'react';
import { Link } from 'react-router-dom';
import logoPetgoh from '../imagens/logo-petgoh.png';

const Unauthorized: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="max-w-lg w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center space-y-6">
                
                {/* Logo */}
                <Link to="/" className="flex justify-center mb-4">
                    <img src={logoPetgoh} alt="PetGoH Logo" className="h-16 w-auto hover:opacity-90 transition-opacity" />
                </Link>

                {/* Security Icon */}
                <div className="mx-auto h-24 w-24 bg-red-50 rounded-full flex items-center justify-center mb-2 animate-pulse">
                    <span className="material-symbols-outlined text-red-500 text-6xl">gpp_maybe</span>
                </div>

                {/* Title & Message */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        Acesso Restrito
                    </h1>
                    <p className="text-gray-500 text-lg">
                        Você não tem permissão para acessar esta área segura.
                    </p>
                    <p className="text-xs text-gray-400 bg-gray-100 py-2 px-4 rounded-lg inline-block font-mono">
                        ERR_ACCESS_DENIED_ADMIN_ONLY
                    </p>
                </div>

                {/* Divider */}
                <div className="w-16 h-1 bg-gray-100 rounded-full mx-auto" />

                {/* Action Button */}
                <Link
                    to="/"
                    className="group relative flex items-center justify-center w-full py-4 px-6 text-base font-bold text-white bg-primary rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-orange-300 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">
                        arrow_back
                    </span>
                    Voltar para Home (Segurança)
                </Link>

                <p className="text-xs text-gray-400 mt-6">
                    Esta tentativa de acesso foi registrada por motivos de segurança.
                </p>
            </div>
        </div>
    );
};

export default Unauthorized;
