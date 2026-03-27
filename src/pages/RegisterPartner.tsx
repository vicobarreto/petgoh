import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import MediaUploader from '../components/admin/MediaUploader';

const CATEGORIES = [
    { value: 'Hotel', label: 'Hotel / Hospedagem' },
    { value: 'Pet Shop', label: 'Pet Shop' },
    { value: 'Creche', label: 'Creche' },
    { value: 'Banho e Tosa', label: 'Banho e Tosa' },
    { value: 'Adestramento', label: 'Adestramento' },
    { value: 'Passeador', label: 'Passeador' },
    { value: 'Veterinário', label: 'Veterinário' },
    { value: 'Outros', label: 'Outros' },
];

const RegisterPartner: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        companyName: '',
        categories: [] as string[], // UI-05: multiple checkboxes
        cnpj: '',
        email: '',
        password: '', // New field for Auth SignUp
        phone: '',
        logoUrl: '',
        websiteUrl: '',       // UI-07
        instagram: '',        // UI-07
        facebook: '',         // UI-07
        whatsapp: '',
        photos: [] as string[],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingHotelPhoto, setUploadingHotelPhoto] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // UI-05: Toggle category checkbox
    const handleCategoryToggle = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat],
        }));
    };

    const handleFileUpload = async (
        file: File,
        bucket: string,
        setUrl: (url: string) => void,
        setUploading: (v: boolean) => void
    ) => {
        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            setUrl(data.publicUrl);
        } catch (err: any) {
            alert('Erro no upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFileUpload(
                e.target.files[0],
                'partner-logos',
                (url) => setFormData(prev => ({ ...prev, logoUrl: url })),
                setUploadingLogo
            );
        }
    };

    // Old single hotel photo handler removed

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.companyName) throw new Error('Nome da Empresa é obrigatório.');
            if (formData.categories.length === 0) throw new Error('Selecione pelo menos uma categoria.');

            let finalUserId = user?.id;

            if (!user) {
                if (!formData.email || !formData.password) {
                    throw new Error('Para registrar como parceiro, forneça um email e uma senha para criar sua conta.');
                }
                
                // Create auth account
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.companyName,
                            role: 'partner',
                            onboarding_completed: true // Parceiros não fazem o onboarding de tutor
                        }
                    }
                });

                if (authError) throw new Error(authError.message);
                if (!authData.user) throw new Error('Falha ao criar usuário de autenticação.');

                finalUserId = authData.user.id;
                
                // Força o cargo diretamente na users (caso a trigger demore ou falhe ao passar a meta)
                await supabase.from('users').update({ 
                    role: 'partner', 
                    onboarding_completed: true 
                }).eq('id', finalUserId);
            } else {
                // Atualiza o user atual para partner
                await supabase.from('users').update({ role: 'partner' }).eq('id', finalUserId);
            }

            const { error: insertError } = await supabase
                .from('partners')
                .insert([{
                    user_id: finalUserId,
                    company_name: formData.companyName,
                    category: formData.categories,
                    cnpj: formData.cnpj || null,
                    email: formData.email || null,
                    phone: formData.phone || null,
                    status: 'pending', // LOG-05: always start as pending, only admin can change
                    logo_url: formData.logoUrl || null,
                    website_url: formData.websiteUrl || null,
                    instagram_url: formData.instagram || null,
                    facebook_url: formData.facebook || null,
                    whatsapp: formData.whatsapp || null,
                    photos: formData.photos || [],
                }]);

            if (insertError) throw new Error(insertError.message);

            alert('Prestador registrado com sucesso! Aguarde aprovação do administrador.');
            navigate('/admin/partners');

        } catch (err: any) {
            console.error('Error registering partner:', err);
            setError(typeof err?.message === 'string' ? err.message : 'Erro ao registrar parceiro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

                <div className="p-6 space-y-6">
                    {/* Logo Upload — BUG-07 fixed: use label wrapping input for reliable file picker trigger */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Logo da Empresa</label>
                        <div className="flex gap-3 flex-wrap">
                            <label className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors cursor-pointer ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                                <span className="material-symbols-outlined text-lg">{uploadingLogo ? 'hourglass_empty' : 'cloud_upload'}</span>
                                {uploadingLogo ? 'Enviando...' : 'Upload de Logo'}
                                <input
                                    accept="image/*"
                                    className="sr-only"
                                    type="file"
                                    disabled={uploadingLogo}
                                    onChange={handleLogoChange}
                                    onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                                />
                            </label>
                            <div className="flex-1 relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">link</span>
                                <input
                                    placeholder="Ou cole URL do logo"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-primary focus:border-primary border-gray-200 outline-none"
                                    type="text"
                                    name="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        {formData.logoUrl && (
                            <div className="h-24 w-24 rounded-xl overflow-hidden border border-gray-200">
                                <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Hotel Photos — UI-07: 900x600 grid */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Fotos do Estabelecimento
                            <span className="ml-2 text-xs text-gray-400 font-normal">(adicione até 6 fotos, recomendado 900x600px)</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Array.from({ length: 6 }).map((_, idx) => {
                                const photoUrl = formData.photos[idx];
                                return (
                                    <div key={idx} className="aspect-[3/2] relative group bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors flex items-center justify-center">
                                        {photoUrl ? (
                                            <>
                                                <img src={photoUrl} alt="Foto estabelecimento" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const newPhotos = [...formData.photos];
                                                            newPhotos.splice(idx, 1);
                                                            setFormData(prev => ({ ...prev, photos: newPhotos }));
                                                        }}
                                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full p-2">
                                                <MediaUploader
                                                    bucket="partner-photos"
                                                    label="Adicionar Foto"
                                                    currentUrl=""
                                                    onUpload={(url) => {
                                                        const newPhotos = [...formData.photos];
                                                        newPhotos[idx] = url;
                                                        // compact array to remove empty slots in the middle if desired, 
                                                        // but keeping slots mapped directly is fine.
                                                        setFormData(prev => ({ ...prev, photos: newPhotos.filter(Boolean) }));
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
                            <input
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* UI-05: Checkboxes for category */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categorias * <span className="text-xs text-gray-400 font-normal">(selecione todas que se aplicam)</span></label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map(cat => (
                                    <label key={cat.value} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                                        formData.categories.includes(cat.value)
                                            ? 'bg-primary/5 border-primary text-primary'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={formData.categories.includes(cat.value)}
                                            onChange={() => handleCategoryToggle(cat.value)}
                                        />
                                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                            formData.categories.includes(cat.value) ? 'bg-primary border-primary' : 'border-gray-300'
                                        }`}>
                                            {formData.categories.includes(cat.value) && (
                                                <span className="material-symbols-outlined text-white text-[12px]">check</span>
                                            )}
                                        </span>
                                        <span className="text-sm font-medium">{cat.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                            <input
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                type="text"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleChange}
                                placeholder="00.000.000/0001-00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required={!user}
                            />
                        </div>
                        {!user && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Senha * <span className="text-xs text-gray-400 font-normal">(para acessar seu painel)</span></label>
                                <input
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* UI-07: Website URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Site / URL</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">language</span>
                                <input
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    type="url"
                                    name="websiteUrl"
                                    value={formData.websiteUrl}
                                    onChange={handleChange}
                                    placeholder="https://www.seusite.com.br"
                                />
                            </div>
                        </div>

                        {/* UI-07: Instagram */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">@</span>
                                <input
                                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="seuperfil"
                                />
                            </div>
                        </div>

                        {/* UI-07: Facebook */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">@</span>
                                <input
                                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    type="text"
                                    name="facebook"
                                    value={formData.facebook}
                                    onChange={handleChange}
                                    placeholder="suapagina"
                                />
                            </div>
                        </div>
                        
                        {/* WhatsApp */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                                    <span className="material-symbols-outlined text-[16px]">chat</span>
                                </span>
                                <input
                                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    type="text"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </div>
                    </div>

                    {/* LOG-05: Status info — read only, always starts as pending */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-500 shrink-0">info</span>
                        <p className="text-sm text-amber-700">
                            Seu cadastro ficará com status <strong>Pendente</strong> até ser aprovado pelo administrador PetGoH.
                            Você receberá uma notificação por email.
                        </p>
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
