import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { AboutPage, ContactPage } from './pages/public/AboutAndContact';
import { AuthModal } from './components/AuthModals';
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
    refreshData
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-[#116c4a]/20 border-t-[#116c4a] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#414844]">Verifying secure session...</p>
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
    <div className="min-h-screen bg-[#f7f9fd] text-[#111c2d] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#a1f4c8] selection:text-[#012d1d]">
      {/* macOS Ambient Mesh Glows (Provides refraction substrate for liquid glass) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-200/40 via-teal-100/30 to-transparent blur-[110px]" />
        <div className="absolute top-1/4 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-bl from-blue-100/40 via-emerald-100/30 to-transparent blur-[120px]" />
        <div className="absolute top-2/3 left-1/4 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-amber-100/25 via-emerald-100/20 to-transparent blur-[120px]" />
        <div className="absolute -bottom-32 right-1/4 w-[380px] h-[380px] rounded-full bg-gradient-to-tl from-teal-100/35 to-transparent blur-[100px]" />
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

      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.22)] border border-white/20 bg-[#012d1d]/90 backdrop-blur-xl text-white animate-in slide-in-from-bottom-3 transition-all">
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
