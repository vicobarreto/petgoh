import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    validity_days: number;
    is_active: boolean;
    items?: PackageItem[];
}

interface PackagesListProps {
    limit?: number;
    showTitle?: boolean;
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

const PackagesList: React.FC<PackagesListProps> = ({ limit, showTitle = true }) => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        let query = supabase
            .from('packages')
            .select('*, items:package_items(*)')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching packages:', error);
        } else {
            setPackages(data || []);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (packages.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Nenhum pacote disponível no momento.</p>
            </div>
        );
    }

    const totalCards = packages.length;
    const gridCols = totalCards <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

    return (
        <section className="w-full">
            {showTitle && <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Nossos Pacotes</h2>}

            <div className={`grid grid-cols-1 ${gridCols} gap-6 auto-rows-fr`}>
                {packages.map((pkg) => (
                    <Link
                        key={pkg.id}
                        to={`/package/${pkg.id}`}
                        className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 flex flex-col hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                        <div className="h-48 relative bg-gray-200 flex-shrink-0">
                            <div
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80")' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                                {pkg.items && pkg.items.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {pkg.items.map((item, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                                            >
                                                {item.quantity}x {SERVICE_LABELS[item.service_type] || 'Serviço'}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">A partir de</span>
                                    <span className="text-2xl font-bold text-secondary">R$ {pkg.price.toFixed(2)}</span>
                                </div>
                                <span
                                    className="bg-primary text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
                                >
                                    Ver Detalhes
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {limit && (
                <div className="w-full flex justify-center mt-10">
                    <Link
                        to="/packages"
                        className="group flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                    >
                        Visualizar todos os pacotes
                        <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </Link>
                </div>
            )}
        </section>
    );
};

export default PackagesList;
