'use client';

import { useState } from 'react';
import { submitGuestbookEntry } from '@/lib/events-client';

function formatEventTimes(dateString, venueTimeZone) {
  const date = new Date(dateString);

  return {
    venueTime: new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: venueTimeZone,
      timeZoneName: 'short',
    }).format(date),
    localTime: new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(date),
  };
}

function shareText(event, livestreamUrl) {
  const base = `https://${event.slug}.ourbigday.io`;
  return livestreamUrl
    ? `Join us for ${event.title}. Watch live here: ${livestreamUrl} and visit ${base}`
    : `Join us for ${event.title}: ${base}`;
}

export default function PublicEventPage({ initialEvent }) {
  const [event, setEvent] = useState(initialEvent);
  const [wishName, setWishName] = useState('');
  const [newWish, setNewWish] = useState('');
  const [wishState, setWishState] = useState({ status: 'idle', message: '' });

  const galleryAssets = [...(event.media_assets ?? [])]
    .filter((asset) => asset.kind === 'gallery' || asset.kind === 'poster')
    .sort((a, b) => a.sort_order - b.sort_order);
  const heroAsset = event.media_assets?.find((asset) => asset.kind === 'hero') || galleryAssets[0];
  const livestream = event.video_embeds?.find((video) => video.section_key === 'livestream');
  const storyVideo = event.video_embeds?.find((video) => video.section_key === 'pre_wedding');
  const times = formatEventTimes(event.event_datetime_utc, event.event_timezone);

  async function handleAddWish(submitEvent) {
    submitEvent.preventDefault();
    if (!newWish.trim()) return;

    setWishState({ status: 'saving', message: 'Posting your wish...' });

    try {
      const wish = await submitGuestbookEntry({
        eventId: event.id,
        guest_name: wishName.trim() || 'Anonymous',
        message: newWish.trim(),
      });

      setEvent((current) => ({
        ...current,
        guestbook_entries: [wish, ...(current.guestbook_entries ?? [])],
      }));
      setWishName('');
      setNewWish('');
      setWishState({ status: 'success', message: 'Your wish has been posted.' });
    } catch (error) {
      setWishState({
        status: 'error',
        message: error.message || 'Unable to post the wish right now.',
      });
    }
  }

  return (
    <main className="pb-12">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,113,133,0.15),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(251,146,60,0.14),_transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-3 inline-flex items-center rounded-full border border-rose-200 bg-white/80 px-4 py-1 text-sm font-medium shadow-sm">
                <span className="mr-2 flex h-2 w-2 relative">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                </span>
                Celebrating {event.event_type} live from {event.venue_name}
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
                {event.title}
                <span className="block text-rose-600">{event.headline}</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">{event.description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                {livestream?.url ? (
                  <a
                    href={livestream.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                  >
                    Watch Live
                  </a>
                ) : null}
                <a href="#gallery" className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5">
                  View Gallery
                </a>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-rose-100 bg-white/90 p-5 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">Venue Time</div>
                  <div className="mt-1 text-lg font-semibold">{times.venueTime}</div>
                  <div className="mt-1 text-sm text-slate-500">{event.venue_address}</div>
                </div>
                <div className="rounded-3xl border border-orange-100 bg-white/90 p-5 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">Your Local Time</div>
                  <div className="mt-1 text-lg font-semibold">{times.localTime}</div>
                  <div className="mt-1 text-sm text-slate-500">Auto-converted for each guest</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="relative h-[452px] w-full rounded-[2rem] border border-white/60 bg-white p-4 shadow-xl">
                <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-rose-50">
                  {heroAsset ? (
                    <img src={heroAsset.public_url} alt={heroAsset.alt_text || event.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {event.sections?.story_video_enabled && storyVideo ? (
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="rounded-[2rem] border border-rose-100 bg-rose-50/40 p-6 shadow-sm md:p-8">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div className="order-2 overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-inner md:order-1">
                <div className="aspect-video w-full">
                  <iframe className="h-full w-full" src={storyVideo.embed_url} title={storyVideo.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-2xl font-semibold text-rose-950 md:text-3xl">{storyVideo.title}</h2>
                <p className="mt-3 text-slate-600">{storyVideo.description}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {event.sections?.livestream_enabled && livestream ? (
        <section className="mx-auto max-w-6xl px-6 py-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <h2 className="text-2xl font-semibold md:text-3xl">Livestream</h2>
                <p className="mt-3 text-slate-600">{livestream.description}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={livestream.url} target="_blank" rel="noreferrer" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition">
                    Open Live Link
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText(event, livestream.url))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Share on WhatsApp
                  </a>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100 shadow-inner">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={livestream.embed_url}
                    title={livestream.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {event.sections?.gallery_enabled ? (
        <section id="gallery" className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold md:text-3xl">Gallery & Posters</h2>
            <p className="mt-2 text-slate-600">Mixed-source media from hosted uploads and external image URLs.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {galleryAssets.map((asset) => (
              <div key={asset.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1">
                <img src={asset.public_url} alt={asset.alt_text || asset.caption || 'Event media'} className="h-72 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{asset.caption || 'Event moment'}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {asset.source_type === 'upload' ? 'Hosted by OurBigDay' : 'External media source'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {event.sections?.location_enabled ? (
        <section className="mx-auto max-w-6xl px-6 py-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-slate-500">Location</div>
              <div className="mt-2 text-xl font-semibold">{event.venue_name}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{event.venue_address}</p>
              {event.maps_url ? (
                <a href={event.maps_url} target="_blank" rel="noreferrer" className="mt-4 inline-block font-semibold text-rose-600 hover:text-rose-700">
                  Open Google Maps
                </a>
              ) : null}
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-slate-500">One Shareable Link</div>
              <div className="mt-2 text-xl font-semibold">{event.slug}.ourbigday.io</div>
              <p className="mt-2 text-slate-600">Send one clean link to everyone on WhatsApp, SMS, or email.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-slate-500">Event Type</div>
              <div className="mt-2 text-xl font-semibold capitalize">{event.event_type}</div>
              <p className="mt-2 text-slate-600">Reusable architecture for weddings, receptions, birthdays, and more.</p>
            </div>
          </div>
        </section>
      ) : null}

      {event.sections?.guestbook_enabled ? (
        <section className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Guestbook & Wishes</h2>
            <p className="mt-2 text-slate-600">Send blessings to the hosts from anywhere in the world.</p>
          </div>

          <form onSubmit={handleAddWish} className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                <span>Name (Optional)</span>
                <input
                  type="text"
                  value={wishName}
                  onChange={(event) => setWishName(event.target.value)}
                  placeholder="Leave blank to post anonymously"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                <span>Your Wish</span>
                <textarea
                  required
                  value={newWish}
                  onChange={(event) => setNewWish(event.target.value)}
                  placeholder="Write your wishes here..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                />
              </label>
              <button type="submit" className="rounded-xl bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700">
                Post Wish
              </button>
            </div>
          </form>

          {wishState.message ? (
            <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              wishState.status === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : wishState.status === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}>
              {wishState.message}
            </div>
          ) : null}

          <div className="grid gap-4">
            {(event.guestbook_entries ?? []).length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                Be the first to share your blessings!
              </div>
            ) : (
              (event.guestbook_entries ?? []).map((wish) => (
                <div key={wish.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-slate-700">&quot;{wish.message}&quot;</p>
                  <p className="mt-3 text-sm font-medium text-rose-600">— {wish.guest_name}</p>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
