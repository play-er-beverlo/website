import crypto from "node:crypto";

export function timingSafeEqualHex(a: string, b: string): boolean {
  const norm = (s: string) => s.trim().replace(/^sha256=/i, "");
  const A = Buffer.from(norm(a), "hex");
  const B = Buffer.from(norm(b), "hex");

  if (A.length !== B.length || A.length === 0) {
    return false;
  }

  return crypto.timingSafeEqual(A, B);
}
