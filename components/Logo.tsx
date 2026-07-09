import Image from "next/image";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const isMd = size === "md";

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className={isMd ? "w-16 h-16 relative" : "w-10 h-10 relative"}>
        <Image src="/logo.png" alt="Escudo de The Real Show" fill sizes="64px" className="object-contain" />
      </div>
      <span
        className={`font-display font-bold tracking-wide text-white ${isMd ? "text-2xl" : "text-lg"}`}
      >
        THE REAL <span className="text-pitch-500">SHOW</span>
      </span>
    </div>
  );
}
