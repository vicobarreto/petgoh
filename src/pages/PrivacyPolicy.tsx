import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="bg-white py-12 flex-1">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-700 leading-relaxed">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Política de Privacidade</h1>
                <p className="mb-4">Sua privacidade é importante para nós. Esta política de privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você utiliza a plataforma PetGoH.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Coleta de Informações</h2>
                <p className="mb-4">Coletamos informações que você nos fornece diretamente, como nome, e-mail, informações do seu pet e dados de pagamento. Também podemos coletar informações automaticamente, como seu endereço IP e dados de uso da plataforma, para melhorar nossos serviços.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Uso de Informações</h2>
                <p className="mb-4">Utilizamos suas informações para operar e manter a plataforma, processar transações, nos comunicar com você, personalizar sua experiência e para fins de segurança. Não compartilharemos suas informações pessoais com terceiros, exceto conforme necessário para fornecer os serviços (por exemplo, com os parceiros com os quais você agenda).</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Segurança dos Dados</h2>
                <p>Implementamos uma variedade de medidas de segurança para manter a segurança de suas informações pessoais. Suas informações são contidas em redes seguras e são acessíveis apenas por um número limitado de pessoas que têm direitos especiais de acesso a tais sistemas.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;