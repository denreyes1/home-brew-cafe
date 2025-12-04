import { useEffect, useMemo, useState } from "react";
import qr from "@/assets/qr.png";

const Snowfall = () => {
  const flakes = useMemo(
    () =>
      Array.from({ length: 40 }).map(() => ({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * -12}s`,
        animationDuration: `${8 + Math.random() * 10}s`,
      })),
    [],
  );

  return (
    <div className="snowfall-layer">
      {flakes.map((style, idx) => (
        <span key={idx} className="snowflake" style={style}>
          ✦
        </span>
      ))}
    </div>
  );
};

const Qr = () => {
  const bulbs = Array.from({ length: 9 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;

    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => {
        // ignore failures (e.g. user gesture requirements)
      });
    } else if (document.exitFullscreen) {
      void document.exitFullscreen().catch(() => {
        // ignore failures
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-hero text-foreground">
      <Snowfall />

      {/* Soft vignette & color wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsla(35,70%,60%,0.22),transparent_55%),radial-gradient(circle_at_bottom,_hsla(140,40%,40%,0.25),transparent_55%)] opacity-80 mix-blend-soft-light" />

      {/* Floating festive orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="qr-orb qr-orb--red" />
        <div className="qr-orb qr-orb--green" />
        <div className="qr-orb qr-orb--gold" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 pb-16 pt-16">
        {/* Garland of twinkling lights */}
        <div className="qr-light-garland mb-6 md:mb-8">
          {bulbs.map((_, idx) => {
            const palette = ["qr-light--red", "qr-light--gold", "qr-light--green"];
            const tone = palette[idx % palette.length];
            return (
              <div
                key={idx}
                className={`qr-light ${tone}`}
                style={{ animationDelay: `${idx * 0.18}s` }}
              />
            );
          })}
        </div>

        {/* QR focal card */}
        <section className="relative w-full max-w-md">
          <div className="qr-glow-ring" />

          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/7 via-transparent to-black/20 mix-blend-soft-light" />

            <div className="space-y-4 text-center">
              <p className="text-[0.7rem] uppercase tracking-[0.26em] text-muted-foreground">
                Scan to begin
              </p>
              <h1 className="text-2xl md:text-3xl">
                Welcome to
                <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                D&A Café
                </h1>
              </h1>
              <p className="mx-auto max-w-sm text-xs md:text-sm text-muted-foreground">
                Point your camera at the code below to step into our home
                of drinks.
              </p>
            </div>

            <div className="mt-7 flex justify-center">
              <div className="relative inline-flex items-center justify-center rounded-2xl border border-border/70 bg-background/95 p-4 shadow-[0_0_0_1px_hsl(0_0%_100%/0.06)]">
                <div className="pointer-events-none absolute inset-3 rounded-2xl border border-white/10" />
                <img
                  src={qr}
                  alt="Scan to view the D&A Home Café menu"
                  className="relative z-10 max-h-[260px] w-full max-w-[260px] rounded-xl bg-white object-contain shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-1 text-center">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-foreground/80">
                Best experienced with something warm in hand
              </p>
              <p className="text-[0.7rem] text-muted-foreground/80">
                If the QR doesn&apos;t scan, increase your screen brightness and try again.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Fullscreen toggle button */}
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
        className="fixed bottom-4 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground/90 shadow-md backdrop-blur hover:border-primary/70 hover:text-primary transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden="true"
        >
          {isFullscreen ? (
            <path
              d="M9 3H4v5m11-5h5v5M4 16v5h5m11-5v5h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M14 3h6v6M10 3H4v6m0 6v6h6m14-6v6h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>
    </div>
  );
};

export default Qr;


