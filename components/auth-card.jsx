'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AuthCard() {
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function handleGoogleSignIn() {
    setState({ status: 'saving', message: 'Redirecting to Google...' });

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error) {
      setState({
        status: 'error',
        message: error.message || 'Unable to start Google sign-in.',
      });
    }
  }

  return (
    <div className="w-full rounded-[2rem] border border-white/60 bg-white/90 p-8 shadow-xl shadow-rose-100/50">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-600">Host Access</p>
      <h1 className="mt-4 text-3xl font-semibold text-slate-950">Sign in to manage your events</h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Sign in with Google so your dashboard can create, edit, and publish event pages without hitting email rate limits.
      </p>

      <div className="mt-8 grid gap-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-3 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-950">G</span>
          Continue with Google
        </button>
      </div>

      {state.message ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            state.status === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : state.status === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Configure Google as a Supabase Auth provider and add your local and production callback URLs before testing.
      </div>
    </div>
  );
}
