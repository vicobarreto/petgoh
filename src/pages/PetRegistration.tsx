import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../types';
import { supabase } from '../lib/supabase';

const PetRegistration: React.FC = () => {
    const navigate = useNavigate();
    const { addPet, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    // Image Upload State
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        breed: '',
        age: '',
        weight: '',
        gender: 'Macho',
        chipId: '',
        color: 'orange' // Default theme color
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `user-pets/${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('pet-photos')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('pet-photos')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao fazer upload da imagem.');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!user) {
                alert('Você precisa estar logado para cadastrar um pet.');
                navigate('/login');
                return;
            }

            let imageUrl = IMAGES.THOR_DOG; // Default image
            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const newPet = {
                owner_id: user.id,
                name: formData.name,
                breed: formData.breed,
                age: parseInt(formData.age) || 0, // Ensure integer
                weight: parseFloat(formData.weight.replace(',', '.')) || 0, // Ensure float, handle comma
                gender: formData.gender,
                chip_id: formData.chipId,
                color: formData.color,
                image_url: imageUrl, // Correct column name
            };

            const { data, error } = await supabase
                .from('pets')
                .insert([newPet])
                .select()
                .single();

            if (error) throw error;

            // Update AuthContext state
            addPet({ ...newPet, id: data.id, image: imageUrl, breed: newPet.breed || '', age: String(newPet.age), weight: String(newPet.weight), gender: (newPet.gender as "Macho" | "Fêmea") || 'Macho', color: newPet.color || 'orange', chipId: newPet.chip_id || '' });
            
            alert('Pet cadastrado com sucesso!');
            navigate('/profile?tab=pets');

        } catch (error: any) {
            console.error('Error registering pet:', error);
            const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            alert(`Erro ao cadastrar pet: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-primary to-orange-400 rounded-full flex items-center justify-center text-white shadow-lg mb-4">
                        <span className="material-symbols-outlined text-3xl">pets</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Carteirinha Digital</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Cadastre seu pet para gerar a carteira digital e acessar serviços.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div className="flex justify-center mb-4">
                        <label className="relative group cursor-pointer">
                            <div className="size-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                <img src={imagePreview || IMAGES.THOR_DOG} alt="Pet Preview" className={`w-full h-full object-cover ${!imagePreview ? 'opacity-50' : ''} group-hover:opacity-100 transition-opacity`} />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                                    <span className="material-symbols-outlined text-white p-1 rounded-full">add_a_photo</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                            />
                            <p className="text-center text-xs text-gray-500 mt-2">Adicionar Foto</p>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pet</label>
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-gray-200 focus:ring-primary focus:border-primary bg-gray-50"
                            placeholder="Ex: Thor"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                            <input
                                required
                                name="breed"
                                value={formData.breed}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border-gray-200 focus:ring-primary focus:border-primary bg-gray-50"
                                placeholder="Ex: Golden"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                            <input
                                required
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border-gray-200 focus:ring-primary focus:border-primary bg-gray-50"
                                placeholder="Ex: 3 Anos"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                            <input
                                required
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border-gray-200 focus:ring-primary focus:border-primary bg-gray-50"
                                placeholder="Ex: 12.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border-gray-200 focus:ring-primary focus:border-primary bg-gray-50"
                            >
                                <option value="Macho">Macho</option>
                                <option value="Fêmea">Fêmea</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pedigree (Opcional)</label>
                        <input
                            name="chipId"
                            value={formData.chipId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-gray-200 focus:ring-primary focus:border-primary bg-gray-50"
                            placeholder="Ex: RG/12345"
                        />
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isLoading || uploading}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-secondary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all shadow-lg ${isLoading || uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading || uploading ? 'Salvando...' : 'Criar Carteirinha'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full flex justify-center py-3 px-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Cadastrar depois
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PetRegistration;