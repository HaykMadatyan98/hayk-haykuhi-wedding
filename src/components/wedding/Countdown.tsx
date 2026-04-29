import { useEffect, useState } from "react";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({ date }: { date: string }) {
  const target = new Date(date);
  const [t, setT] = useState(diff(target));
  useEffect(() => {
    const i = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(i);
  }, [date]);

  const labels = [
    { v: t.days, l: "Օր" },
    { v: t.hours, l: "Ժամ" },
    { v: t.minutes, l: "Րոպե" },
    { v: t.seconds, l: "Վրկ" },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-6">
      {labels.map((x) => (
        <div key={x.l} className="flex flex-col items-center bg-card/80 backdrop-blur rounded-2xl px-4 py-3 sm:px-6 sm:py-4 border border-primary/20 shadow-romantic min-w-[72px]">
          <span className="font-display text-3xl sm:text-5xl text-rose-deep tabular-nums">{String(x.v).padStart(2, "0")}</span>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-1">{x.l}</span>
        </div>
      ))}
    </div>
  );
}
