import React, { useState, useEffect } from 'react';

import { supabase } from '../../lib/supabase';

type SettingsTab = 'GENERAL' | 'SOCIAL' | 'NOTIFICATIONS' | 'SECURITY';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
    
    // Mock state for demonstration - in a real app these would come from a context or DB
    const [general, setGeneral] = useState({
        siteName: 'PetGoH',
        contactEmail: 'contato@petgoh.com.br',
        contactPhone: '(21) 99999-9999',
        address: 'Rio de Janeiro, RJ'
    });
    
    const [social, setSocial] = useState({
        instagram: '@petgoh',
        facebook: '/petgoh',
        whatsapp: '(21) 99999-9999'
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        newPartnerAlert: true,
        marketingEmails: false
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .single();

            if (error) throw error;

            if (data) {
                setGeneral({
                    siteName: data.site_name || '',
                    contactEmail: data.contact_email || '',
                    contactPhone: data.contact_phone || '',
                    address: data.address || ''
                });
                setSocial({
                    instagram: data.social_instagram || '',
                    facebook: data.social_facebook || '',
                    whatsapp: data.social_whatsapp || ''
                });
                setNotifications({
                    emailAlerts: data.notifications_email ?? true,
                    newPartnerAlert: data.notifications_new_partner ?? true,
                    marketingEmails: data.notifications_marketing ?? false
                });
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                site_name: general.siteName,
                contact_email: general.contactEmail,
                contact_phone: general.contactPhone,
                address: general.address,
                social_instagram: social.instagram,
                social_facebook: social.facebook,
                social_whatsapp: social.whatsapp,
                notifications_email: notifications.emailAlerts,
                notifications_new_partner: notifications.newPartnerAlert,
                notifications_marketing: notifications.marketingEmails,
                singleton_guard: true // Ensure we target the singleton row
            };

            const { error } = await supabase
                .from('site_settings')
                .upsert(payload, { onConflict: 'singleton_guard' });

            if (error) throw error;
            alert('Configurações salvas com sucesso!');
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar configurações: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-2xl text-primary">settings</span>
                    <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
                </div>
                <p className="text-gray-500 text-sm">Gerencie as informações gerais e preferências da plataforma.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-1">
                    <button 
                        onClick={() => setActiveTab('GENERAL')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'GENERAL' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">tune</span>
                        Geral
                    </button>
                    <button 
                        onClick={() => setActiveTab('SOCIAL')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'SOCIAL' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">share</span>
                        Redes Sociais
                    </button>
                    <button 
                        onClick={() => setActiveTab('NOTIFICATIONS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'NOTIFICATIONS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        Notificações
                    </button>
                    <button 
                        onClick={() => setActiveTab('SECURITY')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'SECURITY' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">security</span>
                        Segurança
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 animate-fade-in relative overflow-hidden">
                        
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

                        {activeTab === 'GENERAL' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Informações Gerais</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Nome do Site</label>
                                        <input 
                                            type="text" 
                                            value={general.siteName} 
                                            onChange={(e) => setGeneral({...general, siteName: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Email de Contato</label>
                                        <input 
                                            type="email" 
                                            value={general.contactEmail} 
                                            onChange={(e) => setGeneral({...general, contactEmail: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                                        <input 
                                            type="text" 
                                            value={general.contactPhone} 
                                            onChange={(e) => setGeneral({...general, contactPhone: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Endereço Base</label>
                                        <input 
                                            type="text" 
                                            value={general.address} 
                                            onChange={(e) => setGeneral({...general, address: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'SOCIAL' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Redes Sociais</h2>
                                
                                <div className="max-w-xl space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 flex-shrink-0">
                                            <i className="fab fa-instagram text-xl"></i>
                                            {/* Fallback icon if fontawesome not loaded */}
                                            <span className="material-symbols-outlined">photo_camera</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Instagram</label>
                                            <input 
                                                type="text" 
                                                value={social.instagram} 
                                                onChange={(e) => setSocial({...social, instagram: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                                placeholder="@usuario"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <span className="material-symbols-outlined">public</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Facebook</label>
                                            <input 
                                                type="text" 
                                                value={social.facebook} 
                                                onChange={(e) => setSocial({...social, facebook: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                                placeholder="/pagina"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                                            <span className="material-symbols-outlined">chat</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-sm font-medium text-gray-700">WhatsApp Comercial</label>
                                            <input 
                                                type="text" 
                                                value={social.whatsapp} 
                                                onChange={(e) => setSocial({...social, whatsapp: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'NOTIFICATIONS' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Preferências de Notificação</h2>
                                
                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                        <div className="pt-0.5">
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.emailAlerts}
                                                onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <span className="block font-medium text-gray-900">Alertas por Email</span>
                                            <span className="block text-sm text-gray-500">Receber cópias de importantes no email de administração.</span>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                        <div className="pt-0.5">
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.newPartnerAlert}
                                                onChange={(e) => setNotifications({...notifications, newPartnerAlert: e.target.checked})}
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <span className="block font-medium text-gray-900">Novos Parceiros</span>
                                            <span className="block text-sm text-gray-500">Notificar quando um novo parceiro se cadastrar na plataforma.</span>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                        <div className="pt-0.5">
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.marketingEmails}
                                                onChange={(e) => setNotifications({...notifications, marketingEmails: e.target.checked})}
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <span className="block font-medium text-gray-900">Relatórios Semanais</span>
                                            <span className="block text-sm text-gray-500">Receber um resumo automático de desempenho toda segunda-feira.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'SECURITY' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Segurança e Acesso</h2>
                                
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">admin_panel_settings</span>
                                    <p className="text-gray-600 font-medium">Gerenciamento de Administradores</p>
                                    <p className="text-sm text-gray-400 mb-4">Esta funcionalidade estará disponível em breve.</p>
                                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold shadow-sm opacity-50 cursor-not-allowed">
                                        Convidar Administrador
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={handleSave}
                                disabled={saving || loading}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Salvando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">save</span>
                                        <span>Salvar Alterações</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
