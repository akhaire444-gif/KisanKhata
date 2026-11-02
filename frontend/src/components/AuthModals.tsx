import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  initialIsRegister?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialIsRegister = false,
  onClose,
  onSuccess
}) => {
  const {
    loginFarmer,
    loginDemo,
    registerFarmer
  } = useApp();

  const [isRegister, setIsRegister] = useState(initialIsRegister);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [farmName, setFarmName] = useState('');
  const [state, setState] = useState('Maharashtra');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    if (isSubmitting || isDemoLoading) return;
    setError('');
    setIsDemoLoading(true);
    try {
      const res = await loginDemo();
      if (!res.success) {
        setError(res.error || 'Failed to enter demo account');
        return;
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to enter demo account');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (isRegister) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('First and last name are required');
        return;
      }
      if (mobile.trim().length !== 10 || !/^\d{10}$/.test(mobile.trim())) {
        setError('Mobile number must be exactly 10 digits');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== repeatPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await registerFarmer({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          mobile: mobile.trim(),
          email: email.trim().toLowerCase(),
          address: address.trim() || 'Rural Maharashtra',
          farmName: farmName.trim() || `${firstName.trim()} Krishi Farm`,
          state,
          totalAcres: 10,
          password: password.trim()
        } as any);

        if (!res.success) {
          setError(res.error || 'Registration failed');
          return;
        }

        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Registration failed');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!email.trim() || !password) {
        setError('Email and password are required');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await loginFarmer(email.trim().toLowerCase(), password);
        if (!res.success) {
          setError(res.error || 'Email or password is incorrect');
          return;
        }

        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Authentication error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-white/85 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60">
          <div>
            <h3 className="font-bold text-[22px] text-[#012d1d]">
              {isRegister ? 'Register New Farm (Krishi Khata)' : 'Farmer Sign In'}
            </h3>
            <span className="text-[12px] text-[#414844]">
              {isRegister ? 'Set up regional ledger with strict tenant partition' : 'Access your farm crop and expense books'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#717973] hover:text-[#012d1d] p-1.5 rounded-xl hover:bg-slate-100/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 text-[#ba1a1a] border border-red-200/60 text-[13px] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#012d1d] mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]/30 shadow-2xs"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="e.g. Shinde"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]/30 shadow-2xs"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Mobile (10 Digits) *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]/30 shadow-2xs"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Farm Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={e => setFarmName(e.target.value)}
                    placeholder="Krishi Farm"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]/30 shadow-2xs"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Farm Location / Village</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Sinnar, Nashik Rural"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]/30 shadow-2xs"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]/30 shadow-2xs"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]/30 shadow-2xs"
              required
              disabled={isSubmitting}
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Repeat Password *</label>
              <input
                type="password"
                value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]/30 shadow-2xs"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] py-3 rounded-xl bg-[#012d1d] text-white font-bold text-[15px] hover:bg-[#1b4332] shadow-[0_4px_16px_rgba(1,45,29,0.25)] transition-all mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>{isRegister ? 'Creating Farm Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <span>{isRegister ? 'Complete Farm Registration' : 'Sign In to Khata'}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/90 backdrop-blur-md px-3 text-[#717973] font-semibold">Or Try Instant Access</span>
          </div>
        </div>

        {/* Explore Demo Account Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isSubmitting || isDemoLoading}
          className="w-full py-3 px-4 rounded-xl border border-emerald-500/35 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/10 hover:from-emerald-500/25 hover:to-teal-500/20 backdrop-blur-md text-[#012d1d] font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
        >
          {isDemoLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-[#012d1d]/30 border-t-[#012d1d] rounded-full animate-spin"></span>
              <span>Entering Demo Farm...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px] text-[#116c4a]">rocket_launch</span>
              <span>Explore Demo Account (1-Click Instant Access)</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-[#717973] mt-1.5">
          Explore all farm features with preconfigured crops, workers & expenses. No password required.
        </p>

        <div className="pt-4 mt-4 border-t border-slate-200/60 text-center text-[13px] text-[#414844]">
          {isRegister ? (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsRegister(false);
                }}
                className="font-bold text-[#116c4a] hover:underline cursor-pointer"
              >
                Sign In here
              </button>
            </p>
          ) : (
            <p>
              Need a free ledger account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsRegister(true);
                }}
                className="font-bold text-[#116c4a] hover:underline cursor-pointer"
              >
                Register your Farm (Free)
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
