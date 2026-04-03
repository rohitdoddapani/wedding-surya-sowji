import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard-shell';
import { listEventsForCurrentUser } from '@/lib/events';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Dashboard | OurBigDay',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const events = await listEventsForCurrentUser();

  return (
    <DashboardShell user={user} profile={profile}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Your events</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Manage public pages, drafts, media, and shareable links from one place.
          </p>
        </div>
        <Link href="/dashboard/events/new" className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          Create Event
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {events.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
            No events yet. Create your first microsite to start publishing.
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{event.status}</div>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{event.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{event.slug}.ourbigday.io</p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/events/${event.slug}`} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    View
                  </Link>
                  <Link href={`/dashboard/events/${event.id}`} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
