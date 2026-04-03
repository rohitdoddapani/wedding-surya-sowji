'use client';

import { createClient } from '@/utils/supabase/client';
import { createMediaAsset, createVideoRecord } from '@/lib/events-shared';

export { createMediaAsset, createVideoRecord };

const EVENT_MEDIA_BUCKET = 'event-media';

export async function saveEventFromBrowser(event) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Sign in first to save or publish your event.');
  }

  const eventPayload = {
    id: event.id,
    owner_id: user.id,
    event_type: event.event_type,
    slug: event.slug,
    title: event.title,
    hosts_display_name: event.hosts_display_name,
    headline: event.headline,
    description: event.description,
    event_datetime_utc: event.event_datetime_utc,
    event_timezone: event.event_timezone,
    venue_name: event.venue_name,
    venue_address: event.venue_address,
    maps_url: event.maps_url,
    theme_key: event.theme_key,
    status: event.status,
  };

  const { data: savedEvent, error: eventError } = await supabase.from('events').upsert(eventPayload).select().single();
  if (eventError) throw eventError;

  const { error: sectionsError } = await supabase.from('event_sections').upsert({
    event_id: savedEvent.id,
    ...event.sections,
  });
  if (sectionsError) throw sectionsError;

  if (event.media_assets.length > 0) {
    const { error: mediaError } = await supabase.from('media_assets').upsert(
      event.media_assets.map((asset) => ({
        ...asset,
        event_id: savedEvent.id,
      })),
    );
    if (mediaError) throw mediaError;
  }

  if (event.video_embeds.length > 0) {
    const { error: videoError } = await supabase.from('video_embeds').upsert(
      event.video_embeds.map((video) => ({
        ...video,
        event_id: savedEvent.id,
      })),
    );
    if (videoError) throw videoError;
  }

  const { data: fullEvent, error: reloadError } = await supabase
    .from('events')
    .select(`
      *,
      event_sections (*),
      media_assets (*),
      video_embeds (*),
      guestbook_entries (*)
    `)
    .eq('id', savedEvent.id)
    .single();

  if (reloadError) throw reloadError;

  return {
    ...fullEvent,
    sections: Array.isArray(fullEvent.event_sections) ? fullEvent.event_sections[0] ?? {} : fullEvent.event_sections ?? {},
    media_assets: fullEvent.media_assets ?? [],
    video_embeds: fullEvent.video_embeds ?? [],
    guestbook_entries: fullEvent.guestbook_entries ?? [],
  };
}

export async function uploadImageAssetFromBrowser({ eventId, file, kind }) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const storagePath = `events/${eventId}/${kind}/${fileName}`;

  const { error } = await supabase.storage.from(EVENT_MEDIA_BUCKET).upload(storagePath, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(EVENT_MEDIA_BUCKET).getPublicUrl(storagePath);

  return {
    storage_path: storagePath,
    public_url: data.publicUrl,
  };
}

export async function submitGuestbookEntry({ eventId, guest_name, message }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('guestbook_entries')
    .insert({
      event_id: eventId,
      guest_name,
      message,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
