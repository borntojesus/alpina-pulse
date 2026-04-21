import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AVATAR_BG = ["1e3a8a", "0f172a", "155e75", "164e63", "134e4a", "1e1b4b"];

export function avatarUrl(
  seed: string,
  variant: "lead" | "rep" = "lead",
): string {
  const style = variant === "rep" ? "notionists" : "notionists-neutral";
  const bgIndex =
    Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    AVATAR_BG.length;
  const bg = AVATAR_BG[bgIndex];
  const s = encodeURIComponent(seed);
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${s}&backgroundColor=${bg}&radius=50`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
