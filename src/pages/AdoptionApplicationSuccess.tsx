import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdoptionApplicationSuccess: React.FC = () => {
    const navigate = useNavigate();

    return (
        <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background-light">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="h-2 w-full bg-gradient-to-r from-secondary to-primary"></div>
                <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                    <div className="mb-8">
                        <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-sm flex items-center justify-center">
                            <img alt="Bento" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJeCTFWPYF5hzIO4pRLtpLfcgJOOJZCEUGKK_Lqbh2l7eUp13W1WJXrqrPVrb9R1Rm9MmKSsD3qZitPOlJ87y5vRrEuHWtpTChScciYDx4ZxW44yoyExH_UrVoVYQLZUWL07Ndam9fLeZwC95vofOpEGw6ZrUpdyEsVVaZjFd0V0rVUS_D3HM1diZLwVWG2DUJTE2Co0MjKiCfv8YLm1KUbsYEn8H_T9u8chL7MIKI_YbASb9dBGBVqObbNxODVWm1RHu2gw1kfF3y" />
                        </div>
                    </div>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Solicitação enviada!</h1>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            Sua intenção de adotar o <span className="font-semibold text-primary">Bento</span> foi encaminhada.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-slate-600">A ONG responsável entrará em contato em até <span className="font-bold text-slate-800">48h</span>.</p>
                        </div>
                    </div>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full">
                        <button onClick={() => navigate('/mural')} className="flex-1 inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl text-white bg-primary hover:bg-orange-600">
                            Voltar para o Mural
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AdoptionApplicationSuccess;
