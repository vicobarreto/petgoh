import React from 'react';

const TermsOfUse: React.FC = () => {
    return (
        <div className="bg-white py-12 flex-1">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-700 leading-relaxed">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Termos de Uso</h1>
                <p className="mb-4">Bem-vindo ao PetGoH. Ao utilizar nossos serviços, você concorda com os seguintes termos e condições. É importante que você leia e compreenda estes termos antes de usar nossa plataforma.</p>
                
                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Uso da Plataforma</h2>
                <p className="mb-4">A plataforma PetGoH destina-se a conectar tutores de animais de estimação a uma rede de parceiros prestadores de serviços. Você concorda em usar a plataforma apenas para fins legais e de acordo com estes termos. É proibido o uso da plataforma para qualquer atividade ilegal ou fraudulenta.</p>
                <p>Você é responsável por manter a confidencialidade de sua conta e senha e por restringir o acesso ao seu computador. Você concorda em aceitar a responsabilidade por todas as atividades que ocorram em sua conta ou senha.</p>
                
                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Pagamentos e Cancelamentos</h2>
                <p className="mb-4">O PetGoH facilita o pagamento dos serviços através de um sistema de pagamento integrado. Ao agendar um serviço, você concorda em pagar o valor total indicado. A plataforma dividirá automaticamente o pagamento entre os prestadores de serviço envolvidos. Cancelamentos podem ser feitos até 24 horas antes do horário agendado sem custo, a menos que especificado de outra forma pelo parceiro.</p>
                
                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Responsabilidades</h2>
                <p>Nossos parceiros são responsáveis pela qualidade dos serviços prestados. O PetGoH atua como intermediário, mas não se responsabiliza diretamente por danos ou problemas ocorridos durante a prestação do serviço. Encorajamos os usuários a avaliar os parceiros para ajudar a manter a qualidade da nossa rede.</p>
            </div>
        </div>
    );
};

export default TermsOfUse;