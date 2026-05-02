import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchTime(timeStr: string) {
  // Example: "18:00 02/05/2026"
  try {
    const [time, date] = timeStr.split(" ");
    const [day, month, year] = date.split("/");
    const [hours, minutes] = time.split(":");
    
    const localDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
    
    return localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return timeStr;
  }
}

export function isMatchLive(score: string) {
  return score !== "vs";
}

export function isStartingSoon(timeStr: string) {
  try {
    const [time, date] = timeStr.split(" ");
    const [day, month, year] = date.split("/");
    const [hours, minutes] = time.split(":");
    
    const matchDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
    
    const now = new Date();
    const diff = matchDate.getTime() - now.getTime();
    
    // Within 30 minutes (1800000 ms) and not passed yet
    return diff > 0 && diff <= 1800000;
  } catch (e) {
    return false;
  }
}
