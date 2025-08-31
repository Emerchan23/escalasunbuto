import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { Professional, ScheduleEntry } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAutomaticSchedule(days: Date[], professionals: Professional[]): ScheduleEntry[] {
  if (professionals.length === 0) {
    return [];
  }

  const entries: ScheduleEntry[] = [];
  
  days.forEach((day, index) => {
    // Distribute professionals in sequence
    const professionalIndex = index % professionals.length;
    const professional = professionals[professionalIndex];
    
    entries.push({
      date: format(day, "yyyy-MM-dd"),
      professionalId: professional.id,
      hours: 12 // Default hours
    });
  });
  
  return entries;
}
