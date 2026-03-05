import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const ImportPackages: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [jsonContent, setJsonContent] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false); // Popup state

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                setJsonContent(content);
                const parsed = JSON.parse(content);
                setParsedData(parsed);
                setError(null);
            } catch (err) {
                setError('Arquivo JSON inválido.');
                setParsedData(null);
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!parsedData || !parsedData.packages) {
            setError('JSON deve conter um array "packages".');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            for (const pkg of parsedData.packages) {
                // 1. Validate
                if (!pkg.name || !pkg.price || !pkg.items) {
                    throw new Error(`Pacote "${pkg.name || 'Sem nome'}" está incompleto.`);
                }

                // 2. Determine ID (if updating) or create new
                // For simplicity, we assume creation for now
                const { data: pkgData, error: pkgError } = await supabase
                    .from('packages')
                    .insert([
                        {
                            name: pkg.name,
                            description: pkg.description,
                            price: pkg.price,
                            image_url: pkg.image_url,
                            active: true
                        }
                    ])
                    .select()
                    .single();

                if (pkgError) throw pkgError;

                // 3. Insert Items
                const itemsToInsert = pkg.items.map((item: any) => ({
                    package_id: pkgData.id,
                    service_type: item.service_type,
                    quantity: item.quantity
                }));

                const { error: itemsError } = await supabase
                    .from('package_items')
                    .insert(itemsToInsert);
                
                if (itemsError) throw itemsError;
            }

            alert('Importação concluída com sucesso!');
            navigate('/admin/packages');

        } catch (err: any) {
            console.error('Import error:', err);
            setError('Erro na importação: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const exampleJson = `{
  "packages": [
    {
      "name": "Pacote Verão 2026",
      "description": "10 diárias de hotel com 2 banhos inclusos",
      "price": 850.00,
      "image_url": "https://example.com/image.jpg",
      "items": [
        { "service_type": "hotel", "quantity": 10 },
        { "service_type": "banho", "quantity": 2 }
      ]
    }
  ]
}`;

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Importar Pacotes em Massa</h1>
                <button 
                    onClick={() => setShowHelp(true)}
                    className="flex items-center gap-2 text-primary font-bold hover:text-orange-700 transition"
                >
                    <span className="material-symbols-outlined">help</span>
                    Como Importar?
                </button>
            </div>

            <div className="max-w-4xl bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o arquivo JSON</label>
                    <input 
                        type="file" 
                        accept=".json"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-50 file:text-primary
                        hover:file:bg-orange-100"
                    />
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                {parsedData && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Pré-visualização ({parsedData.packages?.length || 0} pacotes encontrados)</h3>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 font-mono text-xs">
                            <pre>{JSON.stringify(parsedData, null, 2)}</pre>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                    <button 
                        onClick={() => navigate('/admin/packages')}
                        className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleImport}
                        disabled={loading || !parsedData}
                        className={`px-8 py-2 font-bold rounded-xl transition-colors flex items-center gap-2 ${
                            loading || !parsedData 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-primary text-white hover:bg-orange-600'
                        }`}
                    >
                        {loading ? 'Processando...' : 'Confirmar Importação'}
                    </button>
                </div>
            </div>

            {/* Help Popup */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Estrutura do Arquivo JSON</h2>
                            <button 
                                onClick={() => setShowHelp(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <p className="text-gray-600 mb-4">
                                Para importar pacotes em massa, seu arquivo JSON deve seguir exatamente esta estrutura. 
                                Copie o exemplo abaixo e preencha com seus dados.
                            </p>
                            
                            <div className="relative">
                                <div className="absolute top-2 right-2">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(exampleJson);
                                            alert('Copiado para a área de transferência!');
                                        }}
                                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded border border-white/20 transition-colors"
                                    >
                                        Copiar
                                    </button>
                                </div>
                                <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed border border-gray-800">
                                    {exampleJson}
                                </pre>
                            </div>

                            <div className="mt-6 space-y-2">
                                <h4 className="font-bold text-gray-800">Campos Obrigatórios:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li><code className="bg-gray-100 px-1 rounded">packages</code>: Array principal de pacotes.</li>
                                    <li><code className="bg-gray-100 px-1 rounded">name</code>: Nome do pacote.</li>
                                    <li><code className="bg-gray-100 px-1 rounded">price</code>: Preço (número).</li>
                                    <li><code className="bg-gray-100 px-1 rounded">items</code>: Lista de serviços inclusos.</li>
                                    <li><code className="bg-gray-100 px-1 rounded">service_type</code>: Ex: 'hotel', 'banho', 'creche'.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={() => setShowHelp(false)}
                                className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportPackages;
