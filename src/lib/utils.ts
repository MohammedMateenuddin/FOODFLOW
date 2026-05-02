import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeLeft(expiresAt: string): string {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getUrgencyColor(expiresAt: string): string {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const hoursLeft = (expiry - now) / (1000 * 60 * 60);

  if (hoursLeft < 2) return "text-red-500";
  if (hoursLeft < 6) return "text-orange-500";
  if (hoursLeft < 12) return "text-yellow-500";
  return "text-emerald-500";
}

export function getUrgencyBadge(expiresAt: string): { label: string; variant: "destructive" | "default" | "secondary" | "outline" } {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const hoursLeft = (expiry - now) / (1000 * 60 * 60);

  if (hoursLeft < 2) return { label: "CRITICAL", variant: "destructive" };
  if (hoursLeft < 6) return { label: "URGENT", variant: "destructive" };
  if (hoursLeft < 12) return { label: "MODERATE", variant: "default" };
  return { label: "STABLE", variant: "secondary" };
}
