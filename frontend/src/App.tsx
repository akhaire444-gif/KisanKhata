import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { AboutPage, ContactPage } from './pages/public/AboutAndContact';
import { AuthModal, CompleteProfileModal } from './components/AuthModals';
import { WaterLoader } from './components/WaterLoader';
import { NavigationPath } from './types';

const PUBLIC_PATHS: NavigationPath[] = ['home', 'about', 'contact'];

const MainApp: React.FC = () => {
  const {
    currentPath,
    setCurrentPath,
    currentFarmer,
    isAuthChecking,
    toastMessage,
    showToast,
    refreshData,
    isProfileModalOpen,
    setIsProfileModalOpen
  } = useApp();

  const [authModalConfig, setAuthModalConfig] = useState<{
    isOpen: boolean;
    isRegister?: boolean;
  }>({
    isOpen: false,
    isRegister: false
  });

  // Preserve intended destination when unauthenticated user hits a protected route
  const intendedDestinationRef = useRef<NavigationPath | null>(null);

  const handleOpenAuthModal = (isRegister = false) => {
    setAuthModalConfig({
      isOpen: true,
      isRegister
    });
  };

  const handleCloseAuthModal = () => {
    setAuthModalConfig(prev => ({ ...prev, isOpen: false }));
    // If user cancelled login and is still not authenticated on a protected route, send to public home
    if (!currentFarmer && !PUBLIC_PATHS.includes(currentPath)) {
      setCurrentPath('home');
    }
  };

  const handleAuthSuccess = () => {
    const target = intendedDestinationRef.current || 'dashboard';
    intendedDestinationRef.current = null;
    setCurrentPath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Centralized Authentication Guard Effect
  useEffect(() => {
    if (isAuthChecking) return;

    const isProtected = !PUBLIC_PATHS.includes(currentPath);
    if (isProtected && !currentFarmer) {
      // Intercept and redirect to login
      intendedDestinationRef.current = currentPath;
      handleOpenAuthModal(false);
      showToast('Please sign in to access your farm records', 'info');
    }
  }, [currentPath, currentFarmer, isAuthChecking, showToast]);

  const renderContent = () => {
    // 1. Initial authentication verification spinner
    if (isAuthChecking) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <WaterLoader label="Verifying secure farm session..." size="md" />
        </div>
      );
    }

    // 2. Unauthenticated visitor handling
    if (!currentFarmer) {
      switch (currentPath) {
        case 'about':
          return <AboutPage />;
        case 'contact':
          return <ContactPage />;
        case 'home':
        default:
          return <HomePage onOpenAuthModal={handleOpenAuthModal} />;
      }
    }

    // 3. Authenticated farmer handling
    switch (currentPath) {
      case 'home':
        return <HomePage onOpenAuthModal={handleOpenAuthModal} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'dashboard':
      case 'crops':
      case 'expenses':
      case 'workers':
      case 'fertilizer':
      case 'reminders':
      case 'reports':
      case 'help':
      default:
        return <FarmerDashboard />;
    }
  };

  return (
    <div className="min-h-screen text-[#111c2d] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#a1f4c8] selection:text-[#012d1d]">
      {/* Living Water Fixed Layered Background ("Clear Water on a Green Field") */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-gradient-to-br from-[#eaf6f0] via-[#e3f1f4] to-[#f4f8ff]" aria-hidden="true">
        {/* Subtle Living Water Caustic Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-multiply"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="water-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
          </filter>
          <rect width="100%" height="100%" fill="none" stroke="#116c4a" strokeWidth="1.5" strokeDasharray="6 14" filter="url(#water-filter)" />
        </svg>

        {/* 4 Drifting Blurred Living Water & Light Orbs */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#a1f4c8]/45 via-[#8fe3d9]/35 to-transparent blur-[100px] animate-orb-1" />
        <div className="absolute top-1/4 -right-32 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-[#8fe3d9]/40 via-[#c1ecd4]/30 to-transparent blur-[110px] animate-orb-2" />
        <div className="absolute top-2/3 left-1/4 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-[#ffdcc3]/35 via-[#a1f4c8]/25 to-transparent blur-[115px] animate-orb-3" />
        <div className="absolute -bottom-32 right-1/4 w-[460px] h-[460px] rounded-full bg-gradient-to-tl from-[#c1ecd4]/40 via-[#8fe3d9]/25 to-transparent blur-[105px] animate-orb-4" />
      </div>

      {/* Global Navigation Header */}
      <Header onOpenAuthModal={handleOpenAuthModal} />

      {/* Main Content View with top offset for fixed navbar */}
      <main className="flex-1 pt-20 w-full relative z-0">
        {renderContent()}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Farmer Auth Modal */}
      {authModalConfig.isOpen && (
        <AuthModal
          initialIsRegister={authModalConfig.isRegister}
          onClose={handleCloseAuthModal}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Profile Completion Modal for Google / Incomplete Users */}
      {isProfileModalOpen && (
        <CompleteProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-[0_12px_36px_rgba(1,45,29,0.28)] border border-[#a1f4c8]/30 bg-[#012d1d]/90 backdrop-blur-xl text-white transition-all animate-bounce duration-500">
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
