create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null default 'wedding',
  slug text not null unique,
  title text not null,
  hosts_display_name text not null,
  headline text,
  description text,
  event_datetime_utc timestamptz not null,
  event_timezone text not null,
  venue_name text,
  venue_address text,
  maps_url text,
  theme_key text not null default 'rose-gold',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_sections (
  event_id uuid primary key references public.events (id) on delete cascade,
  hero_enabled boolean not null default true,
  livestream_enabled boolean not null default true,
  story_video_enabled boolean not null default true,
  gallery_enabled boolean not null default true,
  location_enabled boolean not null default true,
  guestbook_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  kind text not null check (kind in ('hero', 'poster', 'gallery', 'cover')),
  source_type text not null check (source_type in ('upload', 'external_url')),
  storage_path text,
  external_url text,
  public_url text not null,
  caption text,
  alt_text text,
  sort_order integer not null default 0,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  constraint media_assets_source_check check (
    (source_type = 'upload' and storage_path is not null and external_url is null)
    or
    (source_type = 'external_url' and external_url is not null and storage_path is null)
  )
);

create table if not exists public.video_embeds (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  section_key text not null check (section_key in ('livestream', 'pre_wedding')),
  provider text not null check (provider in ('youtube', 'vimeo', 'google-drive')),
  url text not null,
  embed_url text not null,
  title text not null,
  description text,
  thumbnail_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  guest_name text not null default 'Anonymous',
  message text not null,
  status text not null default 'approved' check (status in ('approved', 'pending', 'removed')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_sections enable row level security;
alter table public.media_assets enable row level security;
alter table public.video_embeds enable row level security;
alter table public.guestbook_entries enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_upsert_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "events_owner_all" on public.events
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "events_public_read_published" on public.events
  for select using (status = 'published');

create policy "sections_owner_all" on public.event_sections
  for all using (
    exists (
      select 1 from public.events
      where public.events.id = event_sections.event_id
      and public.events.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events
      where public.events.id = event_sections.event_id
      and public.events.owner_id = auth.uid()
    )
  );

create policy "sections_public_read" on public.event_sections
  for select using (
    exists (
      select 1 from public.events
      where public.events.id = event_sections.event_id
      and public.events.status = 'published'
    )
  );

create policy "media_owner_all" on public.media_assets
  for all using (
    exists (
      select 1 from public.events
      where public.events.id = media_assets.event_id
      and public.events.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events
      where public.events.id = media_assets.event_id
      and public.events.owner_id = auth.uid()
    )
  );

create policy "media_public_read" on public.media_assets
  for select using (
    exists (
      select 1 from public.events
      where public.events.id = media_assets.event_id
      and public.events.status = 'published'
    )
  );

create policy "videos_owner_all" on public.video_embeds
  for all using (
    exists (
      select 1 from public.events
      where public.events.id = video_embeds.event_id
      and public.events.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events
      where public.events.id = video_embeds.event_id
      and public.events.owner_id = auth.uid()
    )
  );

create policy "videos_public_read" on public.video_embeds
  for select using (
    exists (
      select 1 from public.events
      where public.events.id = video_embeds.event_id
      and public.events.status = 'published'
    )
  );

create policy "guestbook_owner_all" on public.guestbook_entries
  for all using (
    exists (
      select 1 from public.events
      where public.events.id = guestbook_entries.event_id
      and public.events.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events
      where public.events.id = guestbook_entries.event_id
      and public.events.owner_id = auth.uid()
    )
  );

create policy "guestbook_public_read" on public.guestbook_entries
  for select using (
    status = 'approved'
    and exists (
      select 1 from public.events
      where public.events.id = guestbook_entries.event_id
      and public.events.status = 'published'
    )
  );

create policy "guestbook_public_insert" on public.guestbook_entries
  for insert with check (
    exists (
      select 1 from public.events
      join public.event_sections on public.event_sections.event_id = public.events.id
      where public.events.id = guestbook_entries.event_id
      and public.events.status = 'published'
      and public.event_sections.guestbook_enabled = true
    )
  );

insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do nothing;

create policy "event_media_public_read" on storage.objects
  for select using (bucket_id = 'event-media');

create policy "event_media_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'event-media'
    and auth.uid() is not null
  );

create policy "event_media_owner_update" on storage.objects
  for update using (
    bucket_id = 'event-media'
    and auth.uid() is not null
  );

create policy "event_media_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'event-media'
    and auth.uid() is not null
  );
