export const config = {
  // Run on all paths except /demo*, /assets/* (Vite build output), and static root files
  matcher: ["/((?!demo|assets|favicon\\.ico|vite\\.svg).*)"],
};

export default function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  // /demo is public — no auth required
  if (pathname === "/demo" || pathname.startsWith("/demo/")) {
    return;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice(6);
    const decoded = atob(encoded);
    const colon = decoded.indexOf(":");
    if (colon !== -1) {
      const user = decoded.slice(0, colon);
      const pass = decoded.slice(colon + 1);
      if (
        user === process.env.BASIC_AUTH_USER &&
        pass === process.env.BASIC_AUTH_PASSWORD
      ) {
        return; // authenticated — pass through
      }
    }
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Investment Dashboard", charset="UTF-8"',
    },
  });
}
