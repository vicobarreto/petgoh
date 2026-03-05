import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface CartItemData {
    id: string;
    quantity: number;
    package_id: string;
    package: {
        id: string;
        name: string;
        description: string;
        price: number;
        type: string;
        validity_days: number;
    };
}

interface HistoryItemData {
    id: string;
    package_id: string;
    removed_at: string;
    package: {
        id: string;
        name: string;
        price: number;
    };
}

const Cart: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState<CartItemData[]>([]);
    const [history, setHistory] = useState<HistoryItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchCart();
            fetchHistory();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('cart_items')
                .select('id, quantity, package_id, package:packages(id, name, description, price, type, validity_days)')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems((data as any) || []);
        } catch (err) {
            console.error('Erro ao carregar carrinho:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('cart_history')
                .select('id, package_id, removed_at, package:packages(id, name, price)')
                .eq('user_id', user!.id)
                .order('removed_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setHistory((data as any) || []);
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
        }
    };

    const updateQuantity = async (itemId: string, delta: number) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const newQty = item.quantity + delta;
        if (newQty < 1) return;

        setUpdating(itemId);
        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('id', itemId);

            if (error) throw error;
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
        } catch (err: any) {
            alert('Erro ao atualizar: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        setUpdating(itemId);
        try {
            // Save to history
            await supabase
                .from('cart_history')
                .insert({ user_id: user!.id, package_id: item.package_id });

            // Remove from cart
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', itemId);

            if (error) throw error;

            setItems(prev => prev.filter(i => i.id !== itemId));
            fetchHistory();
        } catch (err: any) {
            alert('Erro ao remover: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    const reAddFromHistory = async (historyItem: HistoryItemData) => {
        if (!user) return;

        try {
            await supabase
                .from('cart_items')
                .upsert(
                    { user_id: user.id, package_id: historyItem.package_id, quantity: 1 },
                    { onConflict: 'user_id,package_id' }
                );

            // Remove from history
            await supabase
                .from('cart_history')
                .delete()
                .eq('id', historyItem.id);

            fetchCart();
            fetchHistory();
        } catch (err: any) {
            alert('Erro: ' + err.message);
        }
    };

    const subtotal = items.reduce((sum, item) => sum + (item.package?.price || 0) * item.quantity, 0);
    const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal + serviceFee;

    // Not logged in
    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm max-w-md mx-auto">
                    <div className="bg-orange-50 p-6 rounded-full inline-flex mb-6">
                        <span className="material-symbols-outlined text-5xl text-primary">shopping_cart</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Faça login para ver seu carrinho</h2>
                    <p className="text-gray-500 mb-6">Você precisa estar logado para adicionar e visualizar itens.</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">login</span>
                        Fazer Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="mb-8">
                <Link to="/packages" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Voltar para Pacotes
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Meu Carrinho</h1>
                <p className="text-gray-500 mt-1">Revise seus itens e finalize sua reserva.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">shopping_cart</span>
                    <p className="text-gray-600 font-semibold text-lg">Seu carrinho está vazio</p>
                    <p className="text-gray-400 text-sm mt-1 mb-6">Explore nossos pacotes e adicione ao carrinho!</p>
                    <Link to="/packages" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">
                        <span className="material-symbols-outlined">inventory_2</span>
                        Ver Pacotes
                    </Link>

                    {/* History section when cart is empty */}
                    {history.length > 0 && (
                        <div className="mt-10 max-w-lg mx-auto text-left">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary">history</span>
                                Deseja voltar a comprar?
                            </h3>
                            <div className="space-y-3">
                                {history.map((h) => (
                                    <div key={h.id} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{h.package?.name}</p>
                                            <p className="text-xs text-gray-400">R$ {h.package?.price?.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => reAddFromHistory(h)}
                                            className="bg-secondary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                            Adicionar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            {items.map((item) => (
                                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                                    <Link to={`/package/${item.package_id}`} className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80")' }} />
                                    </Link>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Link to={`/package/${item.package_id}`} className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">
                                                    {item.package?.name}
                                                </Link>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.package?.description}</p>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary mt-2">
                                                    {item.package?.type === 'especial' ? '⭐ Especial' : 'Básico'} • {item.package?.validity_days} dias
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                disabled={updating === item.id}
                                                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined">delete_outline</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    disabled={item.quantity <= 1 || updating === item.id}
                                                    className="px-3 py-1 text-gray-600 hover:text-primary font-medium text-lg disabled:opacity-30"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 py-1 text-gray-900 font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    disabled={updating === item.id}
                                                    className="px-3 py-1 text-gray-600 hover:text-primary font-medium text-lg disabled:opacity-30"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="text-xl font-bold text-primary">
                                                R$ {((item.package?.price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* History */}
                        {history.length > 0 && (
                            <div className="pt-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary">history</span>
                                    Deseja voltar a comprar esses pacotes?
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {history.map((h) => (
                                        <div key={h.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:border-primary/30 transition-colors">
                                            <div className="size-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-gray-400">package_2</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 text-sm">{h.package?.name}</h4>
                                                <span className="text-sm font-bold text-primary">R$ {h.package?.price?.toFixed(2)}</span>
                                            </div>
                                            <button
                                                onClick={() => reAddFromHistory(h)}
                                                className="size-8 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-blue-900 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'itens'})</span>
                                    <span className="font-medium text-gray-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Taxa de serviço (5%)</span>
                                    <span className="font-medium text-gray-900">R$ {serviceFee.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 mb-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-base font-semibold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                    ou em até 3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros
                                </p>
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-gray-700 mb-2">Cupom de Desconto</label>
                                <div className="flex gap-2">
                                    <input className="flex-1 rounded-lg border-gray-300 bg-white text-sm px-3 py-2.5 focus:border-primary focus:ring-primary" placeholder="PET10" type="text" />
                                    <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg text-sm font-semibold transition-colors">Aplicar</button>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (items.length === 1) {
                                        navigate(`/checkout/${items[0].package_id}`);
                                    } else {
                                        // For multi-item, go to first item checkout for now
                                        navigate(`/checkout/${items[0].package_id}`);
                                    }
                                }}
                                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                            >
                                Finalizar Pagamento
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                <span>Compra 100% segura</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;