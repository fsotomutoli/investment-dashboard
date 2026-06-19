import type { VercelRequest, VercelResponse } from "@vercel/node";

const SHEETS_URL = process.env.SHEETS_URL ?? "";
const SHEETS_TOKEN = process.env.SHEETS_TOKEN ?? "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!SHEETS_URL || !SHEETS_TOKEN) {
    return res.status(503).json({ error: "Sheets not configured" });
  }

  try {
    if (req.method === "GET") {
      const upstream = await fetch(
        `${SHEETS_URL}?action=read&token=${encodeURIComponent(SHEETS_TOKEN)}`
      );
      const data: unknown = await upstream.json();
      res.setHeader("Cache-Control", "no-store");
      return res.json(data);
    }

    if (req.method === "POST") {
      const upstream = await fetch(
        `${SHEETS_URL}?token=${encodeURIComponent(SHEETS_TOKEN)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        }
      );
      const data: unknown = await upstream.json();
      return res.json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Sheets proxy error:", err);
    return res.status(502).json({ error: "Upstream error" });
  }
}
