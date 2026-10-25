import React, { useState } from 'react';
import { Pill, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const TEST_USER_ID = '123456789';
const TEST_PIN = '1234';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId.trim() || !pin.trim()) {
      setError('Please enter both your User ID and PIN.');
      return;
    }

    setIsSubmitting(true);

    // Brief delay for UX feedback
    await new Promise((r) => setTimeout(r, 350));

    if (userId.trim() === TEST_USER_ID && pin.trim() === TEST_PIN) {
      try {
        localStorage.setItem('pharmabridge_auth', JSON.stringify({
          userId: userId.trim(),
          loggedInAt: new Date().toISOString(),
        }));
      } catch {
        // ignore storage errors
      }
      onLogin();
    } else {
      setError('Invalid User ID or PIN. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setUserId(TEST_USER_ID);
    setPin(TEST_PIN);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Subtle ambient backdrop accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/20 mb-3">
            <Pill className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            PharmaBridge
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Sign in to the MR & Agency Stock Network — your pharmaceutical discovery portal.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xl shadow-slate-900/5">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Secure Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your registered User ID and 4-digit PIN.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                User ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your User ID"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-teal-600 focus:border-teal-500 transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                4-Digit PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono tracking-[0.4em] text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-teal-600 focus:border-teal-500 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all min-h-[48px]"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Test credential helper */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-slate-700">
                  Test Credentials
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  User ID: <strong className="text-slate-800">123456789</strong> · PIN: <strong className="text-slate-800">1234</strong>
                </p>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="mt-1.5 text-[11px] font-semibold text-teal-700 hover:text-teal-900 transition-colors"
                >
                  Auto-fill test credentials →
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-5">
          FDA & Drug Control Compliant · Verified Wholesale Network
        </p>
      </div>
    </div>
  );
};
