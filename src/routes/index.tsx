import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useWeddingData, fallbackGallery } from "@/hooks/useWeddingData";
import { Envelope } from "@/components/wedding/Envelope";
import { Countdown } from "@/components/wedding/Countdown";
import { Divider } from "@/components/wedding/Divider";
import { StackedGallery } from "@/components/wedding/StackedGallery";
import { RsvpForm } from "@/components/wedding/RsvpForm";
import { MapPin, Clock, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Հարսանիք — Հրավեր" },
      { name: "description", content: "Հրավեր մեր հարսանիքին" },
      { property: "og:title", content: "Հարսանիք — Հրավեր" },
    ],
  }),
  component: Index,
});

/**
 * Builds a shareable map URL from explicit map URL or coordinates.
 */
function getMapUrl(event: { map_url: string | null; latitude: number | null; longitude: number | null; address: string }) {
  if (event.map_url) return event.map_url;
  if (event.latitude !== null && event.longitude !== null) {
    return `https://maps.google.com/?q=${event.latitude},${event.longitude}`;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(event.address)}`;
}

/**
 * Shares location through Web Share API when available.
 */
async function shareLocation(title: string, url: string) {
  if (!navigator.share) return;
  try {
    await navigator.share({ title, url });
  } catch {
    // User may cancel share sheet; no action needed.
  }
}

function Index() {
  const { settings, events, loading, error } = useWeddingData();
  const [opened, setOpened] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-soft text-muted-foreground">Բեռնվում է...</div>;
  }
  if (error || !settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-soft text-muted-foreground p-6 text-center">
        <p>Չհաջողվեց կապվել սերվերի հետ։</p>
        <p className="text-xs mt-2 opacity-60">{error}</p>
      </div>
    );
  }

  const gallery = settings.gallery_images.length > 0 ? settings.gallery_images : fallbackGallery;
  const formattedDate = new Date(settings.wedding_date).toLocaleDateString("hy-AM", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      {!opened && <Envelope brideName={settings.bride_name} groomName={settings.groom_name} onOpen={() => setOpened(true)} />}

      <main className={`bg-gradient-soft ${opened ? "animate-float-up" : "opacity-0"}`}>
        {/* Section 1 — couple photo + countdown */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="font-display text-sm tracking-[0.4em] text-primary uppercase mb-4">Հարսանիք</p>
          <h1 className="font-display text-5xl sm:text-7xl text-rose-deep mb-2">
            {settings.groom_name}
          </h1>
          <p className="font-display text-3xl text-primary my-2">&</p>
          <h1 className="font-display text-5xl sm:text-7xl text-rose-deep mb-8">
          {settings.bride_name}
          </h1>

          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-card shadow-romantic mb-8">
            <img src={settings.couple_photo_url!} alt="Զույգը" className="w-full h-full object-cover" width={400} height={400} />
          </div>

          <p className="font-display text-2xl text-rose-deep mb-6">{formattedDate}</p>
          <Countdown date={settings.wedding_date} />
        </section>

        {/* Section 2 — invitation text + 2 images */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <Divider />
            <h2 className="font-display text-4xl sm:text-5xl text-center text-rose-deep mb-4">Հրավեր</h2>
            <div className="grid sm:grid-cols-3 gap-6 items-center mt-12">
              <img src={settings.invitation_image_1!} alt="Ծաղիկներ" loading="lazy" className="rounded-2xl shadow-romantic aspect-square object-cover w-full" />
              <p className="font-display text-xl sm:text-2xl text-center text-rose-deep leading-relaxed px-2">
                {settings.invitation_text}
              </p>
              <img src={settings.invitation_image_2!} alt="Մատանիներ" loading="lazy" className="rounded-2xl shadow-romantic aspect-square object-cover w-full" />
            </div>
          </div>
        </section>

        {/* Section 3 — stacked gallery */}
        <section className="bg-blush/40">
          <div className="text-center pt-20 px-6">
            <Divider />
            <h2 className="font-display text-4xl sm:text-5xl text-rose-deep">Մեր պատմությունը</h2>
          </div>
          <StackedGallery images={gallery} />
        </section>

        {/* Section 4 — events */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <Divider />
            <h2 className="font-display text-4xl sm:text-5xl text-center text-rose-deep mb-12">Որտեղ եւ ե՞րբ</h2>
            <div className="space-y-6">
              {events.map((ev) => {
                const t = new Date(ev.event_time);
                const mapUrl = getMapUrl(ev);
                return (
                  <div key={ev.id} className="bg-card rounded-2xl p-6 shadow-romantic border border-primary/15 flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-32 flex-shrink-0 text-center sm:text-left">
                      <p className="font-display text-3xl text-primary">{t.toLocaleTimeString("hy-AM", { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{t.toLocaleDateString("hy-AM", { day: "numeric", month: "short" })}</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-2xl text-rose-deep mb-1">{ev.title}</h3>
                      <p className="text-sm text-foreground/80 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" />{ev.address}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-md border border-primary/30 px-3 py-1.5 text-xs text-primary hover:bg-primary/10"
                        >
                          Բացել քարտեզում
                        </a>
                        {typeof navigator !== "undefined" && navigator.share && (
                          <button
                            type="button"
                            onClick={() => shareLocation(ev.title, mapUrl)}
                            className="inline-flex items-center rounded-md border border-primary/30 px-3 py-1.5 text-xs text-primary hover:bg-primary/10"
                          >
                            Կիսվել հասցեով
                          </button>
                        )}
                      </div>
                      {ev.description && <p className="text-sm text-muted-foreground mt-2">{ev.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 5 — RSVP */}
        <section className="py-20 px-6 bg-blush/40">
          <Divider />
          <h2 className="font-display text-4xl sm:text-5xl text-center text-rose-deep mb-3">Հաստատեք ներկայությունը</h2>
          <p className="text-center text-muted-foreground mb-10">Խնդրում ենք լրացնել ստորեւ բերված ձեւը</p>
          {!submitted ? (
            <RsvpForm events={events} onDone={() => setSubmitted(true)} />
          ) : (
            <div className="max-w-md mx-auto text-center bg-card rounded-3xl p-10 shadow-romantic border border-primary/20">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4 fill-primary/30" />
              <p className="font-display text-2xl text-rose-deep">Ստացված է!</p>
            </div>
          )}
        </section>

        {/* Section 6 — thank you */}
        <section className="py-24 px-6 text-center">
          <Divider />
          <Heart className="w-16 h-16 text-primary mx-auto mb-6 fill-primary/40" />
          <h2 className="font-display text-5xl sm:text-6xl text-rose-deep mb-4">{settings.thank_you_text}</h2>
          <p className="font-display text-2xl text-primary">
            {settings.bride_name} <span className="mx-2">&</span> {settings.groom_name}
          </p>
        </section>
      </main>
    </>
  );
}
