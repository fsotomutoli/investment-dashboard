import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";

const USER = process.env.BASIC_AUTH_USER ?? "";
const PASS = process.env.BASIC_AUTH_PASSWORD ?? "";
const SECRET = process.env.AUTH_SECRET ?? "";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!USER || !PASS || !SECRET) {
    return res.status(503).json({ error: "Auth not configured" });
  }

  const body = (req.body ?? {}) as { user?: unknown; password?: unknown };
  const user = typeof body.user === "string" ? body.user : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!safeEqual(user, USER) || !safeEqual(password, PASS)) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const exp = String(Date.now() + MAX_AGE * 1000);
  const sig = crypto.createHmac("sha256", SECRET).update(exp).digest("hex");
  const token = `${exp}.${sig}`;

  res.setHeader(
    "Set-Cookie",
    `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`
  );
  return res.json({ ok: true });
}

// Comparación de tiempo constante para no filtrar info por timing.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
