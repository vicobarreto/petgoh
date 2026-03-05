import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        platformRevenue: 0,
        pendingPartners: 0,
        newTutorsToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // 1. Total Sales & Platform Revenue
            const { data: transactions, error: txError } = await supabase
                .from('transactions')
                .select('final_amount, platform_fee')
                .eq('status', 'paid');
            
            if (txError) throw txError;

            const totalSales = transactions?.reduce((sum, tx) => sum + (Number(tx.final_amount) || 0), 0) || 0;
            const platformRevenue = transactions?.reduce((sum, tx) => sum + (Number(tx.platform_fee) || 0), 0) || 0;

            // 2. Pending Partners
            const { count: pendingPartnersCount, error: partnerError } = await supabase
                .from('partners')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            if (partnerError) throw partnerError;

            // 3. New Tutors Today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const { count: newTutorsCount, error: tutorError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'tutor')
                .gte('created_at', today.toISOString());

            if (tutorError) throw tutorError;

            setStats({
                totalSales,
                platformRevenue,
                pendingPartners: pendingPartnersCount || 0,
                newTutorsToday: newTutorsCount || 0
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">Carregando métricas...</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Visão Geral do Admin</h2>
                    <p className="text-slate-500">Veja o que está acontecendo com o PetGoH hoje.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-slate-400">download</span>
                        Exportar Dados
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 font-medium text-sm">Volume Total de Vendas</p>
                        <span className="material-symbols-outlined text-blue-800 bg-blue-800/10 p-2 rounded-lg text-lg">payments</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalSales)}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center text-emerald-500 text-sm font-bold">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            --%
                        </span>
                        <span className="text-slate-400 text-xs">vs mês anterior</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 font-medium text-sm">Receita da Plataforma</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg text-lg">account_balance_wallet</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.platformRevenue)}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center text-emerald-500 text-sm font-bold">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            --%
                        </span>
                        <span className="text-slate-400 text-xs">margem líquida</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 font-medium text-sm">Parceiros Pendentes</p>
                        <span className="material-symbols-outlined text-amber-500 bg-amber-100 p-2 rounded-lg text-lg">pending_actions</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.pendingPartners}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-slate-400 text-xs">Aguardando aprovação</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 font-medium text-sm">Novos Tutores (Hoje)</p>
                        <span className="material-symbols-outlined text-indigo-500 bg-indigo-50 p-2 rounded-lg text-lg">person_add</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.newTutorsToday}</h3>
                    <div className="flex items-center gap-2 mt-2">
                         <span className="text-slate-400 text-xs">Cadastros nas últimas 24h</span>
                    </div>
                </div>
            </div>
            {/* Other components for the dashboard can be added here */}
        </div>
    );
};

export default AdminDashboard;
