'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicEventPage from '@/components/public-event-page';
import { createMediaAsset, createVideoRecord, saveEventFromBrowser, uploadImageAssetFromBrowser } from '@/lib/events-client';

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

function Field({ label, hint, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <button type="button" onClick={onChange} className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-rose-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </label>
  );
}

export default function EventStudio({ initialEvent, mode }) {
  const router = useRouter();
  const [event, setEvent] = useState(initialEvent);
  const [activeTab, setActiveTab] = useState('studio');
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [videoInputs, setVideoInputs] = useState({
    livestream: initialEvent.video_embeds.find((item) => item.section_key === 'livestream')?.url ?? '',
    pre_wedding: initialEvent.video_embeds.find((item) => item.section_key === 'pre_wedding')?.url ?? '',
  });

  const galleryAssets = useMemo(
    () =>
      [...(event.media_assets ?? [])]
        .filter((asset) => asset.kind === 'gallery' || asset.kind === 'poster')
        .sort((a, b) => a.sort_order - b.sort_order),
    [event.media_assets],
  );

  const heroAsset = event.media_assets.find((asset) => asset.kind === 'hero') || galleryAssets[0];

  function updateEventField(field, value) {
    setEvent((current) => ({ ...current, [field]: value }));
  }

  function updateSectionField(field) {
    setEvent((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [field]: !current.sections[field],
      },
    }));
  }

  function syncSlugFromNames(value) {
    setEvent((current) => ({
      ...current,
      hosts_display_name: value,
      slug: slugify(value || current.title || 'ourbigday-event'),
    }));
  }

  async function handleSave(statusOverride = null) {
    const nextEvent = {
      ...event,
      status: statusOverride ?? event.status,
    };

    setSaveState({ status: 'saving', message: 'Saving event...' });

    try {
      const saved = await saveEventFromBrowser(nextEvent);
      setEvent(saved);
      setSaveState({
        status: 'success',
        message: `Saved as ${saved.status}.`,
      });
      if (mode === 'create') {
        router.replace(`/dashboard/events/${saved.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      setSaveState({
        status: 'error',
        message: error.message || 'Saving failed.',
      });
    }
  }

  async function handleImageUpload(fileList, kind = 'gallery') {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    setSaveState({ status: 'saving', message: 'Uploading images...' });

    try {
      const newAssets = [];
      const baseOrder = event.media_assets.filter((asset) => asset.kind === kind).length;

      for (const [index, file] of files.entries()) {
        const uploaded = await uploadImageAssetFromBrowser({
          eventId: event.id,
          file,
          kind,
        });

        newAssets.push(
          createMediaAsset({
            eventId: event.id,
            kind,
            sourceType: 'upload',
            publicUrl: uploaded.public_url,
            storagePath: uploaded.storage_path,
            caption: file.name.replace(/\.[^.]+$/, ''),
            altText: file.name.replace(/\.[^.]+$/, ''),
            sortOrder: baseOrder + index,
          }),
        );
      }

      setEvent((current) => ({
        ...current,
        media_assets: [...current.media_assets, ...newAssets],
      }));
      setSaveState({ status: 'success', message: 'Images uploaded successfully.' });
    } catch (error) {
      setSaveState({ status: 'error', message: error.message || 'Unable to upload images.' });
    }
  }

  function handleAddImageByUrl(kind = 'gallery') {
    try {
      const url = new URL(imageUrlInput);
      const asset = createMediaAsset({
        eventId: event.id,
        kind,
        sourceType: 'external_url',
        publicUrl: url.toString(),
        externalUrl: url.toString(),
        caption: imageCaptionInput,
        altText: imageCaptionInput,
        sortOrder: event.media_assets.filter((item) => item.kind === kind).length,
      });

      setEvent((current) => ({
        ...current,
        media_assets: [...current.media_assets, asset],
      }));
      setImageUrlInput('');
      setImageCaptionInput('');
      setSaveState({ status: 'success', message: 'External image added.' });
    } catch {
      setSaveState({ status: 'error', message: 'Enter a valid image URL.' });
    }
  }

  function handleMoveAsset(assetId, direction) {
    setEvent((current) => {
      const items = [...current.media_assets]
        .filter((asset) => asset.kind === 'gallery' || asset.kind === 'poster')
        .sort((a, b) => a.sort_order - b.sort_order);

      const index = items.findIndex((asset) => asset.id === assetId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= items.length) {
        return current;
      }

      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const orderMap = new Map(items.map((asset, order) => [asset.id, order]));

      return {
        ...current,
        media_assets: current.media_assets.map((asset) =>
          orderMap.has(asset.id) ? { ...asset, sort_order: orderMap.get(asset.id) } : asset,
        ),
      };
    });
  }

  function handleDeleteAsset(assetId) {
    setEvent((current) => ({
      ...current,
      media_assets: current.media_assets.filter((asset) => asset.id !== assetId),
    }));
  }

  function handleMakeHero(assetId) {
    const asset = event.media_assets.find((item) => item.id === assetId);
    if (!asset) return;

    const hero = {
      ...asset,
      id: `hero-${asset.id}`,
      kind: 'hero',
      sort_order: 0,
    };

    setEvent((current) => ({
      ...current,
      media_assets: [...current.media_assets.filter((item) => item.kind !== 'hero'), hero],
    }));
  }

  function handleVideoSave(sectionKey) {
    try {
      const url = videoInputs[sectionKey];
      const title = sectionKey === 'livestream' ? 'Wedding livestream' : 'Our story video';
      const description =
        sectionKey === 'livestream'
          ? 'Live wedding coverage for guests joining from anywhere.'
          : 'Pre-wedding or highlight video embed.';

      const record = createVideoRecord({
        eventId: event.id,
        sectionKey,
        url,
        title,
        description,
      });

      setEvent((current) => ({
        ...current,
        video_embeds: [...current.video_embeds.filter((item) => item.section_key !== sectionKey), record],
      }));
      setSaveState({ status: 'success', message: `${sectionKey} video updated.` });
    } catch (error) {
      setSaveState({ status: 'error', message: error.message });
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">{mode === 'create' ? 'Create Event' : 'Edit Event'}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Manage the event site, preview the public page, and publish to a shareable subdomain.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setActiveTab('studio')} className={`rounded-2xl px-5 py-3 text-sm font-semibold ${activeTab === 'studio' ? 'bg-slate-950 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>
            Studio
          </button>
          <button type="button" onClick={() => setActiveTab('preview')} className={`rounded-2xl px-5 py-3 text-sm font-semibold ${activeTab === 'preview' ? 'bg-rose-600 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>
            Preview
          </button>
          <button type="button" onClick={() => handleSave('draft')} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800">
            Save Draft
          </button>
          <button type="button" onClick={() => handleSave('published')} className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white">
            Publish Event
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border px-4 py-3 text-sm ${
        saveState.status === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : saveState.status === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-white text-slate-600'
      }`}>
        {saveState.message || 'Update content, media, and embeds before publishing.'}
      </div>

      {activeTab === 'studio' ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="grid gap-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">Event Basics</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Event Type">
                  <select value={event.event_type} onChange={(eventInput) => updateEventField('event_type', eventInput.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400">
                    <option value="wedding">Wedding</option>
                    <option value="engagement">Engagement</option>
                    <option value="reception">Reception</option>
                    <option value="birthday">Birthday</option>
                    <option value="housewarming">Housewarming</option>
                    <option value="baby-shower">Baby Shower</option>
                  </select>
                </Field>
                <Field label="Theme Key">
                  <input value={event.theme_key} onChange={(eventInput) => updateEventField('theme_key', eventInput.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
                <Field label="Hosts Display Name">
                  <input value={event.hosts_display_name} onChange={(eventInput) => syncSlugFromNames(eventInput.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
                <Field label="Slug" hint="This becomes the event subdomain.">
                  <input value={event.slug} onChange={(eventInput) => updateEventField('slug', slugify(eventInput.target.value))} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
                <Field label="Title">
                  <input value={event.title} onChange={(eventInput) => updateEventField('title', eventInput.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
                <Field label="Headline">
                  <input value={event.headline} onChange={(eventInput) => updateEventField('headline', eventInput.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Description">
                  <textarea rows={4} value={event.description} onChange={(eventInput) => updateEventField('description', eventInput.target.value)} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Event Date & Time">
                  <input
                    type="datetime-local"
                    value={event.event_datetime_utc ? new Date(event.event_datetime_utc).toISOString().slice(0, 16) : ''}
                    onChange={(eventInput) => updateEventField('event_datetime_utc', new Date(eventInput.target.value).toISOString())}
                    className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400"
                  />
                </Field>
                <Field label="Event Timezone">
                  <input value={event.event_timezone} onChange={(eventInput) => updateEventField('event_timezone', eventInput.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">Section Controls</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Toggle label="Hero" checked={event.sections.hero_enabled} onChange={() => updateSectionField('hero_enabled')} />
                <Toggle label="Livestream" checked={event.sections.livestream_enabled} onChange={() => updateSectionField('livestream_enabled')} />
                <Toggle label="Story Video" checked={event.sections.story_video_enabled} onChange={() => updateSectionField('story_video_enabled')} />
                <Toggle label="Gallery & Posters" checked={event.sections.gallery_enabled} onChange={() => updateSectionField('gallery_enabled')} />
                <Toggle label="Location" checked={event.sections.location_enabled} onChange={() => updateSectionField('location_enabled')} />
                <Toggle label="Guestbook" checked={event.sections.guestbook_enabled} onChange={() => updateSectionField('guestbook_enabled')} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">Location</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Venue Name">
                  <input value={event.venue_name} onChange={(eventInput) => updateEventField('venue_name', eventInput.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
                <Field label="Maps URL">
                  <input value={event.maps_url} onChange={(eventInput) => updateEventField('maps_url', eventInput.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Venue Address">
                  <textarea rows={3} value={event.venue_address} onChange={(eventInput) => updateEventField('venue_address', eventInput.target.value)} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                </Field>
              </div>
            </div>
          </section>

          <section className="grid gap-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">Hosted Uploads</h2>
              <div className="mt-5 grid gap-4">
                <Field label="Upload gallery images">
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(eventInput) => handleImageUpload(eventInput.target.files, 'gallery')} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm" />
                </Field>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900">Paste External Image URL</h3>
                <div className="mt-4 grid gap-4">
                  <Field label="Image URL">
                    <input value={imageUrlInput} onChange={(eventInput) => setImageUrlInput(eventInput.target.value)} placeholder="https://example.com/image.jpg" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                  </Field>
                  <Field label="Caption / Alt Text">
                    <input value={imageCaptionInput} onChange={(eventInput) => setImageCaptionInput(eventInput.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                  </Field>
                  <button type="button" onClick={() => handleAddImageByUrl('gallery')} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
                    Add External Image
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">Video Embeds</h2>
              <div className="mt-5 grid gap-5">
                <Field label="Livestream URL">
                  <div className="flex gap-3">
                    <input value={videoInputs.livestream} onChange={(eventInput) => setVideoInputs((current) => ({ ...current, livestream: eventInput.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                    <button type="button" onClick={() => handleVideoSave('livestream')} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white">
                      Save
                    </button>
                  </div>
                </Field>
                <Field label="Story Video URL">
                  <div className="flex gap-3">
                    <input value={videoInputs.pre_wedding} onChange={(eventInput) => setVideoInputs((current) => ({ ...current, pre_wedding: eventInput.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400" />
                    <button type="button" onClick={() => handleVideoSave('pre_wedding')} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white">
                      Save
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-slate-950">Gallery Manager</h2>
                <div className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">{galleryAssets.length} items</div>
              </div>
              <div className="mt-5 grid gap-4">
                {galleryAssets.map((asset) => (
                  <div key={asset.id} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <img src={asset.public_url} alt={asset.alt_text || asset.caption || 'Event media'} className="h-40 w-full rounded-2xl object-cover" />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{asset.caption || 'Untitled media'}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {asset.kind} · {asset.source_type === 'upload' ? 'Hosted on our platform' : 'External image URL'}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <button type="button" onClick={() => handleMoveAsset(asset.id, -1)} className="rounded-xl border border-slate-300 px-3 py-2">
                        Move Up
                      </button>
                      <button type="button" onClick={() => handleMoveAsset(asset.id, 1)} className="rounded-xl border border-slate-300 px-3 py-2">
                        Move Down
                      </button>
                      <button type="button" onClick={() => handleMakeHero(asset.id)} className="rounded-xl border border-rose-200 px-3 py-2 text-rose-700">
                        Make Hero
                      </button>
                      <button type="button" onClick={() => handleDeleteAsset(asset.id)} className="rounded-xl border border-red-200 px-3 py-2 text-red-700">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">Launch Snapshot</h2>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-900">Subdomain:</span> https://{event.slug}.ourbigday.io
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-900">Public fallback:</span>{' '}
                  <Link href={`/events/${event.slug}`} target="_blank" className="text-rose-600 underline">
                    /events/{event.slug}
                  </Link>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-900">Status:</span> {event.status}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <PublicEventPage initialEvent={event} />
      )}
    </div>
  );
}
