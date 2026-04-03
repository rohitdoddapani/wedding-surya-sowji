import { notFound, redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard-shell';
import EventStudio from '@/components/event-studio';
import { getEventForDashboardById } from '@/lib/events';
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata({ params }) {
  const resolved = await params;
  const event = await getEventForDashboardById(resolved.id);

  return {
    title: event ? `Edit ${event.title} | OurBigDay` : 'Event Not Found | OurBigDay',
  };
}

export default async function EditEventPage({ params }) {
  const resolved = await params;
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

  const event = await getEventForDashboardById(resolved.id);
  if (!event) {
    notFound();
  }

  return (
    <DashboardShell user={user} profile={profile}>
      <EventStudio initialEvent={event} mode="edit" />
    </DashboardShell>
  );
}
