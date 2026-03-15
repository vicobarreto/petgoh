import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const ReportLostPet: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        pet_name: '',
        species: 'Cachorro',
        breed: '',
        last_seen_location: '',
        date_lost: '',
        time_lost: '',
        description: '',
        contact_info: '',
        reward: '',
        consent: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
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
            const filePath = `lost-pets/${user?.id}/${fileName}`;

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

        if (!formData.pet_name || !formData.last_seen_location || !formData.date_lost || !formData.contact_info) {
            alert('Por favor, preencha os campos obrigatórios.');
            return;
        }

        setLoading(true);

        try {
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
                if (!imageUrl) {
                    setLoading(false);
                    return;
                }
            }

            const { error } = await supabase
                .from('lost_pets')
                .insert([{
                    user_id: user.id,
                    pet_name: formData.pet_name,
                    last_seen_date: formData.date_lost,
                    last_seen_location: formData.last_seen_location,
                    description: [
                        formData.description,
                        `Espécie/Raça: ${formData.species} ${formData.breed ? '- ' + formData.breed : ''}`,
                        formData.time_lost ? `Horário visto: ${formData.time_lost}` : '',
                        formData.reward ? `Recompensa: ${formData.reward}` : ''
                    ].filter(Boolean).join(' | '),
                    contact_info: formData.contact_info,
                    image_url: imageUrl,
                    status: 'lost',
                }]);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => navigate('/mural'), 2500);
        } catch (error) {
            console.error('Error creating alert:', error);
            alert('Erro ao criar alerta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Alerta criado!</h2>
                    <p className="text-gray-500 mb-6">Seu alerta de desaparecimento está visível para toda a comunidade.</p>
                    <div className="w-12 h-1 bg-red-400 rounded-full mx-auto animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <button onClick={() => navigate('/mural')} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        <span className="text-sm font-medium hidden sm:inline">Voltar</span>
                    </button>
                    <h1 className="font-bold text-gray-900">Reportar Desaparecimento</h1>
                    <div className="w-16" />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Alert hero */}
                <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-red-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">campaign</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Ajude a encontrar</h2>
                            <p className="text-white/80 text-sm">Um alerta será criado para toda a comunidade</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo Upload */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-red-500">add_a_photo</span>
                            <span className="font-semibold text-gray-900 text-sm">Foto do Pet</span>
                            <span className="text-xs text-gray-400 ml-auto">Ajuda no reconhecimento</span>
                        </div>
                        <div className="p-5">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-red-300 hover:bg-red-50/30"
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
                                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                            <span className="material-symbols-outlined text-red-400 text-3xl">add_a_photo</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-gray-700 text-sm">Adicionar foto do pet</p>
                                            <p className="text-xs text-gray-400 mt-1">Uma foto nítida aumenta 80% as chances</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                    </div>

                    {/* Pet identification */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-red-500">pets</span>
                            <span className="font-semibold text-gray-900 text-sm">Quem estamos procurando?</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome do Pet *</label>
                                    <input type="text" name="pet_name" required value={formData.pet_name} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
                                        placeholder="Ex: Rex"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Espécie</label>
                                    <select name="species" value={formData.species} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all appearance-none"
                                    >
                                        <option value="Cachorro">Cachorro</option>
                                        <option value="Gato">Gato</option>
                                        <option value="Pássaro">Pássaro</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Raça (Opcional)</label>
                                <input type="text" name="breed" value={formData.breed} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
                                    placeholder="Ex: Golden Retriever, SRD..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location & Time */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-red-500">location_on</span>
                            <span className="font-semibold text-gray-900 text-sm">Onde e quando?</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Última localização *</label>
                                <input type="text" name="last_seen_location" required value={formData.last_seen_location} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
                                    placeholder="Rua, Bairro, Cidade"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data *</label>
                                    <input type="date" name="date_lost" required value={formData.date_lost} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Horário Aprox.</label>
                                    <input type="time" name="time_lost" value={formData.time_lost} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details & Contact */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-red-500">description</span>
                            <span className="font-semibold text-gray-900 text-sm">Detalhes e Contato</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
                                <textarea name="description" rows={3} value={formData.description} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all resize-none"
                                    placeholder="Coleira, manchas, comportamento, detalhes que ajudem na identificação..."
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp / Telefone *</label>
                                    <input type="text" name="contact_info" required value={formData.contact_info} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Recompensa (Opcional)</label>
                                    <input type="text" name="reward" value={formData.reward} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
                                        placeholder="Ex: R$ 500"
                                    />
                                </div>
                            </div>

                            {/* Consent */}
                            <label className="flex items-start gap-3 mt-2 cursor-pointer group">
                                <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange}
                                    className="mt-0.5 h-5 w-5 rounded border-gray-300 text-red-500 focus:ring-red-300"
                                />
                                <span className="text-sm text-gray-600 leading-snug group-hover:text-gray-900 transition-colors">
                                    Concordo em divulgar meus dados de contato para quem encontrar o pet.
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2 pb-8">
                        <button type="button" onClick={() => navigate('/mural')}
                            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading || uploading || !formData.consent}
                            className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading || uploading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
                            ) : (
                                <><span className="material-symbols-outlined text-lg">campaign</span> Publicar Alerta</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportLostPet;