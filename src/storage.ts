import type { Investment, Snapshot } from "./types";

const STORAGE_KEY = "investment-dashboard-v2";
const HISTORY_KEY = "investment-history-v2";

// --- Validators ---

export function isValidInvestment(v: unknown): v is Investment {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    Number.isInteger(o.id) && (o.id as number) > 0 &&
    typeof o.name === "string" &&
    typeof o.platform === "string" &&
    typeof o.aporte === "number" && Number.isFinite(o.aporte) && (o.aporte as number) > 0 &&
    typeof o.valorActual === "number" && Number.isFinite(o.valorActual) && (o.valorActual as number) >= 0 &&
    typeof o.tipo === "string" &&
    typeof o.color === "string" &&
    typeof o.updatedAt === "string"
  );
}

export function isValidSnapshot(v: unknown): v is Snapshot {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (
    typeof o.fecha !== "string" ||
    typeof o.totalActual !== "number" || !Number.isFinite(o.totalActual) ||
    typeof o.totalAporte !== "number" || !Number.isFinite(o.totalAporte) ||
    typeof o.ganancia !== "number" || !Number.isFinite(o.ganancia) ||
    typeof o.pct !== "number" || !Number.isFinite(o.pct)
  ) return false;
  if (!Array.isArray(o.investments)) o.investments = [];
  return true;
}

// --- LocalStorage ---

export function loadLocalData(): { investments: Investment[]; history: Snapshot[] } {
  let investments: Investment[] = [];
  let history: Snapshot[] = [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(parsed) && parsed.every(isValidInvestment)) investments = parsed;
  } catch { /* ignore */ }
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "null");
    if (Array.isArray(parsed) && parsed.every(isValidSnapshot)) history = parsed;
  } catch { /* ignore */ }
  return { investments, history };
}

export function saveLocalData(investments: Investment[], history: Snapshot[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(investments)); } catch { /* ignore */ }
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ }
}

// --- Sheets API ---

async function fetchFromSheets(): Promise<{ investments: Investment[]; history: Snapshot[] } | null> {
  try {
    const res = await fetch("/api/sheets?action=read");
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    if (!Array.isArray(d.investments) || !Array.isArray(d.history)) return null;
    return {
      investments: (d.investments as unknown[]).filter(isValidInvestment),
      history: (d.history as unknown[]).filter(isValidSnapshot),
    };
  } catch {
    return null; // local dev or Sheets not configured
  }
}

async function postToSheets(investments: Investment[], history: Snapshot[]): Promise<void> {
  try {
    await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ investments, history }),
    });
  } catch { /* ignore — localStorage is the fallback */ }
}

// --- Public API ---

/**
 * Load data preferring Sheets. Falls back to localStorage in local dev
 * or when Sheets is not configured. Auto-migrates localStorage → Sheets
 * on first use.
 */
export async function loadData(
  local: { investments: Investment[]; history: Snapshot[] }
): Promise<{ investments: Investment[]; history: Snapshot[] }> {
  const remote = await fetchFromSheets();

  if (remote === null) return local; // Sheets not configured

  // First use: migrate existing localStorage data to Sheets
  if (remote.investments.length === 0 && local.investments.length > 0) {
    await postToSheets(local.investments, local.history);
    return local;
  }

  saveLocalData(remote.investments, remote.history); // keep local cache in sync
  return remote;
}

/** Persist to localStorage immediately, then sync to Sheets in the background. */
export function saveData(investments: Investment[], history: Snapshot[]): void {
  saveLocalData(investments, history);
  void postToSheets(investments, history);
}
