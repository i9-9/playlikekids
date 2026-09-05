type PlayMarkProps = {
  className?: string;
};

/**
 * Frosted circle + white play triangle, centered over video posters.
 */
export function PlayMark({ className = "" }: PlayMarkProps) {
  return (
    <span
      className={`pointer-events-none absolute left-1/2 top-1/2 flex size-[3.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/[0.16] shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-md md:size-16 ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="ml-[7%] h-[42%] w-[42%] fill-white"
      >
        <path d="M8 5.14v13.72L19 12 8 5.14z" />
      </svg>
    </span>
  );
}
