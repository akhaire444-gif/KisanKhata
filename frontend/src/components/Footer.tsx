import React from 'react';
import { useApp } from '../context/AppContext';
import { KisanKhataLogo } from './KisanKhataLogo';

export const Footer: React.FC = () => {
  const { setCurrentPath, currentFarmer } = useApp();

  return (
    <footer className="w-full bg-[#f0f3ff] shadow-[0_-1px_6px_rgba(0,0,0,0.02)] py-12 border-t border-[#d8e3fb]">
      <div className="w-full px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#d8e3fb]/60">
          {/* Brand Col */}
          <div className="space-y-3">
            <KisanKhataLogo
              size="sm"
              showTagline={false}
              onClick={() => {
                setCurrentPath('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <p className="text-[13px] text-[#414844] leading-relaxed">
              Next-generation enterprise agricultural SaaS ledger and rural bookkeeping infrastructure built specifically for Indian farmers and farmlands.
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-[#c1ecd4] text-[#274e3d] text-[11px] font-semibold">
                Multi-Tenant v4.2
              </span>
              <span className="px-2 py-0.5 rounded bg-[#e7eeff] text-[#414844] text-[11px] font-semibold border border-[#d8e3fb]">
                Offline-Ready
              </span>
            </div>
          </div>

          {/* Farm Modules */}
          <div>
            <h4 className="font-bold text-[15px] text-[#012d1d] mb-3">Farm Khata Modules</h4>
            <ul className="space-y-2 text-[13px] text-[#414844]">
              <li>
                <button
                  onClick={() => {
                    setCurrentPath('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#012d1d] transition-colors cursor-pointer text-left"
                >
                  Farmer Overview Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentPath('crops');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#012d1d] transition-colors cursor-pointer text-left"
                >
                  Crop Sowing & Yield Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentPath('expenses');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#012d1d] transition-colors cursor-pointer text-left"
                >
                  Daily Expense Ledger
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentPath('workers');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#012d1d] transition-colors cursor-pointer text-left"
                >
                  Worker Attendance & Daily Wages
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 className="font-bold text-[15px] text-[#012d1d] mb-3">Compliance & Standards</h4>
            <ul className="space-y-2 text-[13px] text-[#414844]">
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#116c4a]">check_circle</span>
                Indian Rupee Notation (₹ Lakh / Crore)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#116c4a]">check_circle</span>
                Strict Farm Tenant Isolation
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#116c4a]">check_circle</span>
                Zero Silent Loss Record Validation
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#116c4a]">check_circle</span>
                DD-MM-YYYY Audit Stamp Format
              </li>
            </ul>
          </div>

          {/* Quick Help */}
          <div>
            <h4 className="font-bold text-[15px] text-[#012d1d] mb-3">Quick Help & Support</h4>
            <ul className="space-y-2 text-[13px] text-[#414844]">
              <li>
                <button
                  onClick={() => {
                    setCurrentPath('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#012d1d] transition-colors cursor-pointer text-left"
                >
                  Farmer Helpline & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentPath('help');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#012d1d] transition-colors cursor-pointer text-left"
                >
                  Step-by-Step User Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentPath('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#012d1d] transition-colors cursor-pointer text-left"
                >
                  Platform Architecture
                </button>
              </li>
              <li>
                <span className="text-[#414844]">Offline Field Sync Status: Active</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-[#414844]">
          <p>© 2026 KisanKhata Technologies Pvt Ltd. Dedicated to Bharat's Agricultural Producers.</p>
          <p className="flex items-center gap-1.5 font-medium text-[#116c4a]">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Strict Tenant Isolation Guaranteed{currentFarmer ? ` (${currentFarmer.tenantId})` : ''}
          </p>
        </div>
      </div>
    </footer>
  );
};
