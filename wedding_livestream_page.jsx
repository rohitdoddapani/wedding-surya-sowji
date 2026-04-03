import { useState, useEffect } from 'react';

export default function WeddingLivestreamPage() {
  const indiaTime = "April 1, 2026 • 8:49 PM IST";
  
  const [localTime, setLocalTime] = useState("");
  const [wishes, setWishes] = useState([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(true);
  const [newWish, setNewWish] = useState("");
  const [wishName, setWishName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Event time in IST: April 1, 2026, 20:49:00 IST (UTC+5:30)
    const eventDate = new Date("2026-04-01T15:19:00Z");
    const options = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true,
      timeZoneName: 'short'
    };
    setLocalTime(eventDate.toLocaleString(undefined, options));
  }, []);

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbzdQtL02yT43niaq3ZsvZsZSX6cHfJlpTlGriGbtvkACfif6w3kGMcHLiQQ9qysfcPk8A/exec");
        const data = await response.json();
        setWishes(data);
      } catch (error) {
        console.error("Failed to fetch wishes", error);
        // Fallback to static text if Google Sheets fails or isn't set up yet
        setWishes([
          { id: 'fallback', name: "Anonymous", text: "Wishing you a lifetime of happiness together!" }
        ]);
      } finally {
        setIsLoadingWishes(false);
      }
    };
    
    fetchWishes();
  }, []);

  const handleAddWish = async (e) => {
    e.preventDefault();
    if (!newWish.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    const guestName = wishName.trim() ? wishName : "Anonymous";
    const wishText = newWish.trim();
    
    const wish = {
      id: Date.now(),
      name: guestName,
      text: wishText
    };
    
    setWishes([wish, ...wishes]);
    setNewWish("");
    setWishName("");

    try {
      await fetch("https://script.google.com/macros/s/AKfycbzdQtL02yT43niaq3ZsvZsZSX6cHfJlpTlGriGbtvkACfif6w3kGMcHLiQQ9qysfcPk8A/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({ name: guestName, wish: wishText })
      });
    } catch (error) {
      console.error("Failed to save to Google Sheets", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const posters = [
    {
      title: "Pre-Wedding Moment",
      subtitle: "A special memory before the big day",
      image: "https://i.ibb.co/V0WvM7Hv/A7408826.jpg",
    },
    {
      title: "Together at Home",
      subtitle: "A beautiful candid frame",
      image: "https://i.ibb.co/YTZ4pwCD/A7408835-copy.jpg",
    },
    {
      title: "Elegant Couple Portrait",
      subtitle: "A graceful celebration shot",
      image: "https://i.ibb.co/Kpy2px7n/A7409011.jpg",
    },
    {
      title: "Classic Piano Shot",
      subtitle: "A warm and timeless portrait",
      image: "https://i.ibb.co/tTz6cvnR/A7409069.jpg",
    },
    {
      title: "Bride Portrait III",
      subtitle: "A beautiful staircase portrait",
      image: "https://i.ibb.co/S4gYV8bY/A7409102.jpg",
    },
    {
      title: "Vintage Car Portrait",
      subtitle: "A stylish evening look",
      image: "https://i.ibb.co/PSdxXh0/A7409103.jpg",
    },
    {
      title: "Vintage Car Frame",
      subtitle: "A grand and memorable shot",
      image: "https://i.ibb.co/FLX6F6rn/A7409108.jpg",
    },
    {
      title: "Wedding Portrait",
      subtitle: "A beautiful frame of the couple",
      image: "https://i.ibb.co/TqN3c830/DSC04276.jpg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % posters.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [posters.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 text-slate-800">
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
                Celebrating the wedding live from Tanuku, India
              </p>
              <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                Celebrating Raja Surya & Bala Sowjanya's Wedding
                <span className="block text-rose-600">Live with Family & Friends</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                Welcome to the wedding celebration of Raja Surya and Bala Sowjanya. Watch the live stream, view the wedding posters, and share this page easily with family and friends.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://www.youtube.com/live/Dn1fsQ9gmNM?si=ybuZr9VBW2lqx_Jf"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  Watch Live on YouTube
                </a>
                <a
                  href="#posters"
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5"
                >
                  View Wedding Posters
                </a>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-rose-100 bg-white/90 p-5 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">India Time</div>
                  <div className="mt-1 text-lg font-semibold">{indiaTime}</div>
                  <div className="mt-1 text-sm text-slate-500">Tanuku, Andhra Pradesh</div>
                </div>
                <div className="rounded-3xl border border-orange-100 bg-white/90 p-5 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">Your Local Time</div>
                  <div className="mt-1 text-lg font-semibold">{localTime || "Calculating..."}</div>
                  <div className="mt-1 text-sm text-slate-500">Auto-converted for you</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="relative h-[452px] w-full rounded-[2rem] border border-white/60 bg-white p-4 shadow-xl">
                <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-rose-50">
                  {posters.map((poster, index) => (
                    <img
                      key={poster.title}
                      src={poster.image}
                      alt={poster.title}
                      className={`absolute left-0 top-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-[2rem] border border-rose-100 bg-rose-50/40 p-6 shadow-sm md:p-8">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="order-2 overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-inner md:order-1">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src="https://player.vimeo.com/video/1178997927?title=0&byline=0&portrait=0&color=e11d48"
                  title="Pre-Wedding Video"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <h2 className="text-2xl font-semibold md:text-3xl text-rose-950">Our Pre-Wedding Journey</h2>
              <p className="mt-3 text-slate-600">
                A glimpse into our beautiful moments together before the big day. We are so incredibly excited to share our story and this new chapter with all of you!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-4">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">Live Stream</h2>
              <p className="mt-3 text-slate-600">
                Join us live as we exchange our vows and start our new journey together! You can watch the full ceremony broadcast right here, no matter where you are in the world.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="https://www.youtube.com/live/Dn1fsQ9gmNM?si=ybuZr9VBW2lqx_Jf"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  Open Live Link
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent("Join us live for the wedding celebration of Raja Surya & Bala Sowjanya: https://www.youtube.com/live/Dn1fsQ9gmNM?si=ybuZr9VBW2lqx_Jf")}`}
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
                  src="https://www.youtube.com/embed/Dn1fsQ9gmNM"
                  title="Wedding livestream preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="posters" className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">Wedding Posters</h2>
            <p className="mt-2 text-slate-600">
              You can upload your invite poster, couple poster, haldi/mehendi poster, or reception art here.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster) => (
            <div key={poster.title} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1">
              <img src={poster.image} alt={poster.title} className="h-72 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-lg font-semibold">{poster.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{poster.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Location</div>
            <div className="mt-2 text-xl font-semibold">Join us in Tanuku</div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              With great joy in our hearts, we invite you to be a part of our wedding and celebrate this special day with us.<br/><br/>
              Your presence and blessings would truly mean a lot. ❤️
            </p>
            <a 
              href="https://maps.app.goo.gl/r4ZCnPRcyzhFv6pt5?g_st=iw" 
              target="_blank" 
              rel="noreferrer"
              className="mt-4 inline-block font-semibold text-rose-600 hover:text-rose-700"
            >
              📍 Open Google Maps
            </a>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">For Overseas Family</div>
            <div className="mt-2 text-xl font-semibold">One Easy Link</div>
            <p className="mt-2 text-slate-600">Share this page in WhatsApp so people can find the stream quickly.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Blessings</div>
            <div className="mt-2 text-xl font-semibold">Messages & Wishes</div>
            <p className="mt-2 text-slate-600">Leave a wish or blessing for the couple below.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Guestbook & Wishes</h2>
          <p className="mt-2 text-slate-600">Share your blessings with Raja Surya & Bala Sowjanya.</p>
        </div>

        <form onSubmit={handleAddWish} className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Name (Optional)</label>
              <input
                type="text"
                id="name"
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                placeholder="Leave blank to post anonymously"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              />
            </div>
            <div>
              <label htmlFor="wish" className="mb-1 block text-sm font-medium text-slate-700">Your Wish</label>
              <textarea
                id="wish"
                required
                value={newWish}
                onChange={(e) => setNewWish(e.target.value)}
                placeholder="Write your wishes here..."
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post Wish"}
            </button>
          </div>
        </form>

        <div className="grid gap-4">
          {isLoadingWishes ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 animate-pulse">
              Loading beautiful wishes from family and friends...
            </div>
          ) : wishes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Be the first to share your blessings!
            </div>
          ) : (
            wishes.map((wish) => (
              <div key={wish.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-slate-700">"{wish.text}"</p>
                <p className="mt-3 text-sm font-medium text-rose-600">— {wish.name}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="mt-10 border-t border-slate-200 bg-white/80">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-slate-500">
          Made with love for Raja Surya & Bala Sowjanya's wedding celebration.
        </div>
      </footer>
    </div>
  );
}
