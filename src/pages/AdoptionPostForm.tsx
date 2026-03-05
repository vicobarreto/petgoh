import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const AdoptionPostForm: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        breed: '',
        age: '',
        gender: 'Macho',
        size: 'Médio',
        weight: '',
        location: '',
        story: '',
        main_image: '',
        gallery: [] as string[],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (file: File) => {
        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `adoption/${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('pet-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('pet-photos')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            navigate('/login');
            return;
        }

        if (!imageFile && !formData.main_image) {
            alert('Por favor, adicione uma foto do pet.');
            return;
        }

        setLoading(true);

        try {
            let imageUrl = formData.main_image;
            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile);
                if (!uploadedUrl) {
                    setLoading(false);
                    return;
                }
                imageUrl = uploadedUrl;
            }

            const { error } = await supabase
                .from('adoption_pets')
                .insert([{
                    ...formData,
                    main_image: imageUrl,
                    owner_id: user.id,
                    status: 'available',
                    gallery: [imageUrl],
                }]);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => navigate('/mural'), 2500);
        } catch (error) {
            console.error('Erro ao cadastrar pet:', error);
            alert('Erro ao cadastrar pet. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet cadastrado!</h2>
                    <p className="text-gray-500 mb-6">Seu anúncio de adoção já está visível no mural da comunidade.</p>
                    <div className="w-12 h-1 bg-orange-400 rounded-full mx-auto animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <button onClick={() => navigate('/mural')} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        <span className="text-sm font-medium hidden sm:inline">Voltar</span>
                    </button>
                    <h1 className="font-bold text-gray-900">Cadastrar Pet</h1>
                    <div className="w-16" />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Hero card */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-orange-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">pets</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Encontre um lar</h2>
                            <p className="text-white/80 text-sm">Preencha os dados para criar o anúncio</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo Upload */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-orange-500">add_a_photo</span>
                            <span className="font-semibold text-gray-900 text-sm">Foto do Pet *</span>
                        </div>
                        <div className="p-5">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-orange-300 hover:bg-orange-50/30"
                            >
                                {imagePreview ? (
                                    <div className="relative">
                                        <img src={imagePreview} alt="Preview" className="w-full aspect-[4/3] object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white/90 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-700">swap_horiz</span>
                                                <span className="text-sm font-semibold text-gray-700">Trocar foto</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-14 flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                            <span className="material-symbols-outlined text-orange-400 text-3xl">add_a_photo</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-gray-700 text-sm">Clique para adicionar uma foto</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG ou GIF • Máximo 5MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-orange-500">info</span>
                            <span className="font-semibold text-gray-900 text-sm">Informações Básicas</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome do Pet *</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                        placeholder="Ex: Rex"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Raça *</label>
                                    <input type="text" name="breed" required value={formData.breed} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                        placeholder="Ex: Vira-lata"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Idade *</label>
                                    <input type="text" name="age" required value={formData.age} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                        placeholder="2 anos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sexo</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all appearance-none"
                                    >
                                        <option value="Macho">Macho</option>
                                        <option value="Fêmea">Fêmea</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Porte</label>
                                    <select name="size" value={formData.size} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all appearance-none"
                                    >
                                        <option value="Pequeno">Pequeno</option>
                                        <option value="Médio">Médio</option>
                                        <option value="Grande">Grande</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Peso Aproximado *</label>
                                    <input type="text" name="weight" required value={formData.weight} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                        placeholder="Ex: 12kg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Localização *</label>
                                    <input type="text" name="location" required value={formData.location} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                        placeholder="São Paulo, SP"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Story */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-orange-500">auto_stories</span>
                            <span className="font-semibold text-gray-900 text-sm">História do Pet</span>
                        </div>
                        <div className="p-5">
                            <textarea name="story" rows={4} required value={formData.story} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all resize-none"
                                placeholder="Conte um pouco sobre a personalidade, história e necessidades do pet..."
                            />
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">tips_and_updates</span>
                                Uma boa descrição aumenta as chances de adoção
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2 pb-8">
                        <button type="button" onClick={() => navigate('/mural')}
                            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading || uploading}
                            className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading || uploading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
                            ) : (
                                <><span className="material-symbols-outlined text-lg">publish</span> Publicar no Mural</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdoptionPostForm;
