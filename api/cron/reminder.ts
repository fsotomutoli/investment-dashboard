import type { VercelRequest, VercelResponse } from "@vercel/node";

const DASHBOARD_URL =
  process.env.DASHBOARD_URL ?? "https://investment-dashboard-bay-alpha.vercel.app";

const NUDGE = "Es viernes — hora de actualizar tus balances en el dashboard.";

/**
 * Cron de Vercel (viernes). Envía un recordatorio por email (Resend) y por
 * WhatsApp (CallMeBot). Cada canal es independiente: si uno falla, el otro
 * igual se envía. Los canales sin configurar se omiten silenciosamente.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo Vercel Cron (inyecta Authorization: Bearer ${CRON_SECRET} si está seteado).
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const results = {
    email: await sendEmail().catch((e) => `error: ${String(e)}`),
    whatsapp: await sendWhatsApp().catch((e) => `error: ${String(e)}`),
  };

  return res.json({ ok: true, results });
}

async function sendEmail(): Promise<string> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.REMINDER_EMAIL_TO;
  const from = process.env.REMINDER_EMAIL_FROM ?? "onboarding@resend.dev";
  if (!key || !to) return "skipped (sin config)";

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `Portafolio Personal <${from}>`,
      to,
      subject: "📊 Viernes — actualiza tus balances",
      html:
        `<p>${NUDGE}</p>` +
        `<p><a href="${DASHBOARD_URL}">Abrir dashboard →</a></p>`,
    }),
  });
  if (!r.ok) return `error ${r.status}: ${(await r.text()).slice(0, 200)}`;
  return "enviado";
}

async function sendWhatsApp(): Promise<string> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return "skipped (sin config)";

  const text = `📊 ${NUDGE} ${DASHBOARD_URL}`;
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;

  const r = await fetch(url);
  if (!r.ok) return `error ${r.status}: ${(await r.text()).slice(0, 200)}`;
  return "enviado";
}
