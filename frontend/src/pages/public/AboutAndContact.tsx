import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TiltCard } from '../../components/TiltCard';

export const AboutPage: React.FC = () => {
  const { setCurrentPath } = useApp();

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-12 px-4 lg:px-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-[12px] font-bold text-[#116c4a] uppercase tracking-wider block mb-2">
          Agritech Foundation & Architecture
        </span>
        <h1 className="text-[32px] sm:text-[40px] font-bold text-[#012d1d] tracking-tight">
          About KisanKhata
        </h1>
        <p className="text-[16px] text-[#414844] mt-3 leading-relaxed">
          Simple farm expense management, crop lifecycle books, and worker daily wage ledgers engineered specifically for Bharat’s farmlands.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <TiltCard className="glass p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4] text-[#274e3d] flex items-center justify-center font-bold text-[24px] shadow-xs">
            <span className="material-symbols-outlined text-[28px]">agriculture</span>
          </div>
          <h2 className="text-[22px] font-bold text-[#012d1d]">The Farmer Problem</h2>
          <p className="text-[14px] text-[#414844] leading-relaxed">
            Traditionally, orchardists and smallholders across India kept diesel, pesticide, and daily worker rozi-roti notes on damp paper diaries or in memory. Calculations took hours and led to inaccurate true cost determinations, leaving farmers with significantly less net profit than expected at harvest.
          </p>
          <p className="text-[14px] text-[#414844] leading-relaxed">
            KisanKhata eliminates notebook loss by providing high-contrast, oversized touch buttons tailored for outdoor sunlight, offline synchronization, and instant crop-wise expenditure totals.
          </p>
        </TiltCard>

        <TiltCard className="glass p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffdcc3] text-[#6e3900] flex items-center justify-center font-bold text-[24px] shadow-xs">
            <span className="material-symbols-outlined text-[28px]">verified_user</span>
          </div>
          <h2 className="text-[22px] font-bold text-[#012d1d]">Audited Ledger & Bank Eligibility</h2>
          <p className="text-[14px] text-[#414844] leading-relaxed">
            Without neat cost history, smallholders struggle when applying for institutional crop loans, Kisan Credit Cards (KCC), or government drought and drip subsidies.
          </p>
          <p className="text-[14px] text-[#414844] leading-relaxed">
            With KisanKhata, farmers can print certified A4 date-wise, crop-wise, and worker payment reports in standard ₹ INR formatting with a single tap, demonstrating disciplined farm balance sheets.
          </p>
        </TiltCard>
      </div>

      {/* Architecture Highlights */}
      <div className="glass rounded-3xl p-8 mb-12">
        <h3 className="text-[20px] font-bold text-[#012d1d] mb-4">
          Key Engineering Principles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl glass-subtle border border-white/80">
            <strong className="text-[15px] font-bold text-[#012d1d] block mb-1">
              Multi-Tenant Data Isolation
            </strong>
            <p className="text-[13px] text-[#414844]">
              Each farmstead receives an isolated tenant tag (e.g. Farm-MH-4012). Crop margins and worker wage rolls remain private and proprietary to that grower.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-subtle border border-white/80">
            <strong className="text-[15px] font-bold text-[#012d1d] block mb-1">
              Inclusive Touch Ergonomics
            </strong>
            <p className="text-[13px] text-[#414844]">
              Minimum 48px hit areas, large fonts, and unambiguous confirmation messages prevent accidental data entry errors under bright field glare.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-subtle border border-white/80">
            <strong className="text-[15px] font-bold text-[#012d1d] block mb-1">
              Offline-First Resilience
            </strong>
            <p className="text-[13px] text-[#414844]">
              Works in deep rural orchards without 4G internet connection. Wage, fuel, and crop expense logs save locally and sync automatically when network returns.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={() => {
            setCurrentPath('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-8 py-3.5 rounded-2xl glass-btn-primary water-shimmer text-white font-bold text-[15px] cursor-pointer"
        >
          Open Farmer Ledger Now
        </button>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !query.trim()) return;
    setSubmitted(true);
    showToast('Your inquiry has been received! Our field agent will call you.', 'success');
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-12 px-4 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[12px] font-bold text-[#116c4a] uppercase tracking-wider block mb-2">
          Kisan Sahayata Kendra
        </span>
        <h1 className="text-[32px] sm:text-[38px] font-bold text-[#012d1d] tracking-tight">
          Farmer Support & Field Desk
        </h1>
        <p className="text-[15px] text-[#414844] mt-2">
          Reach our field coordinators for ledger setup assistance, crop configuration, or tenant support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="glass p-8 rounded-3xl space-y-6">
          <div>
            <h3 className="font-bold text-[18px] text-[#012d1d] mb-4">Contact Channels</h3>
            
            <div className="space-y-4 text-[14px]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c1ecd4] text-[#274e3d] flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
                </div>
                <div>
                  <strong className="block text-[#012d1d]">Toll-Free Farmer Helpline</strong>
                  <span className="text-[#414844] font-medium">+91 1800 425 4012 (6 AM – 8 PM)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#a1f4c8] text-[#1b724f] flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                </div>
                <div>
                  <strong className="block text-[#012d1d]">WhatsApp Voice / Photo Support</strong>
                  <span className="text-[#414844] font-medium">+91 98220 14000</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffdcc3] text-[#6e3900] flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                <div>
                  <strong className="block text-[#012d1d]">Krishi Agritech Hub Office</strong>
                  <span className="text-[#414844] text-[13px] leading-relaxed block">
                    Krishi Mandi Gate No. 3, Sinnar Road, Nashik Agricultural District, Maharashtra 422001
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-subtle border border-white/80">
            <span className="font-bold text-[13px] text-[#012d1d] block mb-1">
              Regional Field Coordinator Coverage:
            </span>
            <p className="text-[12px] text-[#414844]">
              Maharashtra (Nashik, Ratnagiri, Pune, Sangli), Punjab & Haryana (Karnal, Ludhiana), Gujarat (Anand), and Karnataka (Salem-Erode belt).
            </p>
          </div>
        </div>

        {/* Support Inquiry Form */}
        <div className="glass p-8 rounded-3xl">
          <h3 className="font-bold text-[18px] text-[#012d1d] mb-4">Send a Message</h3>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-[#274e3d] text-center glass-subtle">
              <span className="material-symbols-outlined text-[36px] mb-2 text-[#116c4a]">check_circle</span>
              <h4 className="font-bold text-[16px] text-[#012d1d]">Inquiry Received</h4>
              <p className="text-[13px] mt-1 text-[#414844]">Our field officer will get in touch with you shortly.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 rounded-xl glass-btn-primary text-white text-[12px] font-bold"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rajesh Patil"
                  className="w-full px-4 py-2.5 glass-input text-[14px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Mobile Number (10 Digits) *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9822014012"
                  className="w-full px-4 py-2.5 glass-input text-[14px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Inquiry / Question *</label>
                <textarea
                  rows={3}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Need assistance setting up worker wage rolls or logging tractor diesel..."
                  className="w-full px-4 py-2.5 glass-input text-[14px]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] py-3 rounded-2xl glass-btn-primary water-shimmer text-white font-bold text-[14px] cursor-pointer"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
