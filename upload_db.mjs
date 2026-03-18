import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvmcnyhqhmkauyasupjx.supabase.co';
const supabaseKey = 'sb_publishable_e_GSHEp6cYIhmo8HqHkfeg_z4YjBIA0'; // Use the publishable key or secret key if needed. Since it's RLS, we might need a service key or temporarily disable RLS, but if RLS has public insert/update, it might work. If not, wait, the publishable key might not insert. 
const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_ACCOMMODATIONS = [
  {
    name: 'Lobosfera - Escola de Comportamento Canina',
    category: 'Creche',
    description: 'Focada em comportamento, oferece creche e hospedagem com monitoramento 24h, atividades de socialização e relatórios diários para os tutores.',
    address: 'R. José Austregésilo, 179C - Arruda, Recife - PE',
    lat: -8.0268,
    lng: -34.8872,
    price: 85,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1601758174114-e711c0cbea69?auto=format&fit=crop&q=80',
    website: 'https://lobosfera.com.br'
  },
  {
    name: 'Espaço It Pet',
    category: 'Creche',
    description: 'Especializado em creche e enriquecimento ambiental, promove o bem-estar físico e mental dos cães em um ambiente seguro e estimulante.',
    address: 'R. Prof. Ageu Magalhães, 65 - Parnamirim, Recife - PE',
    lat: -8.0375,
    lng: -34.9126,
    price: 90,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80',
    website: 'https://espacoitpet.com.br'
  },
  {
    name: 'Bicho Mimado Pet Shop - Hospital 24h',
    category: 'Hotel',
    description: 'Oferece hotelzinho com dormitórios individuais, áreas externas e suporte de clínica veterinária 24 horas.',
    address: 'Av. Caxangá, 2020 - Cordeiro, Recife - PE',
    lat: -8.0494,
    lng: -34.9315,
    price: 120,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80',
    website: 'https://bichomimado.com.br'
  },
  {
    name: 'Hotel Atlante Plaza',
    category: 'Pet Friendly',
    description: 'Hotel de luxo na beira-mar de Boa Viagem. Oferece mimos para o pet e possui parceria com resorts pets próximos.',
    address: 'Av. Boa Viagem, 5426 - Boa Viagem, Recife - PE',
    lat: -8.1345,
    lng: -34.9012,
    price: 450,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80',
    website: 'https://atlanteplaza.com.br'
  },
  {
    name: 'Ibis Budget Recife Jaboatão',
    category: 'Pet Friendly',
    description: 'Opção econômica em Piedade que aceita animais de estimação (mediante taxa e regras específicas).',
    address: 'R. Cel. Francisco Galvão, 159 - Piedade, Jaboatão dos Guararapes - PE',
    lat: -8.1638,
    lng: -34.9167,
    price: 180,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c0d5b9af?auto=format&fit=crop&q=80',
    website: 'https://ibis.accor.com'
  },
  {
    name: 'Fity Hotel',
    category: 'Pet Friendly',
    description: 'Hotel moderno e descolado em Boa Viagem, conhecido por ser muito receptivo com pets de pequeno porte.',
    address: 'R. Dhalia, 67 - Boa Viagem, Recife - PE',
    lat: -8.1189,
    lng: -34.8950,
    price: 220,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80',
    website: 'https://fityhotel.com.br'
  },
  {
    name: 'Novotel Recife Marina',
    category: 'Pet Friendly',
    description: 'Hotel novo na zona portuária/centro, com infraestrutura moderna e política pet friendly.',
    address: 'R. Santa Rita, Pier 46 - São José, Recife - PE',
    lat: -8.0697,
    lng: -34.8789,
    price: 350,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542314831-c6a420828f79?auto=format&fit=crop&q=80',
    website: 'https://novotel.accor.com'
  }
];

async function run() {
  for (const item of MOCK_ACCOMMODATIONS) {
    const payload = {
        company_name: item.name,
        category: item.category,
        description: item.description,
        address: item.address,
        lat: item.lat,
        lng: item.lng,
        price: item.price,
        rating: item.rating,
        logo_url: item.image,
        website: item.website,
        status: 'active'
    };
    const { data, error } = await supabase.from('partners').insert(payload).select();
    if (error) {
        console.error('Error inserting', item.name, error.message);
    } else {
        console.log('Inserted', item.name);
    }
  }
}

run();
