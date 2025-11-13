import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(value: number | null | undefined) {
  if (value == null) return "NR";
  return `${Math.round(value * 10) / 10}`;
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "TBA";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "TBA";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getYear(date: string | null | undefined) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return String(parsed.getFullYear());
}

export function formatRuntime(minutes: number | null | undefined) {
  if (!minutes || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

