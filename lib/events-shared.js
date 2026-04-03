import { normalizeVideoUrl } from '@/lib/video-embeds';

export function createMediaAsset({
  eventId,
  kind,
  sourceType,
  publicUrl,
  storagePath = null,
  externalUrl = null,
  caption = '',
  altText = '',
  sortOrder = 0,
}) {
  return {
    id: crypto.randomUUID(),
    event_id: eventId,
    kind,
    source_type: sourceType,
    storage_path: storagePath,
    external_url: externalUrl,
    public_url: publicUrl,
    caption,
    alt_text: altText,
    sort_order: sortOrder,
    width: null,
    height: null,
    created_at: new Date().toISOString(),
  };
}

export function createVideoRecord({ eventId, sectionKey, url, title, description = '', sortOrder = 0 }) {
  const normalized = normalizeVideoUrl(url);
  return {
    id: crypto.randomUUID(),
    event_id: eventId,
    section_key: sectionKey,
    provider: normalized.provider,
    url,
    embed_url: normalized.embedUrl,
    title,
    description,
    thumbnail_url: normalized.thumbnailUrl,
    sort_order: sortOrder,
  };
}

export function normalizeEventRelations(event) {
  if (!event) return null;

  const sectionSource = Array.isArray(event.event_sections) ? event.event_sections[0] : event.event_sections;

  return {
    ...event,
    sections: sectionSource ?? event.sections ?? {},
    media_assets: event.media_assets ?? [],
    video_embeds: event.video_embeds ?? [],
    guestbook_entries: (event.guestbook_entries ?? []).filter((entry) => entry.status !== 'removed'),
  };
}
