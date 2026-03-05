import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#0F172A] text-white pt-16 pb-8 mt-auto border-t border-[#1E293B]">
            <div className="w-full max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-6 md:col-span-1">
                        <div className="flex items-center gap-2">
                            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                <span className="material-symbols-outlined text-2xl">pets</span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">PetGoH</h2>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Conectando tutores aos melhores serviços pet com facilidade e segurança.
                        </p>
                        <div className="flex gap-3">
                            {['IG', 'FB', 'LI'].map((social) => (
                                <a key={social} href="#" className="size-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold hover:bg-primary hover:text-white transition-all border border-white/10">
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-white">Serviços</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link to="/hospedagem" className="hover:text-primary transition-colors">Hospedagem</Link></li>
                            <li><Link to="/saude" className="hover:text-primary transition-colors">Saúde</Link></li>
                            <li><Link to="/estetica" className="hover:text-primary transition-colors">Estética</Link></li>
                            <li><Link to="/creche" className="hover:text-primary transition-colors">Creche</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-white">Newsletter</h3>
                        <p className="text-gray-400 text-sm mb-4">Receba novidades e descontos exclusivos para seu pet.</p>
                        <div className="flex gap-2">
                            <input 
                                type="email" 
                                placeholder="Seu e-mail" 
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                            <button className="size-11 rounded-lg bg-primary hover:bg-orange-600 text-white flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-orange-500/20">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© 2024 PetGoH. Todos os direitos reservados.</p>
                    <div className="flex gap-6">
                        <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
                        <Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;