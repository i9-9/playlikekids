import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="relative flex flex-col items-center gap-0 animate-[fadeIn_1.2s_ease-out]">
        <Image
          src="/ASSETS/LOGO_PNG/1_Logotipo_PLK_color-negro.png"
          alt="Play Like Kids"
          width={2000}
          height={1319}
          priority
          className="h-auto w-[min(72vw,28rem)]"
        />

        <div className="relative -mt-4 flex flex-col items-center gap-2 text-center">
          <a
            href="mailto:hello@playlikekids.tv"
            className="text-[clamp(1.25rem,3.5vw,1.75rem)] uppercase tracking-[0.16em] text-foreground transition-opacity hover:opacity-60"
          >
            hello@playlikekids.tv
          </a>
          <p className="text-[clamp(0.75rem,2vw,0.9rem)] uppercase tracking-[0.22em] text-foreground/45">
            CDMX 2026
          </p>
        </div>
      </div>
    </main>
  );
}
