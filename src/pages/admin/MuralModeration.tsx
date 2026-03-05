import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface WallPost {
    id: string;
    content: string;
    image_url: string | null;
    type: 'adoption' | 'lost' | 'general';
    status: 'active' | 'pending' | 'reported' | 'hidden';
    created_at: string;
    user_id: string;
    user?: {
        full_name: string;
        email: string;
        avatar_url: string | null;
    };
    report_reason?: string; // If we implement reports table later, join it here. For now, assume a column or separate fetch.
}

const MuralModeration: React.FC = () => {
    const [posts, setPosts] = useState<WallPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'reported'>('all');

    useEffect(() => {
        fetchPosts();
    }, [filter]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            
            // Fetch posts with user data
            // We use 'users' instead of 'user:users' alias to be safer if the relation name detection is flaky
            // We can rename it in client-side code
            
            let query = supabase
                .from('wall_posts')
                .select(`
                    *,
                    users (
                        full_name,
                        email,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false });

            if (filter === 'pending') {
                query = query.eq('status', 'pending');
            } else if (filter === 'reported') {
                query = query.eq('status', 'reported');
            }

            const { data, error } = await query;
            
            if (error) {
                console.error('Wall posts fetch error:', error);
                throw error;
            }

            // Map data to ensure 'user' property exists as expected by the component
            const mappedPosts = (data || []).map((post: any) => ({
                ...post,
                user: Array.isArray(post.users) ? post.users[0] : post.users
            }));

            setPosts(mappedPosts);
        } catch (error: any) {
            console.error('Error fetching wall posts:', error);
            alert(`Erro ao carregar publicações: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
        try {
            if (action === 'delete') {
                if (!confirm('Tem certeza que deseja excluir esta publicação?')) return;
                const { error } = await supabase.from('wall_posts').delete().eq('id', id);
                if (error) throw error;
            } else {
                const status = action === 'approve' ? 'active' : 'hidden'; // or 'rejected'
                const { error } = await supabase
                    .from('wall_posts')
                    .update({ status })
                    .eq('id', id);
                if (error) throw error;
            }
            fetchPosts();
        } catch (error) {
            console.error(`Error performing action ${action}:`, error);
            alert('Erro ao realizar ação');
        }
    };

    const getStatusComponent = (status: string) => {
        switch (status) {
            case 'reported': return <div className="text-red-600"><div className="flex items-center gap-1.5 font-medium"><span className="material-symbols-outlined text-base">report</span>Denunciado</div></div>;
            case 'active': return <div className="flex items-center gap-1.5 text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500"></span>Ativo</div>;
            case 'pending': return <div className="flex items-center gap-1.5 text-yellow-600 font-medium"><span className="material-symbols-outlined text-base">hourglass_empty</span>Pendente</div>;
            case 'hidden': return <div className="flex items-center gap-1.5 text-gray-500 font-medium"><span className="material-symbols-outlined text-base">visibility_off</span>Oculto</div>;
            default: return null;
        }
    };
    
    return (
        <div className="p-8">
             <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                   <h2 className="text-3xl font-black text-secondary tracking-tight">Moderação do Mural</h2>
                   <p className="text-secondary/60 mt-1">Gerencie a segurança e a qualidade das publicações da comunidade.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-secondary hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'pending' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-secondary hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Pendentes
                    </button>
                    <button 
                        onClick={() => setFilter('reported')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'reported' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-secondary hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Denunciados
                    </button>
                </div>
             </div>

             {loading ? (
                 <div className="text-center py-12">Carregando publicações...</div>
             ) : (
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                <tr className="border-b border-slate-200">
                                    <th className="px-6 py-4">Usuário</th>
                                    <th className="px-6 py-4">Conteúdo</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {posts.map(post => (
                                    <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {post.user?.avatar_url ? (
                                                    <img alt="User" className="w-10 h-10 rounded-full object-cover border border-gray-200" src={post.user.avatar_url} />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                        <span className="material-symbols-outlined">person</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-900">{post.user?.full_name || 'Usuário Desconhecido'}</p>
                                                    <p className="text-xs text-slate-500">{post.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                             <div className="flex items-center gap-3 max-w-md">
                                                {post.image_url && <img alt="Post" className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0" src={post.image_url} />}
                                                <p className="text-sm font-medium text-slate-800 line-clamp-2">{post.content}</p>
                                             </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                                                post.type === 'lost' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                                                post.type === 'adoption' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                'bg-slate-50 text-slate-700 border border-slate-100'
                                            }`}>
                                                {post.type === 'lost' ? 'Perdido' : post.type === 'adoption' ? 'Adoção' : 'Geral'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">{getStatusComponent(post.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleAction(post.id, 'approve')}
                                                    className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Aprovar"
                                                >
                                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(post.id, 'reject')}
                                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Ocultar"
                                                >
                                                    <span className="material-symbols-outlined text-xl">visibility_off</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(post.id, 'delete')}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                               ))}
                               {posts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            Nenhuma publicação encontrada.
                                        </td>
                                    </tr>
                               )}
                            </tbody>
                        </table>
                    </div>
                 </div>
             )}
        </div>
    );
};

export default MuralModeration;
