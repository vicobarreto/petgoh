import React from 'react';

const CookiesPolicy: React.FC = () => {
    return (
        <div className="bg-white py-12 flex-1">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-700 leading-relaxed">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Política de Cookies</h1>
                <p className="mb-4">Utilizamos cookies para melhorar sua experiência em nossa plataforma. Esta política explica o que são cookies e como os usamos para aprimorar os serviços do PetGoH.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">O que são Cookies?</h2>
                <p className="mb-4">Cookies são pequenos arquivos de texto que são armazenados no seu navegador ou dispositivo por sites, aplicativos, mídias online e anúncios. Eles são usados para lembrar suas preferências e configurações, ajudando a criar uma experiência mais personalizada e eficiente.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Como Usamos Cookies</h2>
                <p className="mb-4">Usamos cookies para várias finalidades, como: autenticar usuários, lembrar preferências do usuário, determinar a popularidade do conteúdo, analisar o tráfego e as tendências do site e, em geral, entender os comportamentos e interesses online das pessoas que interagem com nossos serviços.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Gerenciando Cookies</h2>
                <p>A maioria dos navegadores da web está configurada para aceitar cookies por padrão. Se preferir, você geralmente pode optar por configurar seu navegador para remover ou rejeitar os cookies do navegador. Para fazer isso, siga as instruções fornecidas pelo seu navegador, que geralmente estão localizadas no menu "Ajuda" ou "Preferências".</p>
            </div>
        </div>
    );
};

export default CookiesPolicy;