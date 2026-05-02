"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpiryTimerProps {
  expiresAt: string;
  className?: string;
  showIcon?: boolean;
}

export default function ExpiryTimer({
  expiresAt,
  className,
  showIcon = true,
}: ExpiryTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgency, setUrgency] = useState<"critical" | "urgent" | "moderate" | "stable">("stable");

  useEffect(() => {
    function update() {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        setUrgency("critical");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        setTimeLeft(`${Math.floor(hours / 24)}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }

      if (hours < 2) setUrgency("critical");
      else if (hours < 6) setUrgency("urgent");
      else if (hours < 12) setUrgency("moderate");
      else setUrgency("stable");
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const colors = {
    critical: "text-red-500 bg-red-500/10 border-red-500/20",
    urgent: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    moderate: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    stable: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        colors[urgency],
        urgency === "critical" && "animate-pulse",
        className
      )}
    >
      {showIcon && <Clock className="h-3 w-3" />}
      {timeLeft}
    </div>
  );
}
