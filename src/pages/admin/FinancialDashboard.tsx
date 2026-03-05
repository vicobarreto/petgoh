import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Transaction {
    id: string;
    created_at: string;
    final_amount: number;
    platform_fee: number;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    partner_id: string | null;
    partner?: { company_name: string };
    type: string;
}

const FinancialDashboard: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState({
        gmv: 0,
        revenue: 0,
        payouts: 0,
        count: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch transactions
            // Note: We avoid inner join syntax 'partner:partners(company_name)' if there's any risk of relationship mismatch
            // Instead we fetch straight and then resolved if needed, but let's try a safer select first.
            // If partners relationship is 1:1, it should work. If it's undefined, it returns null.
            
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .select(`
                    *,
                    partners (
                        company_name
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (txError) {
                console.error('Transactions fetch error:', txError);
                throw txError;
            }

            // Map the data to handle the nested partner object safely
            const txs: Transaction[] = (txData || []).map((t: any) => ({
                ...t,
                partner: Array.isArray(t.partners) ? t.partners[0] : t.partners
            }));
            
            setTransactions(txs);

            // Calculate stats
            // We'll calculate from a fresh query to ensure we get broader stats if possible
            // Using a simple count and sum query
            
            const { data: statsData, error: statsError } = await supabase
                .from('transactions')
                .select('final_amount, platform_fee, status');

            if (statsError) {
                 console.error('Stats fetch error:', statsError);
                 // Don't block the UI if stats fail, just show zeros or partial data
            }

            const allTxs = statsData || [];
            const paidTxs = allTxs.filter(t => t.status === 'paid');
            
            const gmv = paidTxs.reduce((acc, curr) => acc + (Number(curr.final_amount) || 0), 0);
            const revenue = paidTxs.reduce((acc, curr) => acc + (Number(curr.platform_fee) || 0), 0);
            const payouts = gmv - revenue;
            const count = allTxs.length;

            setStats({
                gmv,
                revenue,
                payouts,
                count
            });

        } catch (error: any) {
            console.error('Error fetching financial data:', error);
            // Show more specific error to user/dev
            alert(`Erro ao carregar dados financeiros: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="p-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">Painel Financeiro</h2>
                    <p className="text-slate-500 text-sm mt-1 max-w-2xl">Gestão centralizada de repasses, splits de pagamento e consolidação de receitas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-xl">download</span>
                        <span>Exportar</span>
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="text-center py-12">Carregando dados financeiros...</div>
            ) : (
                <>
                    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">GMV do Período</p>
                            <h3 className="mt-1 text-3xl font-black text-blue-900 tabular-nums">{formatCurrency(stats.gmv)}</h3>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita da Plataforma</p>
                            <h3 className="mt-1 text-3xl font-black text-blue-900 tabular-nums">{formatCurrency(stats.revenue)}</h3>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repasse aos Parceiros</p>
                            <h3 className="mt-1 text-3xl font-black text-blue-900 tabular-nums">{formatCurrency(stats.payouts)}</h3>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Transações</p>
                            <h3 className="mt-1 text-3xl font-black text-blue-900 tabular-nums">{stats.count}</h3>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-blue-900">Registro de Transações Recentes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Data</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Origem</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Valor Total</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Split Plataforma</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Split Parceiro</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 text-sm text-slate-600 tabular-nums font-medium">
                                                {formatDate(tx.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-blue-900">
                                                {tx.partner?.company_name || 'Plataforma / Usuário'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-blue-900 tabular-nums">
                                                {formatCurrency(tx.final_amount)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                                                {formatCurrency(tx.platform_fee)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-primary font-bold tabular-nums">
                                                {formatCurrency(tx.final_amount - tx.platform_fee)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                                    tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    tx.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                    {tx.status === 'paid' ? 'Pago' :
                                                     tx.status === 'pending' ? 'Pendente' : 'Falha'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                                Nenhuma transação registrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FinancialDashboard;
