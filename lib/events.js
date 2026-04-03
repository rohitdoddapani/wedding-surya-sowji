import { defaultEvent } from '@/lib/default-event';
import { normalizeEventRelations } from '@/lib/events-shared';
import { createAdminClient, createClient } from '@/utils/supabase/server';

async function fetchEventBy(column, value, requirePublished = false) {
  const supabase = await createClient();
  let query = supabase
    .from('events')
    .select(`
      *,
      event_sections (*),
      media_assets (*),
      video_embeds (*),
      guestbook_entries (*)
    `)
    .eq(column, value);

  if (requirePublished) {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    return null;
  }

  return normalizeEventRelations(data);
}

export async function getEventForPublicBySlug(slug) {
  const event = await fetchEventBy('slug', slug, true);
  return event ?? (slug === defaultEvent.slug ? defaultEvent : null);
}

export async function getEventForDashboardById(id) {
  return fetchEventBy('id', id, false);
}

export async function listEventsForCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('events')
    .select('id, title, slug, status, updated_at')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function resolveEventSlugFromHost(hostname) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname : null;
  const isLocalhost = hostname.includes('localhost');

  if (isLocalhost || !hostname.endsWith('.ourbigday.io')) {
    return null;
  }

  if (siteUrl && hostname === siteUrl) {
    return null;
  }

  const slug = hostname.replace('.ourbigday.io', '');
  if (!slug || slug === 'www') {
    return null;
  }

  return slug;
}

export async function getEventForPublicHostname(hostname) {
  const slug = await resolveEventSlugFromHost(hostname);
  if (!slug) return null;
  return getEventForPublicBySlug(slug);
}

export async function seedDemoEventForUser(userId) {
  const admin = createAdminClient();
  if (!admin || !userId) return;

  const { data: existing } = await admin
    .from('events')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const event = {
    id: defaultEvent.id,
    owner_id: userId,
    event_type: defaultEvent.event_type,
    slug: `${defaultEvent.slug}-${userId.slice(0, 6)}`,
    title: defaultEvent.title,
    hosts_display_name: defaultEvent.hosts_display_name,
    headline: defaultEvent.headline,
    description: defaultEvent.description,
    event_datetime_utc: defaultEvent.event_datetime_utc,
    event_timezone: defaultEvent.event_timezone,
    venue_name: defaultEvent.venue_name,
    venue_address: defaultEvent.venue_address,
    maps_url: defaultEvent.maps_url,
    theme_key: defaultEvent.theme_key,
    status: 'draft',
  };

  await admin.from('events').upsert(event);
}
