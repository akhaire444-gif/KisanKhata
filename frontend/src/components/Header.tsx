import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavigationPath } from '../types';

export const Header: React.FC<{ onOpenAuthModal: (isRegister?: boolean) => void }> = ({ onOpenAuthModal }) => {
  const {
    currentPath,
    setCurrentPath,
    currentRole,
    currentFarmer,
    logoutFarmer,
    switchToDemoFarmer,
    todayReminders
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { label: string; path: NavigationPath; icon?: string }[] = [
    { label: '📊 Dashboard', path: 'dashboard' },
    { label: '📋 Expenses Khata', path: 'expenses' },
    { label: '🌱 Crops', path: 'crops' },
    { label: '👥 Worker Wages', path: 'workers' },
    { label: '🧪 Sprays & Fert', path: 'fertilizer' },
    { label: '🔔 Reminders', path: 'reminders' },
    { label: '📄 Print Report', path: 'reports' },
    { label: '❓ Help', path: 'help' },
  ];

  const handleNavClick = (path: NavigationPath) => {
    setCurrentPath(path);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f9f9ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e7eeff]">
      <div className="h-20 w-full px-4 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Tenant ID */}
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <img
              alt="KisanKhata Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WU9VSLtbc0JiZGVmnmcNptZl4TkxgdaaYa28yGY7ZcbMNexC76mB9v5GIkJQIGB3LmYIgumFYGZwAx38fHoG6XugyrGV6TXIJeu7aIlb-cUOzrRzL6sgnM8LCivSD5zmeh8x1N_NvtN62oZdulDxeRBAUMwPDcxIzuCXb7QWr4Wc7Nj9sjZoC4250zQboqt80J4pqn_4GpqOPHnYyFqe016ekQ64QhsONeHI77FMLHSDdsO_de9GZ8fTo"
            />
            <div className="flex flex-col">
              <span className="font-bold text-[19px] text-[#012d1d] tracking-tight leading-none">
                KisanKhata
              </span>
              <span className="text-[11px] font-semibold text-[#116c4a] tracking-wide leading-tight mt-0.5">
                Crop Expense Tracker • फसल खर्च बही
              </span>
            </div>
          </button>

          {/* Tenant Status Pill */}
          <div className="hidden xl:flex items-center px-3 py-1 rounded-full bg-[#a1f4c8] text-[#1b724f] text-[12px] font-semibold shadow-xs">
            <span className="material-symbols-outlined text-[15px] mr-1">domain</span>
            <span>Tenant: {currentFarmer ? currentFarmer.tenantId : 'Farm-MH-4012'}</span>
          </div>
        </div>

        {/* Center: Navigation Pill Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#f0f3ff] p-1.5 rounded-xl border border-[#d8e3fb]">
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`relative px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
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
            <span>INR Standard</span>
          </div>

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

          {/* Profile Dropdown / Switcher */}
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
                  {currentFarmer ? `${currentFarmer.firstName} ${currentFarmer.lastName}` : 'Guest Farmer'}
                </span>
                <span className="text-[10px] font-medium text-[#116c4a] leading-none">
                  {currentFarmer ? currentFarmer.tenantId : 'Sign In Required'}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#414844] text-[18px] hidden md:inline-block">
                expand_more
              </span>
            </button>

            {/* Profile Dropdown Menu */}
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
                    {currentFarmer ? `${currentFarmer.firstName} ${currentFarmer.lastName}` : 'Guest'}
                  </p>
                  <p className="text-[12px] text-[#414844]">
                    {currentFarmer ? `${currentFarmer.farmName} (${currentFarmer.totalAcres} Acres)` : 'Explore KisanKhata'}
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
                    onClick={() => switchToDemoFarmer()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-semibold text-[#116c4a] hover:bg-[#a1f4c8]/30 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                    <span>Reset / Switch to Demo Farm</span>
                  </button>

                  <button
                    onClick={() => onOpenAuthModal(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-semibold text-[#012d1d] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>Register New Farm (Free)</span>
                  </button>
                </div>

                <div className="border-t border-[#f0f3ff] mt-2 pt-2">
                  {currentRole === 'farmer' ? (
                    <button
                      onClick={logoutFarmer}
                      className="w-full text-center px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 cursor-pointer"
                    >
                      Log Out
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenAuthModal(false)}
                      className="w-full text-center px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#012d1d] bg-[#f0f3ff] hover:bg-[#e7eeff] cursor-pointer"
                    >
                      Farmer Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#111c2d] hover:bg-[#e7eeff] transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#e7eeff] px-4 py-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f0f3ff]">
            <span className="text-[12px] font-semibold text-[#116c4a]">
              Tenant: {currentFarmer ? currentFarmer.tenantId : 'Farm-MH-4012'}
            </span>
            <span className="text-[12px] text-[#414844]">₹ INR Standard</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold text-left ${
                  currentPath === item.path
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

          <div className="pt-2 border-t border-[#f0f3ff] flex gap-2">
            <button
              onClick={() => {
                handleNavClick('dashboard');
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#012d1d] text-white text-[13px] font-bold text-center cursor-pointer"
            >
              Open Farm Khata
            </button>
            <button
              onClick={() => onOpenAuthModal(true)}
              className="flex-1 py-2.5 rounded-xl bg-[#e7eeff] text-[#012d1d] text-[13px] font-bold text-center cursor-pointer"
            >
              Register Farm
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
