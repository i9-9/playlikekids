import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404",
};

export default function NotFound() {
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
      <h1 className="font-druk text-[clamp(4.5rem,18vw,8.5rem)] leading-none">
        404
      </h1>
      <p className="font-roboto text-nav font-bold uppercase tracking-wide">
        Page not found
      </p>
    </main>
  );
}
