import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind CSS classes
 * This utility helps prevent class conflicts when using dynamic class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
