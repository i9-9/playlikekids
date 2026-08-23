type PlayMarkProps = {
  className?: string;
};

/**
 * Circle + white play triangle, centered over video posters.
 */
export function PlayMark({ className = "" }: PlayMarkProps) {
  return (
    <span
      className={`pointer-events-none absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-black/60 md:size-20 ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="ml-1 h-10 w-10 fill-white md:ml-1.5 md:h-12 md:w-12"
      >
        <path d="M8 5.14v13.72L19 12 8 5.14z" />
      </svg>
    </span>
  );
}
