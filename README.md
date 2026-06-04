# 📊 Investment Dashboard

A personal investment portfolio tracker built with React. Clean dark UI, persistent local storage, and a clear separation between **market value updates** and **new contributions** — so your real return is always accurate.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Features

- **Portfolio overview** — total value, total return %, and gain in currency
- **Per-fund tracking** — individual return per investment with last-updated date
- **Two distinct update actions:**
  - 📈 *Update market value* — the fund went up or down, adjust the current price
  - ➕ *Register new contribution* — you added fresh capital, keeping the return % accurate
- **Automatic snapshots** — every update saves a historical record
- **History view** — see how your portfolio has evolved over time
- **Add / remove investments** — fully configurable to your own funds
- **Persistent storage** — data lives in `localStorage`, no backend needed

---

## Why separate value updates from contributions?

If your fund is worth $1,500,000 with a +50% return and you add $200,000 more, your actual return doesn't suddenly drop — the new capital just hasn't had time to grow yet. This app tracks both your **cost basis** and **market value** independently, so the math is always honest.

---

## Tech stack

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- `localStorage` for persistence (no backend, no auth)
- Google Fonts — DM Sans + DM Mono

---

## Getting started

```bash
# Clone the repo
git clone https://github.com/your-username/investment-dashboard.git
cd investment-dashboard

# Install dependencies
npm install

# Run locally
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Configuring your investments

Edit the `INITIAL_INVESTMENTS` array in `src/App.jsx`:

```js
const INITIAL_INVESTMENTS = [
  {
    id: 1,
    name: "My Fund",        // Fund name
    platform: "Platform",   // Where it's held
    aporte: 1000000,        // Your total cost basis (CLP)
    valorActual: 1000000,   // Current market value (CLP)
    tipo: "Moderado",       // Risk type label
    color: "#4ECDC4",       // Color for the UI
    updatedAt: new Date().toISOString()
  },
  // Add more funds...
];
```

Available `tipo` values: `"Alto riesgo"`, `"Moderado"`, `"Conservador"`, `"Acción"`

> ⚠️ **Privacy note:** Do not commit real financial data to a public repository. The values in this file are placeholders — configure your actual numbers directly in the app after launching it locally. Your data is stored only in your browser's `localStorage`.

---

## Deployment

Deploy to [Vercel](https://vercel.com/) in one click:

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments on every push.

---

## Roadmap

- [ ] Google Sheets sync for cross-device data
- [ ] Currency selector (CLP / USD / UF)
- [ ] Performance chart over time
- [ ] Export to CSV

---

## License

MIT — use it, fork it, make it yours.
