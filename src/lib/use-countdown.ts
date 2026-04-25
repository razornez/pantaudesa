import { useEffect, useState } from "react";

export function useCountdown(targetDate: Date | null): number {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!targetDate) { setSecs(0); return; }
    const tick = () => setSecs(Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return secs;
}
