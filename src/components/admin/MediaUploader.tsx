import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface MediaUploaderProps {
    bucket: string;
    onUpload: (url: string, type: 'image' | 'video') => void;
    currentUrl?: string;
    currentType?: 'image' | 'video';
    label?: string;
    accept?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
    bucket, 
    onUpload, 
    currentUrl, 
    currentType = 'image', 
    label = 'Carregar Imagem',
    accept = 'image/*'
}) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);
    const [mediaType, setMediaType] = useState<'image' | 'video'>(currentType);
    const [videoUrlInput, setVideoUrlInput] = useState('');

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            
            setPreviewUrl(data.publicUrl);
            setMediaType('image');
            onUpload(data.publicUrl, 'image');
        } catch (error) {
            console.error('Error uploading media:', error);
            alert('Erro ao fazer upload da mídia.');
        } finally {
            setUploading(false);
        }
    };

    const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setVideoUrlInput(url);
        
        // Simple validation or transformation if needed
        if (url) {
            setPreviewUrl(url);
            setMediaType('video');
            onUpload(url, 'video');
        }
    };

    const clearMedia = () => {
        setPreviewUrl(undefined);
        setVideoUrlInput('');
        onUpload('', 'image'); // Reset
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            
            {/* Upload Options Tabs */}
            <div className="flex gap-4 mb-2">
                 <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                    <span className="material-symbols-outlined text-lg">cloud_upload</span>
                    Upload de Imagem
                    <input 
                        type="file" 
                        accept={accept} 
                        onChange={handleFileUpload} 
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
                <div className="flex-1">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">link</span>
                        <input
                            type="text"
                            placeholder="Ou cole URL de vídeo (YouTube/Vimeo)"
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-primary focus:border-primary"
                            value={videoUrlInput}
                            onChange={handleVideoUrlChange}
                        />
                    </div>
                </div>
            </div>

            {/* Preview Area */}
            {uploading ? (
                <div className="h-48 w-full bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : previewUrl ? (
                <div className="relative group">
                    <div className="h-48 w-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                        {mediaType === 'image' ? (
                            <img src={previewUrl} alt="Preview" className="h-full object-contain" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-4xl mb-2">play_circle</span>
                                <p className="text-xs">Vídeo Externo</p>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={clearMedia}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                        title="Remover Mídia"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                        {mediaType === 'image' ? 'Imagem' : 'Vídeo'}
                    </div>
                </div>
            ) : (
                <div className="h-48 w-full bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">image</span>
                    <p className="text-sm">Nenhuma mídia selecionada</p>
                </div>
            )}
        </div>
    );
};

export default MediaUploader;
