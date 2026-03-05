import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const SocialPublish: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const isStory = searchParams.get('story') === 'true';

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [caption, setCaption] = useState('');
    const [publishing, setPublishing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const maxFiles = isStory ? 1 : 4;
        const newFiles = [...files, ...selected].slice(0, maxFiles);
        setFiles(newFiles);
        setPreviews(newFiles.map(f => URL.createObjectURL(f)));
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newFiles.map(f => URL.createObjectURL(f)));
    };

    const handlePublish = async () => {
        if (!user || (files.length === 0 && !caption.trim())) return;
        setPublishing(true);

        try {
            const uploadedUrls: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('wall-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('wall-images')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            if (isStory) {
                // Create story
                await supabase.from('stories').insert({
                    user_id: user.id,
                    image_url: uploadedUrls[0],
                    caption: caption || null,
                });
            } else {
                // Create post
                await supabase.from('wall_posts').insert({
                    tutor_id: user.id,
                    post_type: 'social',
                    title: caption.slice(0, 50) || 'Publicação',
                    description: caption,
                    images: uploadedUrls,
                    status: 'active',
                });
            }

            navigate('/caomunicacao');
        } catch (err: any) {
            console.error('Publish error:', err);
            alert(`Erro ao publicar: ${err.message}`);
        } finally {
            setPublishing(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="size-16 rounded-full border-2 border-gray-900 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-gray-900 text-3xl">lock</span>
                </div>
                <p className="text-[14px] font-semibold text-gray-900 mb-1">Faça login para publicar</p>
                <button onClick={() => navigate('/login')} className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold text-[13px] mt-2">
                    Fazer Login
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-full">
            {/* Header — Instagram new post style */}
            <div className="bg-white border-b border-gray-100 px-3 h-11 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="text-gray-700">
                    <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
                <h2 className="font-semibold text-[15px]">{isStory ? 'Novo Story' : 'Nova publicação'}</h2>
                <button
                    onClick={handlePublish}
                    disabled={publishing || (files.length === 0 && !caption.trim())}
                    className="text-orange-500 font-semibold text-[13px] disabled:opacity-40"
                >
                    {publishing ? 'Publicando...' : 'Compartilhar'}
                </button>
            </div>

            {/* Content */}
            <div className="px-3 pt-3">
                {/* User info */}
                <div className="flex items-center gap-2.5 mb-3">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'U')}&background=f97316&color=fff&size=32`}
                        className="size-8 rounded-full object-cover"
                        alt=""
                    />
                    <span className="font-semibold text-[13px] text-gray-900">{user.user_metadata?.full_name || 'Usuário'}</span>
                </div>

                {/* Caption */}
                <textarea
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder={isStory ? 'Adicione uma legenda ao story...' : 'Escreva uma legenda...'}
                    className="w-full border-none outline-none resize-none text-[14px] text-gray-900 placeholder-gray-400 min-h-[80px] mb-3"
                    maxLength={2200}
                />

                {/* Image previews */}
                {previews.length > 0 && (
                    <div className={`grid gap-1 mb-3 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {previews.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeFile(i)}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add photos button */}
                {files.length < (isStory ? 1 : 4) && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-200 rounded-lg py-8 flex flex-col items-center gap-2 active:border-orange-400 active:bg-orange-50/50 transition-all"
                    >
                        <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-500 text-2xl">add_photo_alternate</span>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-gray-700 text-[13px]">Adicionar fotos</p>
                            <p className="text-[11px] text-gray-400 mt-px">
                                {isStory ? 'Selecione 1 foto' : `${files.length}/4 fotos`}
                            </p>
                        </div>
                    </button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple={!isStory}
                />

                {/* Character count */}
                <div className="flex justify-end mt-2">
                    <span className={`text-[11px] ${caption.length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>
                        {caption.length}/2.200
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SocialPublish;
