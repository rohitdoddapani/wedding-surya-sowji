import { redirect } from 'next/navigation';
import AuthCard from '@/components/auth-card';

export const metadata = {
  title: 'Host Sign In | OurBigDay',
};

export default async function AuthPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const code = resolvedSearchParams?.code;
  const next = resolvedSearchParams?.next ?? '/dashboard';
  const error = resolvedSearchParams?.error;

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <div className="w-full">
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Google sign-in could not be completed. Please try again after checking your Supabase Google provider settings.
          </div>
        ) : null}
        <AuthCard />
      </div>
    </main>
  );
}
