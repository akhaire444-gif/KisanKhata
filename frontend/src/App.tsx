import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { AboutPage, ContactPage } from './pages/public/AboutAndContact';
import { AuthModal } from './components/AuthModals';

const MainApp: React.FC = () => {
  const { currentPath, toastMessage } = useApp();
  const [authModalConfig, setAuthModalConfig] = useState<{
    isOpen: boolean;
    isRegister?: boolean;
  }>({
    isOpen: false,
    isRegister: false
  });

  const handleOpenAuthModal = (isRegister = false) => {
    setAuthModalConfig({
      isOpen: true,
      isRegister
    });
  };

  const handleCloseAuthModal = () => {
    setAuthModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const renderContent = () => {
    switch (currentPath) {
      case 'home':
      case 'dashboard':
      case 'crops':
      case 'expenses':
      case 'workers':
      case 'fertilizer':
      case 'reminders':
      case 'reports':
      case 'help':
        return <FarmerDashboard />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <FarmerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex flex-col font-sans">
      {/* Global Navigation Header */}
      <Header onOpenAuthModal={handleOpenAuthModal} />

      {/* Main Content View with top offset for fixed navbar */}
      <main className="flex-1 pt-20 w-full">
        {renderContent()}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Farmer Auth Modal */}
      {authModalConfig.isOpen && (
        <AuthModal
          initialIsRegister={authModalConfig.isRegister}
          onClose={handleCloseAuthModal}
        />
      )}

      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border bg-[#012d1d] text-white animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-[20px] text-[#a1f4c8]">
            {toastMessage.type === 'error' ? 'error' : toastMessage.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span className="text-[14px] font-semibold">{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
