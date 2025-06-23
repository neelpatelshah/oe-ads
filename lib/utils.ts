import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRIMARY_COLOR = "#E4643D";

export const AD_COLLECTION_NAME = "ads";
export const PHYSICIAN_COLLECTION_NAME = "physician_profiles";
