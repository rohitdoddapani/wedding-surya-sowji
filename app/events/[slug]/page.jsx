import { notFound } from 'next/navigation';
import PublicEventPage from '@/components/public-event-page';
import { getEventForPublicBySlug } from '@/lib/events';

export async function generateMetadata({ params }) {
  const resolved = await params;
  const event = await getEventForPublicBySlug(resolved.slug);

  if (!event) {
    return {
      title: 'Event Not Found | OurBigDay',
    };
  }

  const hero = event.media_assets.find((asset) => asset.kind === 'hero') || event.media_assets[0];

  return {
    title: `${event.title} | OurBigDay`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: hero?.public_url ? [{ url: hero.public_url }] : [],
    },
  };
}

export default async function PublicEventRoute({ params }) {
  const resolved = await params;
  const event = await getEventForPublicBySlug(resolved.slug);

  if (!event) {
    notFound();
  }

  return <PublicEventPage initialEvent={event} />;
}
