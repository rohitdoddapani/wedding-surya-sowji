import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard-shell';
import EventStudio from '@/components/event-studio';
import { createBlankEvent } from '@/lib/default-event';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Create Event | OurBigDay',
};

export default async function NewEventPage() {
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

  const event = createBlankEvent(user.id);

  return (
    <DashboardShell user={user} profile={profile}>
      <EventStudio initialEvent={event} mode="create" />
    </DashboardShell>
  );
}
