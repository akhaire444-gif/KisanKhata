import React, { Suspense, lazy } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { StaticHeroFallback } from '../components/three/StaticHeroFallback';
import { TiltCard } from '../components/TiltCard';

const FarmHeroScene = lazy(() => import('../components/three/FarmHeroScene'));

export const HomePage: React.FC<{
  onOpenAuthModal?: (isRegister?: boolean) => void;
}> = ({ onOpenAuthModal }) => {
  const { currentFarmer, setCurrentPath } = useApp();

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

  const handleGoogleAuth = () => {
    window.location.href = api.auth.getGoogleAuthUrl();
  };

  return (
    <div className="w-full text-[#111c2d] selection:bg-[#a1f4c8] selection:text-[#012d1d]">
      {/* ================= 3D FARM HERO SECTION ================= */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden border-b border-emerald-900/20">
        {/* 3D Farm Canvas Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<StaticHeroFallback />}>
            <FarmHeroScene />
          </Suspense>
          {/* Subtle gradient scrim overlay to guarantee text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/85 pointer-events-none backdrop-blur-[1.5px]" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* 3D Glass Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-emerald-500/30 text-[#116c4a] text-[13px] font-bold shadow-md">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">verified_user</span>
              <span>Bharat’s Next-Gen 3D Digital Farm Khata • डिजिटल शेतकरी बहीखाता</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#012d1d] tracking-tight leading-[1.14] drop-shadow-xs">
              Your Farm. Your Expenses. <br />
              <span className="text-[#116c4a] bg-clip-text text-transparent bg-gradient-to-r from-[#012d1d] via-[#116c4a] to-[#2d6a4f]">
                Precision Digital Growth.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#263238] font-medium max-w-2xl mx-auto leading-relaxed bg-white/50 backdrop-blur-xs rounded-2xl p-2">
              Ditch lost damp paper diaries. Record diesel, seeds, fertilizer, and daily worker rozi-roti rolls with instant ₹ INR calculation and 1-tap certified bank audit reports.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {currentFarmer ? (
                <button
                  type="button"
                  onClick={handleGoDashboard}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-base shadow-[0_6px_22px_rgba(1,45,29,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">grid_view</span>
                  <span>Open Farmer Dashboard ({currentFarmer.firstName})</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#111c2d] font-bold text-base border border-slate-200/90 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenLogin}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-base shadow-[0_6px_22px_rgba(1,45,29,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenRegister}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/90 hover:bg-white text-[#012d1d] font-bold text-base hover:shadow-md hover:scale-[1.02] active:scale-[0.98] border border-white shadow-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    <span>Register Farm</span>
                  </button>
                </>
              )}
            </div>

            {/* Trust Points */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#374151] font-semibold">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-xs">
                <span className="material-symbols-outlined text-[18px] text-[#116c4a]">check_circle</span>
                Strict Tenant Isolation
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-xs">
                <span className="material-symbols-outlined text-[18px] text-[#116c4a]">check_circle</span>
                Bank KCC & Subsidy Ready
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-xs">
                <span className="material-symbols-outlined text-[18px] text-[#116c4a]">check_circle</span>
                Google & Email Auth
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3D FEATURE GRID SECTION ================= */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#116c4a] uppercase tracking-wider block mb-2">
            Built for Real Farm Workflows
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#012d1d] tracking-tight">
            Designed for Indian Agriculture & Farmland Records
          </h2>
          <p className="text-sm sm:text-base text-[#414844] mt-2">
            Every feature is calibrated to the realities of farming seasons, local Mandi accounting, and field-hand payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Crop Sowing */}
          <TiltCard className="h-full">
            <div className="bg-white/80 hover:bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_18px_42px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4]/90 text-[#012d1d] flex items-center justify-center shadow-xs border border-white/60">
                <span className="material-symbols-outlined text-[26px]">potted_plant</span>
              </div>
              <h3 className="text-lg font-bold text-[#012d1d]">Crop Sowing & Yield Timeline</h3>
              <p className="text-sm text-[#414844] leading-relaxed">
                Track Kharif, Rabi, and Zaid parcels with plantation dates, acreage planted, duration, and projected harvesting windows.
              </p>
            </div>
          </TiltCard>

          {/* Card 2: Daily Expenses */}
          <TiltCard className="h-full">
            <div className="bg-white/80 hover:bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_18px_42px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4]/90 text-[#012d1d] flex items-center justify-center shadow-xs border border-white/60">
                <span className="material-symbols-outlined text-[26px]">receipt_long</span>
              </div>
              <h3 className="text-lg font-bold text-[#012d1d]">Daily Agri-Expense Ledger</h3>
              <p className="text-sm text-[#414844] leading-relaxed">
                Log diesel receipts, fertilizer bags, certified seeds, tractor ploughing, and mandi transport with category tags and bill notes.
              </p>
            </div>
          </TiltCard>

          {/* Card 3: Worker Attendance */}
          <TiltCard className="h-full">
            <div className="bg-white/80 hover:bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_18px_42px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4]/90 text-[#012d1d] flex items-center justify-center shadow-xs border border-white/60">
                <span className="material-symbols-outlined text-[26px]">group</span>
              </div>
              <h3 className="text-lg font-bold text-[#012d1d]">Worker Attendance & Daily Rozi</h3>
              <p className="text-sm text-[#414844] leading-relaxed">
                Maintain daily attendance rozi records for field hands, weeders, and harvesters. Auto-computes total wages and payment rolls.
              </p>
            </div>
          </TiltCard>

          {/* Card 4: Sprays & Irrigation */}
          <TiltCard className="h-full">
            <div className="bg-white/80 hover:bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_18px_42px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4]/90 text-[#012d1d] flex items-center justify-center shadow-xs border border-white/60">
                <span className="material-symbols-outlined text-[26px]">water_drop</span>
              </div>
              <h3 className="text-lg font-bold text-[#012d1d]">Sprays & Irrigation Logs</h3>
              <p className="text-sm text-[#414844] leading-relaxed">
                Keep precise history of foliar sprays, micronutrient doses, drip fertigation, and canal watering hours per parcel.
              </p>
            </div>
          </TiltCard>

          {/* Card 5: Bank Audits */}
          <TiltCard className="h-full">
            <div className="bg-white/80 hover:bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_18px_42px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4]/90 text-[#012d1d] flex items-center justify-center shadow-xs border border-white/60">
                <span className="material-symbols-outlined text-[26px]">print</span>
              </div>
              <h3 className="text-lg font-bold text-[#012d1d]">Certified Audit Balance Sheets</h3>
              <p className="text-sm text-[#414844] leading-relaxed">
                Generate date-wise, crop-wise, and worker wage statement sheets in standard ₹ INR formatting ready to present to bank loan officers and insurance assessors.
              </p>
            </div>
          </TiltCard>

          {/* Card 6: Enterprise Security */}
          <TiltCard className="h-full">
            <div className="bg-white/80 hover:bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_18px_42px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4]/90 text-[#012d1d] flex items-center justify-center shadow-xs border border-white/60">
                <span className="material-symbols-outlined text-[26px]">security</span>
              </div>
              <h3 className="text-lg font-bold text-[#012d1d]">Private Multi-Tenant Security</h3>
              <p className="text-sm text-[#414844] leading-relaxed">
                Your farm records are strictly isolated. No cross-farmer data leakage, secure Spring session cookies, and BCrypt encrypted authentication.
              </p>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ================= SECURITY NOTICE BANNER ================= */}
      <section className="py-10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-[#0a4d34]/95 via-[#012d1d]/95 to-[#053221]/95 backdrop-blur-2xl p-8 rounded-3xl border border-[#a1f4c8]/30 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a1f4c8] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Protected Production Environment</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                100% Private Multi-Tenant Farm Ledger
              </h3>
              <p className="text-xs sm:text-sm text-[#a1f4c8]/90 max-w-xl">
                Every farm ledger on KisanKhata is protected behind authenticated Spring sessions and database tenant isolation. Your financial data belongs to you alone.
              </p>
            </div>

            <div className="shrink-0 flex gap-3">
              {currentFarmer ? (
                <button
                  type="button"
                  onClick={handleGoDashboard}
                  className="px-6 py-3 rounded-xl bg-[#a1f4c8] text-[#012d1d] font-bold text-sm hover:bg-[#86efac] shadow-[0_4px_14px_rgba(161,244,200,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Go to Farm Dashboard
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="px-6 py-3 rounded-xl bg-[#a1f4c8] text-[#012d1d] font-bold text-sm hover:bg-[#86efac] shadow-[0_4px_14px_rgba(161,244,200,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Sign In Now
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= READY TO GET STARTED BOTTOM CALLOUT ================= */}
      <section className="py-16 text-center max-w-3xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white p-8 sm:p-10 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.04)] space-y-4">
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
                className="px-8 py-3.5 rounded-2xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-base shadow-[0_6px_22px_rgba(1,45,29,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Access My Records
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenRegister}
                className="px-8 py-3.5 rounded-2xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-base shadow-[0_6px_22px_rgba(1,45,29,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
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

export default HomePage;
