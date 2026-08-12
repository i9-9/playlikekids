import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
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

        <div className="flex w-full flex-col items-start gap-2 text-left">
          <a
            href="mailto:hello@playlikekids.tv"
            className="text-[clamp(1rem,2.4vw,1.2rem)] uppercase tracking-[0.16em] text-foreground transition-opacity hover:opacity-60"
          >
            hello@playlikekids.tv
          </a>
          <p className="text-[clamp(0.7rem,1.8vw,0.8rem)] uppercase tracking-[0.22em] text-foreground/45">
            CDMX 2026
          </p>
        </div>
      </div>
    </main>
  );
}
