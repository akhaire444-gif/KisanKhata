import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getOAuth2GoogleUrl } from '../api/client';

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#d8e3fb] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f0f3ff]">
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
            className="text-[#717973] hover:text-[#012d1d] p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-semibold flex items-center gap-2">
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
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]"
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
                  className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#116c4a]"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] py-3 rounded-xl bg-[#012d1d] text-white font-bold text-[15px] hover:bg-[#1b4332] transition-colors shadow-md mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="w-full border-t border-[#d8e3fb]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[#717973] font-semibold">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => {
            window.location.href = getOAuth2GoogleUrl();
          }}
          className="w-full py-2.5 px-4 rounded-xl border border-[#d8e3fb] bg-white text-[#111c2d] hover:bg-[#f0f3ff] font-semibold text-[14px] transition-colors flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="pt-4 mt-4 border-t border-[#f0f3ff] text-center text-[13px] text-[#414844]">
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
