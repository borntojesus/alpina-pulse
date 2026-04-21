/**
 * Real portraits + logo marks pulled from Freepik MCP on 2026-04-21.
 * Stored under public/avatars/ and public/logos/.
 *
 * Preview-quality (626×417 JPG) — fine for 32-80px thumbs.
 */

export const PORTRAITS: string[] = Array.from({ length: 25 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/avatars/p${n}.jpg`;
});

export const LOGOS: string[] = Array.from({ length: 18 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/logos/l${n}.jpg`;
});

// Distinct set of portraits for reps (first 6 are curated for rep personas)
export const REP_PORTRAITS: Record<string, string> = {
  "rep-1": "/avatars/p05.jpg", // Ava Morales
  "rep-2": "/avatars/p04.jpg", // Diego Park
  "rep-3": "/avatars/p13.jpg", // Priya Shah
  "rep-4": "/avatars/p10.jpg", // Mateo Ricci
  "rep-5": "/avatars/p15.jpg", // Sara Lindqvist
  "rep-6": "/avatars/p25.jpg", // Kenji Tanaka
};

/** Stable per-seed pick. Same input → same image. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function portraitForSeed(seed: string): string {
  return PORTRAITS[hashString(seed) % PORTRAITS.length];
}

export function logoForCompany(company: string): string {
  return LOGOS[hashString(company) % LOGOS.length];
}
