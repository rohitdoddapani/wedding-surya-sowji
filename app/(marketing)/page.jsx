import Link from 'next/link';
import { defaultEvent } from '@/lib/default-event';

const features = [
  'Custom public event pages with path and subdomain routing',
  'Hosted image uploads plus external image URLs',
  'Livestream, pre-wedding, and highlight video embeds',
  'Guestbook, timezone-aware schedules, and polished share flows',
];

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">OurBigDay</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
              Launch shareable event microsites that feel personal, polished, and ready to scale.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Build hosted event pages for weddings, receptions, birthdays, and more with a dedicated dashboard,
              server-rendered public pages, and Supabase-powered content management.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold !text-white shadow-lg">
                Open Dashboard
              </Link>
              <Link href={`/events/${defaultEvent.slug}`} className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold !text-slate-700">
                View Demo Event
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-rose-100/60">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Scale-ready foundation</div>
            <div className="mt-5 grid gap-3">
              {features.map((feature) => (
                <div key={feature} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
