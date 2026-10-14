import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FoodCard } from '../FoodCard';
import type { Food } from '../../types/restaurant';

interface AuthSectionProps {
  favoriteFoods: Food[];
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  onRequestForgot: (email: string) => Promise<string | null>;
  onResetPassword: (token: string, newPass: string) => Promise<void>;
}

export const AuthSection: React.FC<AuthSectionProps> = ({
  favoriteFoods,
  onLogin,
  onRegister,
  onRequestForgot,
  onResetPassword,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [resetTokenInfo, setResetTokenInfo] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        await onLogin(email, password);
      } else if (authMode === 'register') {
        await onRegister({ name, email, phone, password });
      } else if (authMode === 'forgot') {
        const token = await onRequestForgot(email);
        if (token) {
          setResetTokenInfo(token);
          setResetTokenInput(token);
          setAuthMode('reset');
        }
      } else if (authMode === 'reset') {
        await onResetPassword(resetTokenInput, newPassword);
        setAuthMode('login');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-5 nocturne-surface rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0D0914] border border-white/10">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              authMode === 'login' ? 'bg-[#8B5CF6] text-white' : 'text-[#B8AFC9]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              authMode === 'register' ? 'bg-[#8B5CF6] text-white' : 'text-[#B8AFC9]'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <h1 className="font-serif-display text-3xl font-semibold text-[#F5F2FA]">
            {authMode === 'login'
              ? 'Welcome Back to VELORA'
              : authMode === 'register'
              ? 'Create Your Guest Profile'
              : authMode === 'forgot'
              ? 'Reset Your Password'
              : 'Verify & Set New Password'}
          </h1>

          {authMode === 'register' && (
            <>
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (415) 602-8819"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
              </div>
            </>
          )}

          {authMode !== 'reset' && (
            <div>
              <label className="block text-xs text-[#B8AFC9] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
              />
            </div>
          )}

          {(authMode === 'login' || authMode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-[#B8AFC9]">Password</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-xs text-[#8B5CF6] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
              />
            </div>
          )}

          {authMode === 'forgot' && (
            <p className="text-xs text-[#B8AFC9] leading-relaxed">
              Enter your email and we’ll simulate dispatching a password reset key.
            </p>
          )}

          {authMode === 'reset' && (
            <>
              {resetTokenInfo && (
                <div className="p-3 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs text-[#B8AFC9]">
                  <p className="font-semibold text-[#F5F2FA] mb-1">Simulated Reset Token Generated:</p>
                  <p className="font-mono-tabular text-[#F59E0B] break-all">{resetTokenInfo}</p>
                </div>
              )}
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetTokenInput}
                  onChange={(e) => setResetTokenInput(e.target.value)}
                  placeholder="Paste reset token here"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={authSubmitting}
            className="w-full py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-semibold transition-colors"
          >
            {authSubmitting
              ? 'Processing...'
              : authMode === 'login'
              ? 'Sign In to Velora'
              : authMode === 'register'
              ? 'Create Guest Profile'
              : authMode === 'forgot'
              ? 'Request Reset Key'
              : 'Set New Password'}
          </button>

          {authMode === 'forgot' && (
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="w-full text-center text-xs text-[#7E7394] hover:text-[#F5F2FA]"
            >
              Back to Sign In
            </button>
          )}
        </form>
      </div>

      {/* Right Column: Public Saved Favorites Preview */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
            Your Saved Culinary Selections
          </h2>
          <p className="text-xs text-[#B8AFC9] mt-1">
            Sign in or create a profile to sync saved tasting menu dishes across devices and receive priority table reservations.
          </p>
        </div>

        {favoriteFoods.length === 0 ? (
          <div className="nocturne-surface rounded-2xl p-10 text-center space-y-3">
            <p className="text-sm text-[#B8AFC9]">
              No dishes saved to favorites yet. Click the heart icon on any dish to bookmark it.
            </p>
            <Link
              to="/menu"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favoriteFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
