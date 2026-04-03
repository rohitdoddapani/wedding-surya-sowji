import Link from 'next/link';
import SignOutButton from '@/components/sign-out-button';

function getInitials(value) {
  if (!value) return 'OB';

  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'OB';
}

export default function DashboardShell({ user, profile, children }) {
  const displayName =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Host';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-14 w-14 rounded-2xl border border-white/70 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-sm">
              {getInitials(displayName)}
            </div>
          )}
          <div>
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-600">
              OurBigDay
            </Link>
            <div className="mt-2 text-base font-semibold text-slate-950">{displayName}</div>
            <div className="text-sm text-slate-500">{user.email}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Dashboard
          </Link>
          <Link href="/dashboard/events/new" className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
            New Event
          </Link>
          <SignOutButton />
        </div>
      </header>
      {children}
    </main>
  );
}
