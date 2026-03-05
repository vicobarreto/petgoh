import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const RegisterPartner: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    companyName: '',
    category: '',
    cnpj: '',
    email: '',
    phone: '',
    commissionRate: '',
    status: 'active', // default
    logoUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.companyName || !formData.category) {
        throw new Error('Nome da Empresa e Categoria são obrigatórios.');
      }

      // Convert commissionRate to numeric or null
      let commission = null;
      if (formData.commissionRate) {
        commission = parseFloat(formData.commissionRate);
        if (isNaN(commission)) {
          throw new Error('Comissão deve ser um número válido.');
        }
      }

      const { error: insertError } = await supabase
        .from('partners')
        .insert([{
          company_name: formData.companyName,
          category: formData.category,
          cnpj: formData.cnpj || null,
          email: formData.email || null,
          phone: formData.phone || null,
          custom_commission_rate: commission,
          status: formData.status,
          logo_url: formData.logoUrl || null,
        }]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Success
      alert('Parceiro registrado com sucesso!');
      navigate('/admin/partners'); // Or wherever it makes sense, e.g., /login or just go back
      
    } catch (err: any) {
      console.error('Error registering partner:', err);
      setError(err.message || 'Erro ao registrar parceiro.');
    } finally {
      setLoading(false);
    }
  };

  // Convert HTML snippet to JSX, keeping exact class names and structure
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Novo Prestador</h3>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 text-sm border-b border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Logo da Empresa</label>
            <div className="flex gap-4 mb-2">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                <span className="material-symbols-outlined text-lg">cloud_upload</span>
                Upload de Imagem
                <input accept="image/*" className="hidden" type="file" disabled />
              </label>
              <div className="flex-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">link</span>
                  <input 
                    placeholder="Ou cole URL da imagem" 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-primary focus:border-primary border-gray-200" 
                    type="text" 
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="h-48 w-full bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 relative overflow-hidden">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = '')} />
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl mb-2">image</span>
                  <p className="text-sm">Nenhuma mídia selecionada</p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
              <input 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-100" 
                type="text" 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-purple-100"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="Hotel">Hotel / Hospedagem</option>
                <option value="Pet Shop">Pet Shop</option>
                <option value="Creche">Creche</option>
                <option value="Banho e Tosa">Banho e Tosa</option>
                <option value="Adestramento">Adestramento</option>
                <option value="Passeador">Passeador</option>
                <option value="Veterinário">Veterinário</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-100" 
                type="text" 
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-100" 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-100" 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
              <input 
                min="0" 
                max="100" 
                step="0.1"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-100" 
                type="number" 
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-purple-100"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-secondary rounded-xl hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
             {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Processando...
                </>
             ) : 'Cadastrar Prestador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPartner;
