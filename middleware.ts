export const config = {
  // Skip static build output; everything else runs the session check.
  matcher: ["/((?!assets/|favicon\\.ico|vite\\.svg).*)"],
};

// Rutas públicas (sin sesión): la vista de login, el demo y sus APIs.
const PUBLIC_PAGES = ["/login", "/demo"];
const PUBLIC_APIS = ["/api/login", "/api/logout"];

export default async function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  const isPublic =
    PUBLIC_APIS.includes(pathname) ||
    PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const cookie = readCookie(request.headers.get("cookie"), "session");
  const authed = await verifyToken(cookie, process.env.AUTH_SECRET ?? "");

  if (isPublic) {
    // Si ya está autenticado y entra a /login, mandarlo al dashboard.
    if (authed && pathname === "/login") {
      return Response.redirect(new URL("/", request.url), 302);
    }
    return;
  }

  if (authed) return; // ruta protegida + sesión válida

  // No autenticado en ruta protegida.
  if (pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return Response.redirect(new URL("/login", request.url), 302);
}

function readCookie(header: string | null, name: string): string {
  if (!header) return "";
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return "";
}

// Verifica un token `${exp}.${hmacHex}` firmado con HMAC-SHA256(secret).
async function verifyToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payload || !sig) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const macBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = [...new Uint8Array(macBuf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (expected !== sig) return false;

  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
}
