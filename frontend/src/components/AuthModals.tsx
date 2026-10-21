import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  initialIsRegister?: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialIsRegister = false,
  onClose
}) => {
  const {
    loginFarmer,
    registerFarmer,
    switchToDemoFarmer
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

  // Quick fill demo credentials
  const fillDemoCredentials = () => {
    setEmail('rajesh.patil@kisankhata.in');
    setPassword('farmer123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('First and last name are required');
        return;
      }
      if (mobile.trim().length !== 10) {
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

      const res = await registerFarmer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        address: address.trim() || 'Nashik Rural',
        farmName: farmName.trim() || `${firstName} Krishi Farm`,
        state,
        totalAcres: 10,
        password: password.trim()
      } as any);

      if (!res.success) {
        setError(res.error || 'Registration failed');
        return;
      }
      onClose();
    } else {
      const res = await loginFarmer(email, password);
      if (!res.success) {
        setError(res.error || 'Email or password is incorrect');
        return;
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
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

          <button onClick={onClose} className="text-[#717973] hover:text-[#012d1d] cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-semibold">
            {error}
          </div>
        )}

        {/* Demo Fast Fill button */}
        <div className="mb-4 p-2.5 rounded-xl bg-[#f0f3ff] flex items-center justify-between text-[12px]">
          <span className="text-[#414844]">Quick test with pre-configured demo account:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="px-2.5 py-1 rounded-lg bg-[#012d1d] text-white font-bold hover:bg-[#1b4332] cursor-pointer"
            >
              Fill Form
            </button>
            <button
              type="button"
              onClick={() => {
                switchToDemoFarmer();
                onClose();
              }}
              className="px-2.5 py-1 rounded-lg bg-[#116c4a] text-white font-bold hover:bg-[#116c4a]/90 cursor-pointer"
            >
              Direct Demo
            </button>
          </div>
        </div>

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
                    placeholder="Rajesh"
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Patil"
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px]"
                    required
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
                    placeholder="9822014012"
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Farm Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={e => setFarmName(e.target.value)}
                    placeholder="Patil Krishi Farm"
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px]"
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
                  className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[14px]"
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
              placeholder="rajesh.patil@kisankhata.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              required
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 rounded-xl bg-[#012d1d] text-white font-bold text-[15px] hover:bg-[#1b4332] transition-colors shadow-md mt-2 cursor-pointer"
          >
            {isRegister ? 'Complete Farm Registration' : 'Sign In to Khata'}
          </button>
        </form>

        <div className="pt-4 mt-4 border-t border-[#f0f3ff] text-center text-[13px] text-[#414844]">
          {isRegister ? (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
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
                onClick={() => setIsRegister(true)}
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
