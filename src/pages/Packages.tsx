import React from 'react';
import PackagesList from '../components/PackagesList';

const Packages: React.FC = () => {
    return (
        <div className="container mx-auto py-12 px-4 md:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Pacotes de Serviços</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Escolha o pacote ideal para o seu pet e garanta os melhores cuidados com preços especiais.
                </p>
            </div>
            
            <PackagesList />
        </div>
    );
};

export default Packages;
