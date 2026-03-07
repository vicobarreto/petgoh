import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { FavoritesProvider } from './context/FavoritesContext';
import Home from './pages/Home';
import PackageDetails from './pages/PackageDetails';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import PartnerDashboard from './pages/PartnerDashboard';
import PackageBooking from './pages/PackageBooking';
import PartnerPortal from './pages/PartnerPortal';
import Hospedagem from './pages/Hospedagem';
import Saude from './pages/Saude';
import Estetica from './pages/Estetica';
import Creche from './pages/Creche';
import Planos from './pages/Planos';
import ComoFunciona from './pages/ComoFunciona';
import AgendarConsulta from './pages/AgendarConsulta';
import Vacinas from './pages/Vacinas';
import Exames from './pages/Exames';
import Especialistas from './pages/Especialistas';
import AgendarHorario from './pages/AgendarHorario';
import Carteira from './pages/Carteira';
// FIX: The module 'pages/UserProfile' has no default export. Changed to named import. This will be fixed by adding a default export in the UserProfile.tsx file.
import UserProfile from './pages/UserProfile';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Favorites from './pages/Favorites';
// New Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterPartner from './pages/RegisterPartner';
import Packages from './pages/Packages';
import UserPackages from './pages/UserPackages';
import ForgotPassword from './pages/ForgotPassword';
import PetRegistration from './pages/PetRegistration';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
// Notification Pages
import Notifications from './pages/Notifications';
import NotificationOnboarding from './pages/NotificationOnboarding';
import NotificationSettings from './pages/NotificationSettings';
// Legal Pages
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
// Admin Pages & Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PartnerRoute from './components/PartnerRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import PartnerManagement from './pages/admin/PartnerManagement';
import TutorManagement from './pages/admin/TutorManagement';
import PackageManagement from './pages/admin/PackageManagement';
import PromotionManagement from './pages/admin/PromotionManagement';
import GiveawayManagement from './pages/admin/GiveawayManagement';
import FinancialDashboard from './pages/admin/FinancialDashboard';
import MuralModeration from './pages/admin/MuralModeration';
import CreatePackage from './pages/admin/CreatePackage';
import ImportPackages from './pages/admin/ImportPackages';
import VetManagement from './pages/admin/VetManagement';
import ProviderManagement from './pages/admin/ProviderManagement';
import HealthServiceManagement from './pages/admin/HealthServiceManagement';
import BeautyServiceManagement from './pages/admin/BeautyServiceManagement';
import Settings from './pages/admin/Settings';
// New Feature Pages
import Loyalty from './pages/Loyalty';
import RedeemReward from './pages/RedeemReward';
import CommunityWall from './pages/CommunityWall';
import AdoptionPostForm from './pages/AdoptionPostForm';
import PetAdoptionDetail from './pages/PetAdoptionDetail';
import AdoptionApplicationForm from './pages/AdoptionApplicationForm';
import AdoptionApplicationSuccess from './pages/AdoptionApplicationSuccess';
import ReportLostPet from './pages/ReportLostPet';
import SubmitPetInfo from './pages/SubmitPetInfo';
import Inbox from './pages/Inbox';
import LostPetChat from './pages/LostPetChat';
// Social Network Pages
import SocialLayout from './pages/social/SocialLayout';
import SocialFeed from './pages/social/SocialFeed';
import SocialPublish from './pages/social/SocialPublish';
import SocialProfile from './pages/social/SocialProfile';
import SocialMessages from './pages/social/SocialMessages';
import SocialChat from './pages/social/SocialChat';
import SocialSearch from './pages/social/SocialSearch';
import SocialPostDetail from './pages/social/SocialPostDetail';


import Header from './components/Header';
import Footer from './components/Footer';
import GlobalSearch from './components/GlobalSearch';

