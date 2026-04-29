import { useEffect, useRef, useState } from "react";

export function StackedGallery({ images }: { images: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setProgress(passed / Math.max(total, 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const list = images.length > 0 ? images : [];
  return (
    <div ref={containerRef} style={{ height: `${list.length * 80}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {list.map((src, i) => {
          const localProgress = Math.min(Math.max(progress * list.length - i, 0), 1);
          const translateY = (1 - localProgress) * 60;
          const scale = 0.85 + localProgress * 0.15;
          const rotate = (i % 2 === 0 ? -1 : 1) * (4 - localProgress * 4);
          const z = i;
          return (
            <img
              key={i}
              src={src}
              alt={`Զույգի լուսանկար ${i + 1}`}
              loading="lazy"
              className="absolute w-[78vw] max-w-[420px] aspect-[3/4] object-cover rounded-3xl shadow-romantic border-4 border-card"
              style={{
                transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                opacity: 0.4 + localProgress * 0.6,
                zIndex: z,
                transition: "opacity 200ms",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
