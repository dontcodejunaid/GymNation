import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { login, getRememberedEmail } from '../../utils/adminAuth';
import logoImg from '../../assets/logo.png';

export default function AdminLogin({ onSuccess, onExit }) {
  const remembered = getRememberedEmail();
  const [email, setEmail] = useState(remembered);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    const result = login(email, password, remember);

    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error);
      setPassword('');
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative w-full max-w-md">
        <button
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-orange-400"
          onClick={onExit}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </button>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <img alt="Gymnation" className="h-12 w-auto" src={logoImg} />
            <h1 className="font-teko mt-4 text-3xl uppercase tracking-wide text-white">
              Owner Panel
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Sign in to manage bookings and schedules.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400"
                htmlFor="admin-email"
              >
                Email or Username
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 transition-colors focus-within:border-orange-500/60">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  autoComplete="username"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  id="admin-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="owner@gymnation.com"
                  required
                  type="text"
                  value={email}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400"
                htmlFor="admin-password"
              >
                Password
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 transition-colors focus-within:border-orange-500/60">
                <Lock className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  autoComplete="current-password"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  id="admin-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="-mr-1 shrink-0 cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800/70 hover:text-slate-200"
                  // Keep focus in the input so toggling doesn't blur the field.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowPassword((visible) => !visible)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-400">
              <input
                checked={remember}
                className="h-4 w-4 cursor-pointer accent-orange-500"
                onChange={(event) => setRemember(event.target.checked)}
                type="checkbox"
              />
              Remember me on this device
            </label>

            {error && (
              <div
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              className="w-full rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 py-3 text-sm font-black uppercase tracking-wider text-white shadow-md transition-all hover:shadow-[0_0_25px_rgba(251,146,60,0.45)] active:scale-[0.98] disabled:opacity-60"
              disabled={busy}
              type="submit"
            >
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-5 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-slate-600">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Front-end gate only — credentials ship in the bundle.
            <br />
            Move authentication server-side before relying on this.
          </span>
        </p>
      </div>
    </div>
  );
}
