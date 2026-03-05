import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const CreatePackage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    
    // Items State
    const [items, setItems] = useState<{service_type: string, quantity: number}[]>([
        { service_type: 'hotel', quantity: 1 }
    ]);

    const serviceTypes = [
        { id: 'hotel', label: 'Hospedagem (Diárias)' },
        { id: 'creche', label: 'Creche (Diárias)' },
        { id: 'banho', label: 'Banho' },
        { id: 'tosa', label: 'Tosa' },
        { id: 'consulta', label: 'Consulta Veterinária' }
    ];

    const handleAddItem = () => {
        setItems([...items, { service_type: 'hotel', quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: 'service_type' | 'quantity', value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Package
            const { data: pkgData, error: pkgError } = await supabase
                .from('packages')
                .insert([
                    {
                        name,
                        description,
                        price: parseFloat(price),
                        image_url: imageUrl,
                        active: true
                    }
                ])
                .select()
                .single();

            if (pkgError) throw pkgError;

            // 2. Create Items
            const itemsToInsert = items.map(item => ({
                package_id: pkgData.id,
                service_type: item.service_type,
                quantity: parseInt(item.quantity.toString())
            }));

            const { error: itemsError } = await supabase
                .from('package_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            alert('Pacote criado com sucesso!');
            navigate('/admin/packages');

        } catch (error: any) {
            console.error('Error creating package:', error);
            alert('Erro ao criar pacote: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Criar Novo Pacote</h1>

            <form onSubmit={handleSubmit} className="max-w-3xl bg-white p-8 rounded-xl shadow-md border border-gray-100">
                
                {/* Basic Info */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">1. Informações Básicas</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Pacote</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Ex: Pacote Verão 2026"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                            <textarea 
                                required
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Descreva os benefícios do pacote..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                            <input 
                                type="url" 
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-700">2. Itens do Pacote</h2>
                        <button 
                            type="button" 
                            onClick={handleAddItem}
                            className="text-sm font-bold text-primary hover:text-orange-700 flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Adicionar Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Serviço</label>
                                    <select 
                                        value={item.service_type}
                                        onChange={e => handleItemChange(index, 'service_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary"
                                    >
                                        {serviceTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Qtd.</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={item.quantity}
                                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remover item"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                    <button 
                        type="button" 
                        onClick={() => navigate('/admin/packages')}
                        className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-2 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        {loading ? 'Salvando...' : 'Criar Pacote'}
                        {!loading && <span className="material-symbols-outlined">check</span>}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreatePackage;
