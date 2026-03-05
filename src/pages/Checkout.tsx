import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface PackageItem {
    id: string;
    service_type: string;
    quantity: number;
}

interface Package {
    id: string;
    name: string;
    description: string;
    price: number;
    type: string;
    validity_days: number;
    is_active: boolean;
    items?: PackageItem[];
}

const SERVICE_LABELS: Record<string, string> = {
    hotel: 'Diárias',
    daycare: 'Creche',
    bath: 'Banho',
    grooming: 'Tosa',
    vet: 'Veterinário',
    vaccine: 'Vacina',
    walk: 'Passeio',
};

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    const [pkg, setPkg] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [method, setMethod] = useState('pix');
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState(1);

    // Card form state
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardName, setCardName] = useState('');

    useEffect(() => {
        if (!id) {
            navigate('/packages');
            return;
        }
        fetchPackage();
    }, [id]);

    const fetchPackage = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('packages')
            .select('*, items:package_items(*)')
            .eq('id', id)
            .single();

        if (error || !data) {
            navigate('/packages');
            return;
        }
        setPkg(data);
        setLoading(false);
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 16);
        return cleaned.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        return cleaned;
    };

    const handlePayment = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/checkout/${id}` } });
            return;
        }

        if (method === 'credit') {
            if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
                alert('Preencha todos os dados do cartão.');
                return;
            }
        }

        setIsProcessing(true);

        try {
            const { error } = await supabase
                .from('user_packages')
                .insert([{
                    user_id: user.id,
                    package_id: pkg!.id,
                    status: 'active',
                    purchase_date: new Date().toISOString(),
                }]);

            if (error) throw error;

            await new Promise(resolve => setTimeout(resolve, 2000));

            setStep(3);
        } catch (error: any) {
            console.error('Checkout Error:', error);
            alert('Erro ao processar compra: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-grow w-full flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    <p className="text-gray-500 text-sm">Carregando pacote...</p>
                </div>
            </div>
        );
    }

    if (!pkg) return null;

    // Success screen
    if (step === 3) {
        return (
            <div className="flex-grow w-full flex items-center justify-center py-20 px-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Compra Confirmada!</h2>
                    <p className="text-gray-500 mb-6">
                        Seu pacote <strong>{pkg.name}</strong> foi adquirido com sucesso. Agora ele está disponível nas suas compras.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Pacote</span>
                            <span className="font-semibold text-gray-900">{pkg.name}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Valor</span>
                            <span className="font-semibold text-gray-900">R$ {pkg.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Validade</span>
                            <span className="font-semibold text-gray-900">{pkg.validity_days} dias</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link
                            to="/meus-pacotes"
                            className="w-full h-12 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                        >
                            <span className="material-symbols-outlined">inventory_2</span>
                            Ver Meus Pacotes
                        </Link>
                        <Link
                            to="/"
                            className="w-full h-12 bg-gray-100 text-gray-700 font-semibold rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            Voltar ao Início
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const priceValue = pkg.price;

    return (
        <div className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-10">
                {[
                    { n: 1, label: 'Revisão' },
                    { n: 2, label: 'Pagamento' },
                    { n: 3, label: 'Confirmação' },
                ].map((s, i) => (
                    <React.Fragment key={s.n}>
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                step >= s.n ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                                {step > s.n ? <span className="material-symbols-outlined text-lg">check</span> : s.n}
                            </div>
                            <span className={`text-sm font-medium hidden sm:inline ${step >= s.n ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                        </div>
                        {i < 2 && <div className={`w-12 sm:w-20 h-0.5 ${step > s.n ? 'bg-primary' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                    {step === 1 && (
                        <>
                            {/* Package Review */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">inventory_2</span>
                                    <h3 className="text-lg font-bold text-gray-900">Detalhes do Pacote</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-3xl text-gray-400">package_2</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-gray-900">{pkg.name}</h4>
                                            <p className="text-gray-500 text-sm mt-1">{pkg.description}</p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    pkg.type === 'especial'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {pkg.type === 'especial' ? '⭐ Plano Especial' : 'Plano Básico'}
                                                </span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">{pkg.validity_days} dias de validade</span>
                                            </div>
                                        </div>
                                    </div>

                                    {pkg.items && pkg.items.length > 0 && (
                                        <div className="mt-6 pt-5 border-t border-gray-100">
                                            <h5 className="text-sm font-bold text-gray-700 mb-3">Serviços Inclusos</h5>
                                            <div className="grid grid-cols-2 gap-3">
                                                {pkg.items.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                                        <div>
                                                            <span className="text-sm font-semibold text-gray-800">{item.quantity}x</span>
                                                            <span className="text-sm text-gray-600 ml-1">{SERVICE_LABELS[item.service_type] || 'Serviço'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Continue button */}
                            <button
                                onClick={() => setStep(2)}
                                className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
                            >
                                <span>Continuar para Pagamento</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Payment Methods */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">payments</span>
                                    <h3 className="text-lg font-bold text-gray-900">Método de Pagamento</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { key: 'pix', icon: 'qr_code_2', label: 'PIX', desc: 'Aprovação instantânea' },
                                            { key: 'credit', icon: 'credit_card', label: 'Cartão', desc: 'Até 12x sem juros' },
                                            { key: 'boleto', icon: 'receipt_long', label: 'Boleto', desc: 'Vence em 3 dias' },
                                        ].map((m) => (
                                            <label key={m.key} className="cursor-pointer group relative">
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    className="sr-only"
                                                    checked={method === m.key}
                                                    onChange={() => setMethod(m.key)}
                                                />
                                                <div className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 transition-all h-full ${
                                                    method === m.key
                                                        ? 'border-primary bg-primary/5 shadow-sm'
                                                        : 'border-gray-200 bg-white hover:border-primary/50'
                                                }`}>
                                                    <div className={`w-5 h-5 rounded-full border-2 transition-colors absolute top-3 right-3 flex items-center justify-center ${
                                                        method === m.key ? 'border-primary bg-primary' : 'border-gray-300'
                                                    }`}>
                                                        {method === m.key && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={`material-symbols-outlined text-3xl ${method === m.key ? 'text-primary' : 'text-gray-400'}`}>
                                                        {m.icon}
                                                    </span>
                                                    <span className="font-bold text-sm text-gray-900">{m.label}</span>
                                                    <span className="text-xs text-gray-400">{m.desc}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Credit Card Form */}
                            {method === 'credit' && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900">Dados do Cartão</h3>
                                        <div className="flex gap-2">
                                            <div className="h-7 w-11 bg-blue-600 rounded text-white text-[8px] font-bold flex items-center justify-center">VISA</div>
                                            <div className="h-7 w-11 bg-red-500 rounded text-white text-[8px] font-bold flex items-center justify-center">MC</div>
                                            <div className="h-7 w-11 bg-gray-700 rounded text-white text-[8px] font-bold flex items-center justify-center">ELO</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Número do Cartão</label>
                                            <div className="relative">
                                                <input
                                                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 placeholder-gray-400"
                                                    placeholder="0000 0000 0000 0000"
                                                    value={cardNumber}
                                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                />
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">credit_card</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Validade</label>
                                                <input
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 placeholder-gray-400"
                                                    placeholder="MM/AA"
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">CVC</label>
                                                <input
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 placeholder-gray-400"
                                                    placeholder="123"
                                                    maxLength={4}
                                                    value={cardCvc}
                                                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nome no Cartão</label>
                                            <input
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 placeholder-gray-400 uppercase"
                                                placeholder="Como impresso no cartão"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PIX instructions */}
                            {method === 'pix' && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-green-600 text-2xl">qr_code_2</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Pagamento via PIX</h4>
                                            <p className="text-sm text-gray-500">
                                                Ao confirmar, um QR Code será gerado para pagamento imediato. A aprovação é instantânea e seu pacote será ativado em segundos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Boleto instructions */}
                            {method === 'boleto' && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-amber-600 text-2xl">receipt_long</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Pagamento via Boleto</h4>
                                            <p className="text-sm text-gray-500">
                                                O boleto será gerado com vencimento em 3 dias úteis. Após a compensação, seu pacote será ativado automaticamente.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="h-14 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Voltar
                                </button>
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className={`flex-1 h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all transform flex items-center justify-center gap-3 ${
                                        isProcessing ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">lock</span>
                                            <span>Pagar R$ {priceValue.toFixed(2).replace('.', ',')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">shield</span>
                                Pagamento seguro com criptografia SSL de 256 bits
                            </p>
                        </>
                    )}
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-24 flex flex-col gap-6">
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-base font-bold text-gray-900">Resumo do Pedido</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-primary">package_2</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm">{pkg.name}</h4>
                                        <p className="text-xs text-gray-400">{pkg.type === 'especial' ? 'Plano Especial' : 'Plano Básico'} • {pkg.validity_days} dias</p>
                                    </div>
                                </div>

                                {pkg.items && pkg.items.length > 0 && (
                                    <div className="space-y-2 pt-3 border-t border-gray-100">
                                        {pkg.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-500">{item.quantity}x {SERVICE_LABELS[item.service_type] || 'Serviço'}</span>
                                                <span className="text-gray-400">Incluso</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-700">R$ {priceValue.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Taxas</span>
                                        <span className="text-green-600 font-medium">Grátis</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-black text-2xl text-primary">R$ {priceValue.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                                <span className="material-symbols-outlined text-green-600 text-lg">verified_user</span>
                                <span className="text-xs font-medium text-green-700">Compra Segura</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                                <span className="material-symbols-outlined text-blue-600 text-lg">support_agent</span>
                                <span className="text-xs font-medium text-blue-700">Suporte 24h</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                                <span className="material-symbols-outlined text-amber-600 text-lg">autorenew</span>
                                <span className="text-xs font-medium text-amber-700">Garantia PetGoH</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                                <span className="material-symbols-outlined text-purple-600 text-lg">loyalty</span>
                                <span className="text-xs font-medium text-purple-700">Pontos Fidelidade</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;