/**
 * Admin-PIN haandtering.
 *
 * PIN gemmes ALDRIG som klartekst - kun som en saltet SHA-256-hash via
 * Web Crypto API (SubtleCrypto), som er indbygget i browseren og koerer
 * lokalt. Dette er et demo-sikkerhedsniveau, ikke militaergodkendt
 * kryptering - se advarslen vist i UI'et.
 */

export const DEFAULT_DEMO_PIN = "1234";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return toHex(bytes.buffer);
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export async function createPinHash(pin: string): Promise<{ hash: string; salt: string }> {
  const salt = randomSalt();
  const hash = await hashPin(pin, salt);
  return { hash, salt };
}

export async function verifyPin(pin: string, hash: string, salt: string): Promise<boolean> {
  const candidate = await hashPin(pin, salt);
  return candidate === hash;
}
