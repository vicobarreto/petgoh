export interface SearchItem {
    id: string;
    title: string;
    content: string; // Texto descritivo para match
    url: string;
    type: 'page' | 'service' | 'partner' | 'doc';
    icon: string;
    role?: 'admin';
}

export const searchIndex: SearchItem[] = [
    // Páginas Principais
    { id: 'p1', title: 'Hospedagem Pet', content: 'Hotéis, pet sitter e hospedagem domiciliar', url: '/hospedagem', type: 'page', icon: 'home' },
    { id: 'p2', title: 'Saúde & Bem-estar', content: 'Veterinários, clínicas e emergências', url: '/saude', type: 'page', icon: 'medical_services' },
    { id: 'p3', title: 'Banho & Tosa', content: 'Estética animal, grooming e spa', url: '/estetica', type: 'page', icon: 'content_cut' },
    { id: 'p4', title: 'Creche & Daycare', content: 'Escolinha para cães e socialização', url: '/creche', type: 'page', icon: 'pets' },
    { id: 'p5', title: 'Planos Prime', content: 'Clube de assinatura e descontos', url: '/planos', type: 'page', icon: 'card_membership' },
    { id: 'p6', title: 'Carteira Digital', content: 'Histórico de vacinas e documentos', url: '/carteira', type: 'page', icon: 'wallet' },
    { id: 'p7', title: 'Fidelidade', content: 'Meus pontos, recompensas e catálogo de prêmios', url: '/fidelidade', type: 'page', icon: 'loyalty' },
    { id: 'p8', title: 'Mural da Comunidade', content: 'Adoção responsável e pets perdidos', url: '/mural', type: 'page', icon: 'forum' },
    
    // Serviços Específicos (Deep Links)
    { id: 's1', title: 'Vacina V10/V8', content: 'Proteção contra cinomose e parvovirose', url: '/vacinas', type: 'service', icon: 'vaccines' },
    { id: 's2', title: 'Vacina Antirrábica', content: 'Obrigatória por lei contra raiva', url: '/vacinas', type: 'service', icon: 'healing' },
    { id: 's3', title: 'Exames de Sangue', content: 'Hemograma e check-up laboratorial', url: '/exames', type: 'service', icon: 'biotech' },
    { id: 's4', title: 'Raio-X e Imagem', content: 'Diagnóstico por imagem e ultrassom', url: '/exames', type: 'service', icon: 'radiology' },
    { id: 's5', title: 'Dermatologista', content: 'Especialista em pele e alergias', url: '/especialistas', type: 'service', icon: 'dermatology' },
    { id: 's6', title: 'Ortopedista', content: 'Especialista em ossos e articulações', url: '/especialistas', type: 'service', icon: 'orthopedics' },
    
    // Parceiros Mockados
    { id: 'pt1', title: 'Hotel PetLove', content: 'Hospedagem completa com ar condicionado', url: '/hospedagem', type: 'partner', icon: 'bed' },
    { id: 'pt2', title: 'Táxi Dog Express', content: 'Transporte especializado com segurança', url: '/home', type: 'partner', icon: 'local_taxi' },
    { id: 'pt3', title: 'Clínica VetVida', content: 'Atendimento 24h em Botafogo', url: '/agendar', type: 'partner', icon: 'local_hospital' },
    { id: 'pt4', title: 'Quintal da Alegria', content: 'Daycare com piscina e gramado', url: '/creche', type: 'partner', icon: 'sunny' },

    // Docs / Ajuda
    { id: 'd1', title: 'Como funciona o pagamento', content: 'Divisão automática de valores entre parceiros', url: '/como-funciona', type: 'doc', icon: 'payments' },
    { id: 'd2', title: 'Política de Cancelamento', content: 'Cancele até 24h antes sem custo', url: '/como-funciona', type: 'doc', icon: 'cancel' },

    // Admin Pages
    { id: 'a1', title: 'Admin: Visão Geral', content: 'Dashboard administrativo, métricas e KPIs', url: '/admin/dashboard', type: 'page', icon: 'admin_panel_settings', role: 'admin' },
    { id: 'a2', title: 'Admin: Gestão de Parceiros', content: 'Aprovar, rejeitar e gerenciar parceiros', url: '/admin/partners', type: 'page', icon: 'storefront', role: 'admin' },
    { id: 'a3', title: 'Admin: Gestão de Tutores', content: 'Visualizar clientes e seus pets', url: '/admin/tutors', type: 'page', icon: 'group', role: 'admin' },
    { id: 'a4', title: 'Admin: Financeiro', content: 'Painel financeiro, repasses e receitas', url: '/admin/financial', type: 'page', icon: 'monitoring', role: 'admin' },
    { id: 'a5', title: 'Admin: Moderação do Mural', content: 'Gerenciar posts de adoção e perdidos', url: '/admin/mural-moderation', type: 'page', icon: 'shield', role: 'admin' },
];