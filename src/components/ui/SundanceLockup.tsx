import Image from "next/image";

type SundanceLockupProps = {
  className?: string;
};

/**
 * Official Sundance Official Selection laurel. Sized to the Gabriela artboard:
 * ~32% of the 16:9 frame, inset ~3.5% from the top-left.
 */
export function SundanceLockup({ className = "" }: SundanceLockupProps) {
  return (
    <Image
      src="/badges/sundance-official-selection.png"
      alt=""
      width={702}
      height={309}
      sizes="(max-width: 768px) 32vw, 18vw"
      className={`pointer-events-none absolute left-[3.5%] top-[3.7%] z-10 h-auto w-[32%] select-none ${className}`}
      aria-hidden
    />
  );
}
