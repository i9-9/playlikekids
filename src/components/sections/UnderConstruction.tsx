import Image from "next/image";

/**
 * Pre-launch holding page (state before the new site commit).
 * Shown in production until NEXT_PUBLIC_UNDER_CONSTRUCTION=false.
 */
export function UnderConstruction() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 font-roboto">
      <div className="relative flex w-[min(62vw,22rem)] flex-col items-center gap-3 animate-[fadeIn_1.2s_ease-out]">
        <Image
          src="/ASSETS/UNDER_CONSTRUCTION/under-construction.png"
          alt="Under Construction"
          width={1868}
          height={1435}
          priority
          className="h-auto w-full"
        />

        <Image
          src="/ASSETS/LOGO_PNG/logo-tierra.png"
          alt="Play Like Kids"
          width={1585}
          height={776}
          priority
          className="h-auto w-full"
        />

        <div
          className="flex w-full flex-col items-start gap-2 text-left"
          style={{ fontWeight: 700 }}
        >
          <a
            href="mailto:hello@playlikekids.tv"
            className="text-[clamp(1rem,2.4vw,1.2rem)] tracking-[0.08em] text-foreground transition-opacity hover:opacity-60"
            style={{ fontWeight: 700 }}
          >
            hello@playlikekids.tv
          </a>
          <p
            className="text-[clamp(0.7rem,1.8vw,0.8rem)] uppercase tracking-[0.12em] text-foreground"
            style={{ fontWeight: 700 }}
          >
            CDMX 2026
          </p>
        </div>
      </div>
    </main>
  );
}
