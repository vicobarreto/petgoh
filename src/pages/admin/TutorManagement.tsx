import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface UserData {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
}

const TutorManagement: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // LOG-06: Delete user
    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Tem certeza que deseja excluir permanentemente o usuário "${userName}"? Esta ação não pode ser desfeita e todas as contas (inclusive acesso) serão deletadas.`)) return;
        try {
            setUpdating(userId);
            // LOG-06: Calls custom RPC to hard-delete auth account directly
            const { error } = await supabase.rpc('delete_user_admin', { target_user_id: userId });
            if (error) throw error;
            setUsers(users.filter(u => u.id !== userId));
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert('Erro ao excluir usuário: ' + error.message);
        } finally {
            setUpdating(null);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            setUpdating(userId);
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert('Função atualizada com sucesso!');
        } catch (error: any) {
            console.error('Error updating role:', error);
            alert('Erro ao atualizar função: ' + error.message);
        } finally {
            setUpdating(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">Admin</span>;
            case 'partner': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Parceiro</span>;
            case 'tutor': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Tutor</span>;
            default: return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{role}</span>;
        }
    };

    if (loading) return <div className="p-8">Carregando usuários...</div>;

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h2>
                    <p className="text-slate-500 mt-1">Gerencie todos os usuários e suas permissões.</p>
                </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Data Cadastro</th>
                                <th className="px-6 py-4">Função Atual</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{user.full_name || 'Sem nome'}</td>
                                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={updating === user.id}
                                                className="px-3 py-1 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            >
                                                <option value="tutor">Tutor</option>
                                                <option value="partner">Parceiro</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                                                disabled={updating === user.id}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Excluir usuário"
                                            >
                                                <span className="material-symbols-outlined text-lg">person_remove</span>
                                            </button>
                                        </div>
                                        {updating === user.id && <span className="ml-2 text-xs text-gray-500">...</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TutorManagement;
