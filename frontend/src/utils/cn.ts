import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Ensure tailwind-merge is installed or just use clsx if we don't have it.
// I didn't install tailwind-merge, so I will just use clsx.