// A wrapper to handle header/footer visibility
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isCheckout = location.pathname.startsWith('/checkout');
  const isPartnerDashboard = location.pathname.startsWith('/partner/dashboard');
  const isAuthPage = ['/login', '/register', '/register-pet', '/register-partner', '/forgot-password', '/reset-password', '/partner'].includes(location.pathname);
  const isAdminSection = location.pathname.startsWith('/admin');
  
  const isFullScreenPage = [
      '/mensagens',
      '/caomunicacao',
      '/formulario',
      '/sucesso',
      '/informar',
      '/reportar-perdido'
  ].some(path => location.pathname.includes(path));


  // Hide main Header and Footer on specific sections
  const showHeader = !isAuthPage && !isAdminSection && !isFullScreenPage;
  const showFooter = !isCheckout && !isPartnerDashboard && !isAuthPage && !isAdminSection && !isFullScreenPage;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-light">
      {showHeader && <GlobalSearch />}
      
      {showHeader && <Header simple={isCheckout} />}

      <main className={`flex-1 flex flex-col w-full ${showHeader ? 'pt-[68px]' : ''}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};



const App: React.FC = () => {
  return (
    <AuthProvider>
      <FavoritesProvider>
      <Router>

        <Routes>
          {/* Public & User Routes with Main Layout */}
          {/* Public & User Routes with Main Layout */}
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<Home />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/meus-pacotes" element={<UserPackages />} />
            <Route path="/package/:id" element={<PackageDetails />} />
            <Route path="/package/:id/booking" element={<PackageBooking />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/orders" element={<MyOrders />} />
          </Route>

          {/* Partner Routes */}
          <Route path="/partner" element={<PartnerPortal />} />
          <Route element={<PartnerRoute />}>
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
          </Route>

          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/hospedagem" element={<Hospedagem />} />
            <Route path="/saude" element={<Saude />} />
            <Route path="/estetica" element={<Estetica />} />
            <Route path="/creche" element={<Creche />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            
            <Route path="/agendar" element={<AgendarConsulta />} />
            <Route path="/vacinas" element={<Vacinas />} />
            <Route path="/exames" element={<Exames />} />
            <Route path="/especialistas" element={<Especialistas />} />
            <Route path="/agendar-horario" element={<AgendarHorario />} />
            <Route path="/carteira" element={<Carteira />} />
            
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/favorites" element={<Favorites />} />
            
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notifications/onboarding" element={<NotificationOnboarding />} />
            <Route path="/notifications/settings" element={<NotificationSettings />} />

            <Route path="/termos" element={<TermsOfUse />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiesPolicy />} />

            {/* New Feature Routes */}
            <Route path="/fidelidade" element={<Loyalty />} />
            <Route path="/resgatar/:id" element={<RedeemReward />} />
            
            {/* Community Wall */}
            <Route path="/mural" element={<CommunityWall />} />
            <Route path="/mural/postar-adocao" element={<AdoptionPostForm />} />
            <Route path="/mural/adocao/:petId" element={<PetAdoptionDetail />} />
            <Route path="/mural/adocao/:petId/formulario" element={<AdoptionApplicationForm />} />
            <Route path="/mural/adocao/sucesso" element={<AdoptionApplicationSuccess />} />
            <Route path="/mural/perdido/:petId/informar" element={<SubmitPetInfo />} />
            <Route path="/mural/reportar-perdido" element={<ReportLostPet />} />

            {/* Messaging */}
            <Route path="/mensagens" element={<Inbox />} />
            <Route path="/mensagens/:chatId" element={<LostPetChat />} />
          </Route>

          {/* Social Network (Cão-municação) Routes with SocialLayout */}
          <Route path="/caomunicacao" element={<SocialLayout />}>
            <Route index element={<SocialFeed />} />
            <Route path="buscar" element={<SocialSearch />} />
            <Route path="publicar" element={<SocialPublish />} />
            <Route path="mensagens" element={<SocialMessages />} />
            <Route path="mensagens/:conversationId" element={<SocialChat />} />
            <Route path="meu-perfil" element={<SocialProfile />} />
            <Route path="perfil/:userId" element={<SocialProfile />} />
            <Route path="post/:postId" element={<SocialPostDetail />} />
          </Route>

          {/* Auth Routes without Main Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-partner" element={<RegisterPartner />} />
          <Route path="/register-pet" element={<PetRegistration />} />
          <Route path="/register-pet" element={<PetRegistration />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* FIX: Refactored admin routes to use AdminLayout as a proper layout route. 
              This fixes the error "Type '{ children: Element; }' has no properties in common with type 'IntrinsicAttributes'." 
              because AdminLayout uses <Outlet /> and shouldn't be passed children directly. */}
          {/* Admin Routes with Protection */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="partners" element={<PartnerManagement />} />
              <Route path="tutors" element={<TutorManagement />} />
              <Route path="packages" element={<PackageManagement />} />
              <Route path="packages/create" element={<CreatePackage />} />
              <Route path="packages/import" element={<ImportPackages />} />
              <Route path="promotions" element={<PromotionManagement />} />

              <Route path="giveaways" element={<GiveawayManagement />} />
              <Route path="financial" element={<FinancialDashboard />} />
              <Route path="mural-moderation" element={<MuralModeration />} />
              <Route path="vets" element={<VetManagement />} />
              <Route path="vets" element={<VetManagement />} />
              <Route path="providers" element={<ProviderManagement />} /> {/* Geral */}
              <Route path="hotels" element={<ProviderManagement title="Gestão de Hotéis" forcedCategory="Hotel" />} />
              <Route path="petshops" element={<ProviderManagement title="Gestão de Pet Shops" forcedCategory="Pet Shop" />} />
              <Route path="daycare" element={<ProviderManagement title="Gestão de Creches" forcedCategory="Creche" />} />
              <Route path="grooming" element={<ProviderManagement title="Gestão de Banho e Tosa" forcedCategory="Banho e Tosa" />} />
              <Route path="trainers" element={<ProviderManagement title="Gestão de Adestradores" forcedCategory="Adestramento" />} />
              <Route path="walkers" element={<ProviderManagement title="Gestão de Passeadores" forcedCategory="Passeador" />} />
              <Route path="others" element={<ProviderManagement title="Gestão de Outros Parceiros" forcedCategory="Outros" />} />
              <Route path="health-services" element={<HealthServiceManagement />} />
              <Route path="beauty-services" element={<BeautyServiceManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>

      </Router>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;