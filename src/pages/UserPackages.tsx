import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface PackageItem {
    id: string;
    service_type: string;
    quantity: number;
}

interface UserPackage {
    id: string;
    status: string;
    purchase_date: string;
    packages: {
        id: string;
        name: string;
        description: string;
        items: PackageItem[];
    };
}

const UserPackages: React.FC = () => {
    const { user } = useAuth();
    const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [generatedVoucher, setGeneratedVoucher] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchUserPackages();
        }
    }, [user]);

    const fetchUserPackages = async () => {
        setLoading(true);
        try {
            // Fetch User Packages with details
            const { data, error } = await supabase
                .from('user_packages')
                .select(`
                    id,
                    status,
                    purchase_date,
                    packages (
                        id,
                        name,
                        description
                    )
                `)
                .eq('user_id', user?.id)
                .order('purchase_date', { ascending: false });
            
            if (error) throw error;
            
            // For each package, fetch items and vouchers count to calculate balance
            const packagesWithDetails = await Promise.all(
                (data || []).map(async (up: any) => {
                    // Fetch Items for this package
                    const { data: items } = await supabase
                        .from('package_items')
                        .select('*')
                        .eq('package_id', up.packages.id);
                    
                    // Fetch Vouchers used for this user_package
                    const { data: voucherData } = await supabase
                        .from('vouchers')
                        .select('*')
                        .eq('user_package_id', up.id);

                    // Attach to object
                    return {
                        ...up,
                        packages: {
                            ...up.packages,
                            items: items || []
                        },
                        vouchers: voucherData || []
                    };
                })
            );

            setUserPackages(packagesWithDetails);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateVoucher = async (userPackageId: string, serviceType: string) => {
        if (!user) return;
        
        try {
            // Generate a simple unique code (in production, use better uniqueness)
            const code = `#${serviceType.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
            
            const { data, error } = await supabase
                .from('vouchers')
                .insert([
                    {
                        user_package_id: userPackageId,
                        user_id: user.id,
                        service_type: serviceType,
                        code: code,
                        status: 'active',
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h validity
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setGeneratedVoucher(code);
            fetchUserPackages(); // Refresh to update counts
            alert(`Voucher Gerado: ${code}`);
        } catch (error: any) {
            console.error('Error generating voucher:', error);
            alert('Erro ao gerar voucher: ' + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando seus pacotes...</div>;

    if (userPackages.length === 0) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Meus Pacotes</h1>
                <p className="text-gray-500 mb-8">Você ainda não possui nenhum pacote ativo.</p>
                <Link to="/packages" className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors">
                    Explorar Pacotes
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4 md:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pacotes</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userPackages.map((up: any) => (
                    <div key={up.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">{up.packages.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">Comprado em {new Date(up.purchase_date).toLocaleDateString()}</p>
                            <span className={`inline-block mt-3 px-2 py-1 text-xs font-bold rounded-full ${up.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {up.status === 'active' ? 'Ativo' : up.status}
                            </span>
                        </div>
                        
                        <div className="p-6 flex-1">
                            <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Créditos de Serviços</h4>
                            <div className="space-y-4">
                                {up.packages.items.map((item: any) => {
                                    const usedCount = up.vouchers.filter((v: any) => v.service_type === item.service_type).length;
                                    const remaining = item.quantity - usedCount;

                                    return (
                                        <div key={item.id} className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="capitalize font-medium text-gray-700">
                                                    {item.service_type === 'hotel' ? 'Diárias' : item.service_type}
                                                </span>
                                                <span className={`${remaining > 0 ? 'text-primary font-bold' : 'text-gray-400'}`}>
                                                    {remaining} / {item.quantity} restantes
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className="bg-primary h-full rounded-full transition-all" 
                                                    style={{ width: `${(remaining / item.quantity) * 100}%` }}
                                                ></div>
                                            </div>
                                            
                                            {remaining > 0 && (
                                                <button 
                                                    onClick={() => handleGenerateVoucher(up.id, item.service_type)}
                                                    className="mt-1 w-full text-xs font-bold text-primary border border-primary/20 bg-primary/5 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">qr_code</span>
                                                    Gerar Voucher
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Voucher Modal or Display (Simple Alert for now) */}
            {generatedVoucher && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setGeneratedVoucher(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Voucher Gerado!</h3>
                        <p className="text-gray-500 mb-6">Apresente este código ao parceiro para utilizar o serviço.</p>
                        
                        <div className="bg-gray-100 p-4 rounded-xl mb-6 border-2 border-dashed border-gray-300">
                            <code className="text-3xl font-mono font-black text-secondary tracking-wider">{generatedVoucher}</code>
                        </div>
                        
                        <p className="text-xs text-red-500 font-medium">Válido por 24 horas</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPackages;
