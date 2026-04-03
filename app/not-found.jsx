import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">OurBigDay</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-950">We couldn&apos;t find that page.</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        The event may still be in draft mode, or the link may be incorrect.
      </p>
      <Link href="/" className="mt-8 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white">
        Back to home
      </Link>
    </main>
  );
}
