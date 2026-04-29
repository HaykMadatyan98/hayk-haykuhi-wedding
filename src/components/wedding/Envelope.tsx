import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export function Envelope({ brideName, groomName, onOpen }: { brideName: string; groomName: string; onOpen: () => void }) {
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    setOpening(true);
    setTimeout(onOpen, 1400);
  };

  // floating petals
  const petals = Array.from({ length: 14 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-soft overflow-hidden">
      {petals.map((_, i) => (
        <span
          key={i}
          className="absolute -top-[30px] text-primary/40 animate-petal"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${12 + Math.random() * 18}px`,
            animationDuration: `${8 + Math.random() * 8}s`,
            animationDelay: `${Math.random() * 6}s`,
          }}
        >
          ❀
        </span>
      ))}

      <button
        onClick={handleOpen}
        className={`group relative transition-all duration-1000 ${opening ? "scale-125 opacity-0 -translate-y-20" : "hover:scale-105"}`}
        aria-label="Բացել հրավերը"
      >
        <div className="relative w-[320px] h-[220px] sm:w-[420px] sm:h-[280px]">
          {/* envelope body */}
          <div className="absolute inset-0 rounded-lg bg-card shadow-romantic border border-primary/30" />
          {/* envelope flap */}
          <div
            className={`absolute inset-x-0 top-0 origin-top transition-transform duration-1000 ${opening ? "[transform:rotateX(-180deg)]" : ""}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <svg viewBox="0 0 420 160" className="w-full">
              <polygon points="0,0 210,160 420,0" fill="oklch(0.94 0.04 10)" stroke="oklch(0.7 0.14 5 / 0.4)" strokeWidth="1.5" />
            </svg>
          </div>
          {/* heart seal */}
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity ${opening ? "opacity-0" : "opacity-100"}`}>
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
            </div>
          </div>
        </div>
        <p className="mt-8 font-display text-3xl sm:text-4xl text-rose-deep tracking-wide">
          {groomName} <span className="text-primary mx-2">&</span> {brideName}
        </p>
        <p className="mt-3 text-sm text-muted-foreground tracking-widest uppercase">Սեղմեք բացելու համար</p>
      </button>
    </div>
  );
}
