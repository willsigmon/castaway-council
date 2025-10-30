"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  closesAt: string;
  onComplete?: () => void;
}

export function Countdown({ closesAt, onComplete }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(closesAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        onComplete?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [closesAt, onComplete]);

  if (!timeRemaining) {
    return <span className="text-red-500 font-semibold">Phase Ended</span>;
  }

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <span className="text-sm">Time remaining:</span>
      <span className="font-mono font-semibold">
        {String(timeRemaining.hours).padStart(2, "0")}:
        {String(timeRemaining.minutes).padStart(2, "0")}:
        {String(timeRemaining.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
