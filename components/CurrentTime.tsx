"use client";

import { useEffect, useState } from "react";

export default function CurrentTime() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        day: '2-digit',
        month: 'short',
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span className="text-sm text-muted-foreground">{time}</span>;
}
