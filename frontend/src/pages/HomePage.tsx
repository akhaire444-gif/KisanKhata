import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KisanKhataLogo } from '../components/KisanKhataLogo';

export const HomePage: React.FC<{
  onOpenAuthModal?: (isRegister?: boolean) => void;
}> = ({ onOpenAuthModal }) => {
  const { currentFarmer, setCurrentPath, loginDemo, showToast } = useApp();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleOpenLogin = () => {
    if (onOpenAuthModal) onOpenAuthModal(false);
  };

  const handleOpenRegister = () => {
    if (onOpenAuthModal) onOpenAuthModal(true);
  };

  const handleGoDashboard = () => {
    setCurrentPath('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreDemo = async () => {
    if (isDemoLoading) return;
    setIsDemoLoading(true);
    try {
      const res = await loginDemo();
      if (!res.success && res.error) {
        showToast(res.error, 'error');
      }
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f9f9ff] text-[#111c2d] selection:bg-[#a1f4c8] selection:text-[#012d1d]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#e7eeff] bg-gradient-to-b from-white via-[#f4f7ff] to-[#f9f9ff]">
        {/* Subtle Decorative Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-[#a1f4c8]/20 via-[#116c4a]/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b4332]/10 border border-[#a1f4c8] text-[#116c4a] text-[13px] font-bold shadow-xs">
              <span className="material-symbols-outlined text-[17px]">verified_user</span>
              <span>Bharat’s Multi-Tenant Digital Farm Khata • फसल खर्च बही</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#012d1d] tracking-tight leading-[1.15]">
              Empower Your Farm with Precision Expense & Wage Ledgers
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#414844] max-w-2xl mx-auto leading-relaxed">
              Ditch lost damp paper diaries. Record diesel, seeds, fertilizer, and daily worker rozi-roti rolls with instant ₹ INR calculation and 1-tap certified bank audit reports.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {currentFarmer ? (
                <button
                  type="button"
                  onClick={handleGoDashboard}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#012d1d] text-white font-bold text-base hover:bg-[#1b4332] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">grid_view</span>
                  <span>Open Farmer Dashboard ({currentFarmer.firstName})</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleOpenLogin}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#012d1d] text-white font-bold text-base hover:bg-[#1b4332] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExploreDemo}
                    disabled={isDemoLoading}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#116c4a] to-[#1b724f] text-white font-bold text-base hover:from-[#0d593c] hover:to-[#166042] shadow-lg hover:shadow-xl border border-[#a1f4c8]/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDemoLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Entering Demo...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px] text-[#a1f4c8]">rocket_launch</span>
                        <span>Explore Demo Account</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenRegister}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white text-[#012d1d] font-bold text-base hover:bg-[#f0f3ff] border border-[#d8e3fb] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    <span>Register Farm</span>
                  </button>
                </>
              )}
            </div>

            {/* Trust Points */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-[#414844] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#116c4a]">check_circle</span>
                Strict Tenant Isolation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#116c4a]">check_circle</span>
                Bank KCC & Subsidy Ready
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#116c4a]">check_circle</span>
                1-Click Public Demo Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#116c4a] uppercase tracking-wider block mb-2">
            Built for Real Farm Workflows
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#012d1d] tracking-tight">
            Complete Agricultural Accounting in Your Pocket
          </h2>
          <p className="text-sm sm:text-base text-[#414844] mt-2">
            Engineered with high contrast and oversized buttons for outdoor sunlight operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Crop Expense Ledger */}
          <div className="bg-white p-7 rounded-3xl border border-[#e7eeff] shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4] text-[#1b724f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">receipt_long</span>
            </div>
            <h3 className="text-lg font-bold text-[#012d1d]">Daily Expense Ledger</h3>
            <p className="text-sm text-[#414844] leading-relaxed">
              Record diesel, tractor rental, seeds, bio-sprays, and manure with one tap. Automatic category breakdowns and real-time total spend tracking.
            </p>
          </div>

          {/* Card 2: Worker Wage Khata */}
          <div className="bg-white p-7 rounded-3xl border border-[#e7eeff] shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ffdcc3] text-[#6e3900] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">badge</span>
            </div>
            <h3 className="text-lg font-bold text-[#012d1d]">Worker Wages & Attendance</h3>
            <p className="text-sm text-[#414844] leading-relaxed">
              Track daily rozi-roti labour rolls, days worked, daily wages, and pending balances with direct UPI integration for instant cashless settlements.
            </p>
          </div>

          {/* Card 3: Crop Management */}
          <div className="bg-white p-7 rounded-3xl border border-[#e7eeff] shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e7eeff] text-[#004e7c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">agriculture</span>
            </div>
            <h3 className="text-lg font-bold text-[#012d1d]">Crop Lifecycle Tracker</h3>
            <p className="text-sm text-[#414844] leading-relaxed">
              Track plantation dates, crop duration days, and acreage for grapes, pomegranates, wheat, and cash crops to calculate net profit per acre at harvest.
            </p>
          </div>

          {/* Card 4: Water & Spray Log */}
          <div className="bg-white p-7 rounded-3xl border border-[#e7eeff] shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#d0e4ff] text-[#004787] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">water_drop</span>
            </div>
            <h3 className="text-lg font-bold text-[#012d1d]">Irrigation & Spray Schedules</h3>
            <p className="text-sm text-[#414844] leading-relaxed">
              Maintain precise records of pump run hours, canal water cycles, and pesticide applications with scheduled reminders before critical spray windows.
            </p>
          </div>

          {/* Card 5: Bank Certified Reports */}
          <div className="bg-white p-7 rounded-3xl border border-[#e7eeff] shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f0f3ff] text-[#116c4a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">print</span>
            </div>
            <h3 className="text-lg font-bold text-[#012d1d]">A4 Certified Reports</h3>
            <p className="text-sm text-[#414844] leading-relaxed">
              Generate date-wise, crop-wise, and worker wage statement sheets in standard ₹ INR formatting ready to present to bank loan officers and insurance assessors.
            </p>
          </div>

          {/* Card 6: Enterprise Security */}
          <div className="bg-white p-7 rounded-3xl border border-[#e7eeff] shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4] text-[#012d1d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">security</span>
            </div>
            <h3 className="text-lg font-bold text-[#012d1d]">Private Multi-Tenant Security</h3>
            <p className="text-sm text-[#414844] leading-relaxed">
              Your farm records are strictly isolated. No public demo bypasses, no cross-farmer data leakage, and BCrypt encrypted authentication.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Anti-Demo Notice Banner */}
      <section className="py-10 bg-[#012d1d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0a4d34] p-8 rounded-3xl border border-[#a1f4c8]/30 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a1f4c8] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Protected Production Environment</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Zero Public Demo Access • 100% Private Ledger
              </h3>
              <p className="text-xs sm:text-sm text-[#a1f4c8]/90 max-w-xl">
                Every farmer ledger on KisanKhata is protected behind mandatory sign-in and backend tenant authorization. Your financial data is private to your account only.
              </p>
            </div>

            <div className="shrink-0 flex gap-3">
              {currentFarmer ? (
                <button
                  type="button"
                  onClick={handleGoDashboard}
                  className="px-6 py-3 rounded-xl bg-[#a1f4c8] text-[#012d1d] font-bold text-sm hover:bg-[#86efac] transition-colors cursor-pointer"
                >
                  Go to Farm Dashboard
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="px-6 py-3 rounded-xl bg-[#a1f4c8] text-[#012d1d] font-bold text-sm hover:bg-[#86efac] transition-colors cursor-pointer"
                >
                  Sign In Now
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Get Started Bottom Callout */}
      <section className="py-16 text-center max-w-3xl mx-auto px-4">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#012d1d]">
            Ready to bring financial discipline to your farm?
          </h2>
          <p className="text-sm sm:text-base text-[#414844]">
            Create your digital farm ledger in less than 30 seconds. Free for individual farmers.
          </p>
          <div className="pt-2 flex justify-center">
            {currentFarmer ? (
              <button
                type="button"
                onClick={handleGoDashboard}
                className="px-8 py-3.5 rounded-2xl bg-[#012d1d] text-white font-bold text-base hover:bg-[#1b4332] shadow-md transition-all cursor-pointer"
              >
                Access My Records
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenRegister}
                className="px-8 py-3.5 rounded-2xl bg-[#012d1d] text-white font-bold text-base hover:bg-[#1b4332] shadow-md transition-all cursor-pointer"
              >
                Start Your Farm Khata Free
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
