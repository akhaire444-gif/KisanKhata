import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavigationPath } from '../types';
import { KisanKhataLogo } from './KisanKhataLogo';

export const Header: React.FC<{ onOpenAuthModal: (isRegister?: boolean) => void }> = ({ onOpenAuthModal }) => {
  const {
    currentPath,
    setCurrentPath,
    currentRole,
    currentFarmer,
    logoutFarmer,
    loginDemo,
    resetDemoData,
    todayReminders,
    backendStatus,
    showToast
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleExploreDemo = async () => {
    if (isDemoLoading) return;
    setIsDemoLoading(true);
    try {
      const res = await loginDemo();
      if (!res.success && res.error) {
        showToast(res.error, 'error');
      }
      setIsMobileMenuOpen(false);
    } finally {
      setIsDemoLoading(false);
    }
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
    <header className="fixed top-0 w-full z-50 bg-[#f9f9ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e7eeff]">
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
                  : 'Public Demo Mode is active and ready'
            }
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              backendStatus === 'connected'
                ? 'bg-[#1b4332]/10 text-[#116c4a] border-[#a1f4c8]'
                : backendStatus === 'checking'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected'
                  ? 'bg-[#116c4a] animate-pulse'
                  : backendStatus === 'checking'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-emerald-600'
              }`}
            />
            <span>
              {backendStatus === 'connected'
                ? 'API Live'
                : backendStatus === 'checking'
                  ? 'Connecting...'
                  : 'Demo Ready'}
            </span>
          </div>

          {/* Tenant Status Pill / Demo Account Badge */}
          {currentFarmer && (
            <div className={`hidden xl:flex items-center px-3 py-1 rounded-full text-[12px] font-bold shadow-xs ${currentFarmer.isDemo
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-[#a1f4c8] text-[#1b724f]'
              }`}>
              <span className="material-symbols-outlined text-[15px] mr-1">
                {currentFarmer.isDemo ? 'verified' : 'domain'}
              </span>
              <span>{currentFarmer.isDemo ? 'DEMO ACCOUNT' : `Tenant: ${currentFarmer.tenantId}`}</span>
            </div>
          )}
        </div>

        {/* Center: Navigation Pill Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#f0f3ff] p-1.5 rounded-xl border border-[#d8e3fb]">
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`relative px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all cursor-pointer ${isActive
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'text-[#414844] hover:text-[#111c2d] hover:bg-[#e7eeff]/60'
                  }`}
              >
                {item.label}
                {item.path === 'reminders' && todayReminders.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#f48c24] text-white">
                    {todayReminders.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Currency, Notification, Profile Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* INR Indicator */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e7eeff] text-[#414844] text-[12px] font-semibold border border-[#d8e3fb]">
            <span className="material-symbols-outlined text-[16px]">currency_rupee</span>
            <span>INR</span>
          </div>

          {currentFarmer ? (
            <>
              {/* Notifications */}
              <button
                onClick={() => handleNavClick('reminders')}
                title={todayReminders.length > 0 ? `${todayReminders.length} reminder(s) due today` : 'Farm Reminders'}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#414844] hover:bg-[#e7eeff] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[21px]">notifications</span>
                {todayReminders.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-[#f0f3ff] rounded-full border border-[#d8e3fb] hover:bg-[#e7eeff] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#012d1d] flex items-center justify-center text-white text-[16px]">
                    <span className="material-symbols-outlined text-[18px]">agriculture</span>
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[12px] font-bold text-[#111c2d] leading-tight">
                      {`${currentFarmer.firstName} ${currentFarmer.lastName}`.trim()}
                    </span>
                    <span className="text-[10px] font-medium text-[#116c4a] leading-none">
                      {currentFarmer.tenantId}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[#414844] text-[18px] hidden md:inline-block">
                    expand_more
                  </span>
                </button>

                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#d8e3fb] p-3 z-50 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="p-2 border-b border-[#f0f3ff] mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#116c4a]">
                        Active Farm Account
                      </p>
                      <p className="text-[14px] font-bold text-[#012d1d]">
                        {`${currentFarmer.firstName} ${currentFarmer.lastName}`.trim()}
                      </p>
                      <p className="text-[12px] text-[#414844]">
                        {currentFarmer.farmName} • {currentFarmer.email}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-semibold text-[#012d1d] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">grid_view</span>
                        <span>Farmer Dashboard</span>
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

                    {currentFarmer.isDemo && (
                      <div className="border-t border-[#f0f3ff] mt-2 pt-2">
                        <button
                          onClick={async () => {
                            await resetDemoData();
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-[#116c4a] bg-[#e8f5e9] hover:bg-[#c8e6c9] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                          <span>Reset Sample Data</span>
                        </button>
                      </div>
                    )}

                    <div className="border-t border-[#f0f3ff] mt-2 pt-2">
                      <button
                        onClick={logoutFarmer}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-[#ba1a1a] bg-[#ffdad6]/40 hover:bg-[#ffdad6]/70 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>{currentFarmer.isDemo ? 'Exit Demo Account' : 'Sign Out of Khata'}</span>
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
                onClick={handleExploreDemo}
                disabled={isDemoLoading}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#116c4a] to-[#1b724f] text-white text-[12px] font-bold hover:from-[#0d593c] hover:to-[#166042] shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                <span>{isDemoLoading ? 'Loading...' : 'Explore Demo'}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-[13px] font-bold text-[#012d1d] hover:bg-[#e7eeff] border border-[#d8e3fb] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332] shadow-xs transition-colors cursor-pointer"
              >
                Register Farm
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#111c2d] hover:bg-[#e7eeff] transition-colors"
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
        <div className="lg:hidden bg-white border-b border-[#e7eeff] px-4 py-4 space-y-3 shadow-lg">
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold text-left ${currentPath === item.path
                    ? 'bg-[#1b4332] text-white'
                    : 'bg-[#f0f3ff] text-[#111c2d]'
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
              <>
                {currentFarmer.isDemo && (
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await resetDemoData();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#e8f5e9] text-[#116c4a] text-[13px] font-bold text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset Sample Data</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logoutFarmer();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#ffdad6]/60 text-[#ba1a1a] text-[13px] font-bold text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>{currentFarmer.isDemo ? 'Exit Demo Account' : `Sign Out (${currentFarmer.firstName})`}</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleExploreDemo}
                  disabled={isDemoLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#116c4a] to-[#1b724f] text-white text-[13px] font-bold text-center cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  <span>{isDemoLoading ? 'Entering Demo...' : 'Explore Demo Account (1-Click)'}</span>
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
