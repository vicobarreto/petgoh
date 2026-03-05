import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';

const ComoFunciona: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-1 flex flex-col items-center w-full">
                <div className="w-full max-w-[600px] px-6 py-8 flex flex-col gap-8 md:gap-12">
                    
                    {/* Hero Section */}
                    <section className="flex flex-col items-center text-center gap-6">
                        <h1 className="text-secondary tracking-tight text-3xl md:text-4xl font-extrabold leading-tight">
                            Como funciona o PetGoH
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                            Conectamos você e seu pet aos melhores parceiros com facilidade e pagamento inteligente.
                        </p>
                        <div className="w-full aspect-[4/3] rounded-3xl bg-blue-50 relative overflow-hidden flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
                            <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url('${IMAGES.PACKAGE_HERO}')`, mixBlendMode: 'overlay' }}></div>
                            <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
                                <div className="flex items-end justify-center -space-x-4 mb-4">
                                     <div className="size-20 rounded-full border-4 border-white shadow-lg bg-cover bg-center z-10" style={{ backgroundImage: `url('${IMAGES.AVATAR_WOMAN}')` }}></div>
                                     <div className="size-16 rounded-full border-4 border-white shadow-lg bg-orange-100 flex items-center justify-center z-20 translate-y-2">
                                        <span className="material-symbols-outlined text-4xl text-primary">pets</span>
                                     </div>
                                </div>
                                <div className="h-12 w-0.5 bg-gradient-to-b from-secondary/50 to-secondary/10 border-l-2 border-dashed border-secondary/30"></div>
                                <div className="mt-2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
                                     <div className="flex -space-x-2">
                                        <div className="size-6 rounded-full bg-blue-500 border border-white"></div>
                                        <div className="size-6 rounded-full bg-green-500 border border-white"></div>
                                        <div className="size-6 rounded-full bg-purple-500 border border-white"></div>
                                     </div>
                                     <span className="text-xs font-bold text-gray-700">Parceiros Conectados</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section className="relative">
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-200 border-l-2 border-dashed border-gray-300"></div>
                        <div className="flex flex-col gap-10">
                            {/* Step 1 */}
                            <div className="relative flex gap-6 group">
                                <div className="relative z-10 shrink-0">
                                    <div className="flex items-center justify-center size-14 rounded-full bg-white border-2 border-primary text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <span className="font-bold text-xl">1</span>
                                    </div>
                                </div>
                                <div className="pt-1 flex-1">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group-hover:shadow-md transition-shadow">
                                        <div className="absolute right-0 top-0 p-4 opacity-10">
                                            <span className="material-symbols-outlined text-6xl text-primary">shopping_bag</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Busque & Monte seu Pacote</h3>
                                        <p className="text-gray-600 text-sm mb-4">Adicione serviços de diferentes parceiros no mesmo carrinho: hotel, banho, vacina e muito mais.</p>
                                        <div className="flex gap-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                Multi-serviços
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Carrinho Único
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex gap-6 group">
                                <div className="relative z-10 shrink-0">
                                    <div className="flex items-center justify-center size-14 rounded-full bg-white border-2 border-secondary text-secondary shadow-sm group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                                        <span className="font-bold text-xl">2</span>
                                    </div>
                                </div>
                                <div className="pt-1 flex-1">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group-hover:shadow-md transition-shadow">
                                         <div className="absolute right-0 top-0 p-4 opacity-10">
                                            <span className="material-symbols-outlined text-6xl text-secondary">payments</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Divisão Inteligente</h3>
                                        <p className="text-gray-600 text-sm mb-4">Faça um único pagamento. O sistema divide automaticamente os valores para cada parceiro e calcula as taxas.</p>
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-secondary text-white p-1.5 rounded-md">
                                                    <span className="material-symbols-outlined text-lg">credit_card</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-gray-400 font-bold">Total Pago</span>
                                                    <span className="text-sm font-bold text-gray-900">R$ 200</span>
                                                </div>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-300 text-sm">arrow_forward</span>
                                            <div className="flex -space-x-2">
                                                <div className="size-6 rounded-full bg-green-100 border border-white flex items-center justify-center text-green-700 text-[10px] font-bold">$$</div>
                                                <div className="size-6 rounded-full bg-blue-100 border border-white flex items-center justify-center text-blue-700 text-[10px] font-bold">$$</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Step 3 */}
                            <div className="relative flex gap-6 group">
                                <div className="relative z-10 shrink-0">
                                    <div className="flex items-center justify-center size-14 rounded-full bg-white border-2 border-green-500 text-green-500 shadow-sm group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                                        <span className="font-bold text-xl">3</span>
                                    </div>
                                </div>
                                <div className="pt-1 flex-1">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group-hover:shadow-md transition-shadow">
                                         <div className="absolute right-0 top-0 p-4 opacity-10">
                                            <span className="material-symbols-outlined text-6xl text-green-500">celebration</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aproveite!</h3>
                                        <p className="text-gray-600 text-sm mb-4">Receba seus vouchers instantaneamente no app. É só apresentar e aproveitar o melhor para o seu pet.</p>
                                        <div className="flex items-center gap-2 text-green-600 font-medium text-sm bg-green-50 p-2 rounded-lg border border-green-100">
                                            <span className="material-symbols-outlined">qr_code_2</span>
                                            <span>Voucher gerado com sucesso</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="w-full pt-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Dúvidas Frequentes</h2>
                        <div className="flex flex-col gap-3">
                            <details className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                                    <span className="font-medium text-gray-800">Como funciona o pagamento dividido?</span>
                                    <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                                    <p className="pt-2">Você realiza apenas um pagamento no valor total. Nossa tecnologia identifica os serviços contratados e repassa automaticamente a parte de cada parceiro, descontando as taxas da plataforma.</p>
                                </div>
                            </details>
                            <details className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                                    <span className="font-medium text-gray-800">Posso cancelar um serviço do pacote?</span>
                                    <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                                    <p className="pt-2">Sim! Até 24 horas antes do agendamento, você pode cancelar itens individuais do seu carrinho sem custo. O estorno é feito no cartão utilizado.</p>
                                </div>
                            </details>
                            <details className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                                    <span className="font-medium text-gray-800">Os parceiros são verificados?</span>
                                    <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                                    <p className="pt-2">Com certeza. Todos os parceiros PetGoH passam por um rigoroso processo de verificação de documentos e qualidade antes de entrarem na plataforma.</p>
                                </div>
                            </details>
                        </div>
                    </section>

                    <section className="w-full sticky bottom-6 z-40">
                         <button onClick={() => navigate('/')} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-900/20 transform transition hover:scale-[1.02] flex items-center justify-center gap-2">
                            Começar Agora
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ComoFunciona;