import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PackagesList from '../components/PackagesList';
import { IMAGES } from '../types';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const categories = [
        { name: 'Hospedagem', icon: 'home', color: 'orange', route: '/hospedagem' },
        { name: 'Saúde', icon: 'medical_services', color: 'blue', route: '/saude' },
        { name: 'Estética', icon: 'content_cut', color: 'purple', route: '/estetica' },
        { name: 'Cãomunicação', icon: 'groups', color: 'purple', route: '/caomunicacao' }
    ];

    return (
        <div className="flex-1 flex flex-col items-center w-full">
            <div className="w-full max-w-[1200px] px-6 py-8 flex flex-col gap-10">
                {/* Hero Section (Sem Busca) */}
                <section className="flex flex-col items-center gap-6 py-6">
                    <h1 className="text-secondary tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center">
                        O que seu pet precisa hoje?
                    </h1>
                    
                    {/* Categories */}
                    <div className="flex gap-4 overflow-x-auto w-full justify-start md:justify-center pb-2 px-2 no-scrollbar">
                        {categories.map((cat) => (
                            <Link 
                                to={cat.route}
                                key={cat.name} 
                                className="flex shrink-0 items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                            >
                                <div className={`p-2 rounded-lg bg-${cat.color}-50 text-${cat.color === 'orange' ? 'primary' : cat.color === 'blue' ? 'secondary' : cat.color + '-600'} transition-colors`}>
                                    <span className="material-symbols-outlined">{cat.icon}</span>
                                </div>
                                <span className="font-semibold text-gray-700">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>



                {/* Smart Packages Section */}
                <section>
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Promoções da Semana</h2>
                            <p className="text-gray-500 mt-2">Pacotes exclusivos com descontos especiais para você.</p>
                        </div>
                        <Link
                            to="/packages"
                            className="group flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                        >
                            Visualizar todos os pacotes
                            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Dynamic Packages List (Limit 3 for Home Layout) */}
                    <PackagesList limit={3} showTitle={false} />
                </section>

                {/* Banner Payment */}
                <section className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                            <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Facilidade no Pagamento</h3>
                            <p className="text-gray-600 text-sm">Divida os custos com seu parceiro ou familiar direto no app.</p>
                        </div>
                    </div>
                    <Link to="/como-funciona" className="text-secondary font-semibold text-sm hover:underline flex items-center gap-1">
                        Saiba como funciona
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                </section>

                {/* Features Section */}
                <section className="py-12 w-full border-t border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Por que escolher a PetGoH?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="size-16 rounded-full bg-blue-50 text-secondary flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl">verified_user</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Segurança Garantida</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Todos os parceiros passam por um rigoroso processo de verificação e treinamento para garantir o melhor cuidado para seu pet.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="size-16 rounded-full bg-orange-50 text-primary flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl">payments</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Pagamento Facilitado</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Divida os custos automaticamente entre tutores e familiares, sem complicações e com total transparência.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="size-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl">support_agent</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Suporte 24h</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Nossa equipe de especialistas está disponível 24 horas por dia, 7 dias por semana, para ajudar em qualquer emergência.</p>
                        </div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section className="w-full py-8">
                    <div className="bg-secondary/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                        <h2 className="text-3xl font-bold text-secondary text-center mb-12 relative z-10">Como Funciona para Tutores</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            <div className="flex flex-col items-center relative">
                                <div className="bg-white size-20 rounded-2xl shadow-md flex items-center justify-center text-secondary mb-4 z-10 relative">
                                    <span className="material-symbols-outlined text-4xl">search</span>
                                    <div className="absolute -top-3 -right-3 size-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-secondary/5">1</div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Busque</h3>
                                <p className="text-center text-gray-600 text-sm">Encontre os melhores serviços e parceiros perto de você.</p>
                            </div>
                            <div className="flex flex-col items-center relative">
                                <div className="hidden md:block absolute top-10 right-[50%] left-[-50%] h-0.5 bg-gray-300 -z-0"></div>
                                <div className="bg-white size-20 rounded-2xl shadow-md flex items-center justify-center text-secondary mb-4 z-10 relative">
                                    <span className="material-symbols-outlined text-4xl">calendar_month</span>
                                    <div className="absolute -top-3 -right-3 size-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-secondary/5">2</div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Agende</h3>
                                <p className="text-center text-gray-600 text-sm">Escolha o horário e personalize seu pacote de serviços.</p>
                            </div>
                            <div className="flex flex-col items-center relative">
                                <div className="hidden md:block absolute top-10 right-[50%] left-[-50%] h-0.5 bg-gray-300 -z-0"></div>
                                <div className="bg-white size-20 rounded-2xl shadow-md flex items-center justify-center text-secondary mb-4 z-10 relative">
                                    <span className="material-symbols-outlined text-4xl">sentiment_satisfied</span>
                                    <div className="absolute -top-3 -right-3 size-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-secondary/5">3</div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Aproveite</h3>
                                <p className="text-center text-gray-600 text-sm">Relaxe enquanto seu pet recebe todo o carinho e cuidado.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="w-full py-12 bg-secondary rounded-3xl text-white px-8">
                    <div className="flex flex-col items-center mb-10">
                        <h2 className="text-3xl font-bold text-center">Números que nos orgulham</h2>
                        <div className="w-16 h-1 bg-primary rounded mt-4"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-4xl font-bold">50k+</span>
                            <span className="text-sm text-blue-200">Pets atendidos</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 pl-4 md:pl-0">
                            <span className="text-4xl font-bold">2k+</span>
                            <span className="text-sm text-blue-200">Parceiros</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 pl-4 md:pl-0">
                            <span className="text-4xl font-bold">4.9</span>
                            <span className="text-sm text-blue-200">Avaliação Média</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 pl-4 md:pl-0">
                            <span className="text-4xl font-bold">24/7</span>
                            <span className="text-sm text-blue-200">Suporte Ativo</span>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="w-full py-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">O que dizem os tutores</h2>
                    <div className="relative w-full overflow-hidden">
                        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
                            <div className="min-w-[300px] md:min-w-[350px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm snap-center">
                                <div className="flex gap-1 text-yellow-400 mb-4">
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                </div>
                                <p className="text-gray-600 mb-6 text-sm italic">"A facilidade de dividir o pagamento com meu marido direto no app foi um divisor de águas. E o Thor adorou o hotel!"</p>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${IMAGES.TESTIMONIAL_ANA}')` }}></div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Ana Souza</p>
                                        <p className="text-xs text-gray-500">Tutora do Thor</p>
                                    </div>
                                </div>
                            </div>
                            <div className="min-w-[300px] md:min-w-[350px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm snap-center">
                                <div className="flex gap-1 text-yellow-400 mb-4">
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                </div>
                                <p className="text-gray-600 mb-6 text-sm italic">"O atendimento veterinário em domicílio salvou meu fim de semana. Profissionais super qualificados e carinhosos."</p>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${IMAGES.TESTIMONIAL_CARLOS}')` }}></div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Carlos Mendes</p>
                                        <p className="text-xs text-gray-500">Tutor da Luna</p>
                                    </div>
                                </div>
                            </div>
                            <div className="min-w-[300px] md:min-w-[350px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm snap-center">
                                <div className="flex gap-1 text-yellow-400 mb-4">
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm">star</span>
                                </div>
                                <p className="text-gray-600 mb-6 text-sm italic">"Uso a PetGoH toda semana para os passeios do Rex. A segurança de saber onde ele está é impagável."</p>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${IMAGES.TESTIMONIAL_MARIANA}')` }}></div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Mariana Lima</p>
                                        <p className="text-xs text-gray-500">Tutora do Rex</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;