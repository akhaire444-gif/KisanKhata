import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavigationPath } from '../types';
import { KisanKhataLogo } from './KisanKhataLogo';
import { api } from '../api/client';

export const Header: React.FC<{ onOpenAuthModal: (isRegister?: boolean) => void }> = ({ onOpenAuthModal }) => {
  const {
    currentPath,
    setCurrentPath,
    currentFarmer,
    logoutFarmer,
    todayReminders,
    backendStatus
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGoogleQuickAuth = () => {
    window.location.href = api.auth.getGoogleAuthUrl('FARMER');
  };

  const authenticatedNavItems: { label: string; path: NavigationPath }[] = [
    { label: '📊 Dashboard', path: 'dashboard' },
    { label: '📋 Expenses Khata', path: 'expenses' },
    { label: '🌱 Crops', path: 'crops' },
    { label: '👥 Worker Wages', path: 'workers' },
    { label: '🧪 Sprays & Fert', path: 'fertilizer' },
    { label: '🔔 Reminders', path: 'reminders' },
    { label: '📄 Print Report', path: 'reports' },
    { label: '❓ Help', path: 'help' },
  ];

  const publicNavItems: { label: string; path: NavigationPath }[] = [
    { label: 'Home', path: 'home' },
    { label: 'About Platform', path: 'about' },
    { label: 'Contact & Support', path: 'contact' },
  ];

  const handleNavClick = (path: NavigationPath) => {
    setCurrentPath(path);
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = currentFarmer ? authenticatedNavItems : publicNavItems;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/75 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white/75 transition-all">
      <div className="h-20 w-full px-4 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Tenant ID */}
        <div className="flex items-center gap-3 lg:gap-4">
          <KisanKhataLogo
            size="md"
            showTagline={true}
            onClick={() => handleNavClick('home')}
          />

          {/* Backend Connection Badge */}
          <div
            title={
              backendStatus === 'connected'
                ? 'Spring Boot 3.4 Backend is live and connected'
                : backendStatus === 'checking'
                  ? 'Connecting to backend...'
                  : 'Backend is offline'
            }
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all border backdrop-blur-md shadow-2xs ${
              backendStatus === 'connected'
                ? 'bg-[#1b4332]/10 text-[#116c4a] border-emerald-500/25'
                : backendStatus === 'checking'
                  ? 'bg-amber-500/10 text-amber-800 border-amber-300/40'
                  : 'bg-red-500/10 text-red-800 border-red-300/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected'
                  ? 'bg-[#116c4a] animate-pulse'
                  : backendStatus === 'checking'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-red-500'
              }`}
            />
            <span>
              {backendStatus === 'connected'
                ? 'API Live'
                : backendStatus === 'checking'
                  ? 'Connecting...'
                  : 'Offline'}
            </span>
          </div>

          {/* Tenant Status Pill */}
          {currentFarmer && (
            <div className="hidden xl:flex items-center px-3.5 py-1 rounded-full text-[12px] font-bold shadow-xs backdrop-blur-md bg-[#a1f4c8]/80 text-[#0f5135] border border-emerald-300/80">
              <span className="material-symbols-outlined text-[15px] mr-1">
                verified
              </span>
              <span>Tenant: {currentFarmer.tenantId}</span>
            </div>
          )}
        </div>

        {/* Center: Navigation Pill Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/45 backdrop-blur-xl p-1.5 rounded-2xl border border-white/75 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.02)]">
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`relative px-3.5 py-1.5 text-[13px] font-semibold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#012d1d]/90 text-white shadow-[0_3px_12px_rgba(1,45,29,0.28),inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md'
                    : 'text-[#414844] hover:text-[#012d1d] hover:bg-white/70'
                }`}
              >
                {item.label}
                {item.path === 'reminders' && todayReminders.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#f48c24] text-white shadow-2xs">
                    {todayReminders.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Currency & Actions / Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[12px] font-bold text-[#012d1d] shadow-2xs">
            <span>₹</span>
            <span>INR</span>
          </div>

          {currentFarmer ? (
            <>
              {/* Notification Bell */}
              <button
                onClick={() => handleNavClick('reminders')}
                className="relative p-2 rounded-xl text-[#012d1d] bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-2xs transition-all cursor-pointer"
                title="Reminders"
                aria-label="View Reminders"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {todayReminders.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Profile Menu Capsule */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-white/75 hover:bg-white/95 backdrop-blur-md border border-white/85 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  aria-expanded={isProfileOpen}
                  aria-label="User profile menu"
                >
                  {currentFarmer.pictureUrl ? (
                    <img
                      src={currentFarmer.pictureUrl}
                      alt={currentFarmer.firstName}
                      className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-[#012d1d] text-[#a1f4c8] flex items-center justify-center font-bold text-[12px] shadow-2xs">
                      {currentFarmer.firstName ? currentFarmer.firstName.charAt(0).toUpperCase() : 'K'}
                    </div>
                  )}
                  <span className="hidden sm:inline font-bold text-[13px] text-[#012d1d]">
                    {currentFarmer.firstName || 'Farmer'}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#717973]">
                    expand_more
                  </span>
                </button>

                {/* Profile Popover Window */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-white/80 p-3 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="font-bold text-[14px] text-[#012d1d] truncate">
                        {currentFarmer.firstName} {currentFarmer.lastName}
                      </p>
                      <p className="text-[12px] text-[#717973] truncate">{currentFarmer.email}</p>
                      <p className="text-[11px] font-semibold text-[#116c4a] mt-0.5 truncate">
                        {currentFarmer.farmName}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#a1f4c8]/60 text-[#0f5135]">
                        Tenant: {currentFarmer.tenantId}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-semibold text-[#012d1d] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                        <span>Farm Dashboard</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('expenses')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-semibold text-[#012d1d] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        <span>Expense Ledger</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('reports')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-semibold text-[#012d1d] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">description</span>
                        <span>Certified Reports</span>
                      </button>
                    </div>

                    <div className="border-t border-[#f0f3ff] mt-2 pt-2">
                      <button
                        onClick={logoutFarmer}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-[#ba1a1a] bg-[#ffdad6]/40 hover:bg-[#ffdad6]/70 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Sign Out of Khata</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGoogleQuickAuth}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#111c2d] text-[12px] font-semibold border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Continue with Google"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-[13px] font-bold text-[#012d1d] bg-white/70 hover:bg-white/95 backdrop-blur-md border border-white/85 shadow-2xs hover:shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#012d1d]/90 hover:bg-[#012d1d] text-white text-[13px] font-bold shadow-[0_4px_14px_rgba(1,45,29,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_6px_20px_rgba(1,45,29,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#111c2d] bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white/85 transition-colors"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/85 backdrop-blur-2xl border-b border-white/80 px-4 py-4 space-y-3 shadow-xl">
          {currentFarmer && (
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-[#f0f3ff]">
              <span className="text-[12px] font-semibold text-[#116c4a]">
                Tenant: {currentFarmer.tenantId}
              </span>
              <span className="text-[12px] text-[#414844]">₹ INR Standard</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold text-left transition-all ${
                  currentPath === item.path
                    ? 'bg-[#012d1d] text-white shadow-xs'
                    : 'bg-white/60 hover:bg-white/85 border border-white/70 text-[#111c2d]'
                }`}
              >
                <span>{item.label}</span>
                {item.path === 'reminders' && todayReminders.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f48c24] text-white font-bold">
                    {todayReminders.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#f0f3ff] space-y-2">
            {currentFarmer ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logoutFarmer();
                }}
                className="w-full py-2.5 rounded-xl bg-[#ffdad6]/60 text-[#ba1a1a] text-[13px] font-bold text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out ({currentFarmer.firstName})</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleGoogleQuickAuth();
                  }}
                  className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-[#111c2d] text-[13px] font-bold text-center cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuthModal(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#012d1d] text-white text-[13px] font-bold text-center cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuthModal(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#e7eeff] text-[#012d1d] text-[13px] font-bold text-center cursor-pointer"
                  >
                    Register Farm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
